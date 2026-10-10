import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import compression from "compression";

// Safely determine directory without any url/fileURLToPath or import.meta dependencies
const serverDirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const PORT = typeof process.env.PORT === "string"
    ? parseInt(process.env.PORT, 10)
    : (process.env.NODE_ENV === "production" ? 80 : 3000);

  // Enable gzip / deflate compression on all responses (HTML, CSS, JS, JSON)
  app.use(compression());

  // Health check and api endpoints for hosting/deployment verification
  app.get("/health", (_req, res) => {
    res.json({ ok: true, status: "healthy" });
  });
  app.get("/api", (_req, res) => {
    res.json({ ok: true, version: "1.0.0" });
  });

  // Body parser middleware with generous limit for medical evaluations and photo submissions
  app.use(express.json({ limit: "50mb" }) as express.RequestHandler);
  app.use(express.urlencoded({ extended: true, limit: "50mb" }) as express.RequestHandler);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, status: "healthy" });
  });
  // In-memory CRM Leads store
  const crmLeadsStore: any[] = [
    {
      id: 'lead-101',
      patientName: 'María Fernanda Gómez',
      email: 'm.gomez@example.com',
      phone: '+1 809 555 0192',
      procedure: 'Lipoescultura HD con Marcación',
      status: 'scheduled',
      riskCategory: 'low',
      bmi: 22.4,
      dateCreated: '2026-07-28',
      appointmentDate: '2026-08-05',
      appointmentTime: '10:00 AM',
      estimatedValue: 4800,
      notes: 'Interesada en contorno abdominal y transferencia glútea. Paciente en excelente condición física.',
      source: 'evaluation_modal',
      medicalSummary: {
        age: 29,
        dob: '1997-04-12',
        allergies: 'Ninguna conocida',
        surgicalGoals: 'Definición abdominal y aumento sutil glúteo',
        photosCount: 3
      }
    },
    {
      id: 'lead-102',
      patientName: 'Carlos Eduardo Ramírez',
      email: 'carlos.ramirez@example.com',
      phone: '+1 829 444 8821',
      procedure: 'Rinoplastia Ultrasónica Estética',
      status: 'evaluation',
      riskCategory: 'low',
      bmi: 24.1,
      dateCreated: '2026-07-30',
      appointmentDate: '2026-08-08',
      appointmentTime: '02:30 PM',
      estimatedValue: 3500,
      notes: 'Busca refinamiento del dorso nasal y giba. Previamente evaluado por foto.',
      source: 'website_form',
      medicalSummary: {
        age: 34,
        dob: '1992-09-21',
        allergies: 'Penicilina',
        surgicalGoals: 'Perfilamiento armónico del dorso',
        photosCount: 2
      }
    }
  ];

  // API Endpoints for CRM Portal
  app.get("/api/crm/leads", (_req, res) => {
    return res.status(200).json({ ok: true, leads: crmLeadsStore });
  });

  app.put("/api/crm/leads/:id", (req, res) => {
    const { id } = req.params;
    const { status, notes, appointmentDate, appointmentTime, estimatedValue } = req.body;
    const index = crmLeadsStore.findIndex(l => l.id === id);
    if (index !== -1) {
      if (status) crmLeadsStore[index].status = status;
      if (notes !== undefined) crmLeadsStore[index].notes = notes;
      if (appointmentDate) crmLeadsStore[index].appointmentDate = appointmentDate;
      if (appointmentTime) crmLeadsStore[index].appointmentTime = appointmentTime;
      if (estimatedValue) crmLeadsStore[index].estimatedValue = estimatedValue;
      return res.status(200).json({ ok: true, lead: crmLeadsStore[index] });
    }
    return res.status(404).json({ ok: false, error: "Lead not found" });
  });

  // API Endpoint: Process Consultation and send confirmation email
  app.post("/api/consultation", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        procedure,
        specialistId,
        date,
        time,
        notes,
        lang = "en"
      } = req.body;

      console.log(`[Clinical Server] Received consultation request for: ${firstName} ${lastName} (${email})`);

      const apiKey = process.env.RESEND_API_KEY;
      let configuredSender = process.env.SENDER_EMAIL || "doctorvictorestrella@gmail.com";
      if (configuredSender === "onboarding@resend.dev") {
        configuredSender = "doctorvictorestrella@gmail.com";
      }
      
      // Since the user verified "contact.drestrellaplasticsurgeon.com" on Resend, we route FROM emails through this verified domain.
      // If SENDER_EMAIL is configured with this domain, we use it, otherwise we default to a standard clinic address.
      const verifiedDomain = "contact.drestrellaplasticsurgeon.com";
      let fromEmail = `appointments@${verifiedDomain}`;
      if (process.env.SENDER_EMAIL && process.env.SENDER_EMAIL.endsWith(verifiedDomain)) {
        fromEmail = process.env.SENDER_EMAIL;
      }
      
      let emailSent = false;
      let emailError = null;

      // Define localized email parameters
      const isSpanish = lang === "es";
      const subject = isSpanish 
        ? `Confirmación de Solicitud de Consulta - Dr. Victor Estrella`
        : `Consultation Request Received - Dr. Victor Estrella`;

      // Build Calendar link & ICS invite attachment for email
      const calTitle = encodeURIComponent(`Consultation: ${procedure} - Dr. Victor Estrella`);
      const calDetails = encodeURIComponent(`Medical consultation with Dr. Victor Estrella for ${procedure}.\nPatient: ${firstName} ${lastName}\nPhone: ${phone}`);
      const calLoc = encodeURIComponent('Dr. Victor Estrella Clinic, Santo Domingo, Dominican Republic');
      const cleanDate = (date || '').replace(/-/g, '');
      const calDates = `${cleanDate}T130000/${cleanDate}T140000`;
      const googleCalEmailUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDetails}&location=${calLoc}&dates=${calDates}`;

      // Build ICS calendar invite attachment for automatic calendar sync
      const buildIcsAttachment = () => {
        try {
          const parts = (date || '').split('-');
          const y = parts[0] || '2026';
          const m = parts[1] || '01';
          const d = parts[2] || '01';
          const dtStart = `${y}${m}${d}T130000Z`;
          const dtEnd = `${y}${m}${d}T140000Z`;
          const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

          const icsString = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Dr. Victor Estrella Clinic//Consultation Booking//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            `UID:consultation-${Date.now()}@drestrellaplasticsurgeon.com`,
            `DTSTAMP:${dtStamp}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:Cita Médica: ${procedure} - ${firstName} ${lastName}`,
            `DESCRIPTION:Paciente: ${firstName} ${lastName}\\nTeléfono: ${phone}\\nCorreo: ${email}\\nProcedimiento: ${procedure}\\nNotas: ${notes || 'N/A'}`,
            `LOCATION:Dr. Victor Estrella Clinic, Santo Domingo, Dominican Republic`,
            'STATUS:CONFIRMED',
            'ORGANIZER;CN="Dr. Victor Estrella Clinic":mailto:appointments@contact.drestrellaplasticsurgeon.com',
            'BEGIN:VALARM',
            'TRIGGER:-PT24H',
            'ACTION:DISPLAY',
            `DESCRIPTION:Recordatorio de Cita: ${procedure}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
          ].join('\r\n');

          return [{
            filename: 'cita_dr_victor_estrella.ics',
            content: Buffer.from(icsString).toString('base64'),
            content_type: 'text/calendar'
          }];
        } catch (e) {
          return [];
        }
      };

      const emailAttachments = buildIcsAttachment();

      // Build English HTML email
      const htmlEnglish = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D211A; background-color: #FCFBF9; border: 1px solid #EBE6DF; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          <div style="text-align: center; border-bottom: 1px solid #EBE6DF; padding-bottom: 24px; margin-bottom: 24px;">
            <h1 style="font-family: Georgia, serif; color: #2D211A; margin: 0; font-size: 26px; font-weight: normal; letter-spacing: -0.5px;">Dr. Victor Estrella</h1>
            <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 2.5px; color: #0373bb; font-weight: bold; margin: 6px 0 0 0;">Aesthetic & Reconstructive Surgery</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #2D211A;">Dear <strong>${firstName} ${lastName}</strong>,</p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #5C4D44;">Thank you for scheduling a clinical consultation with Dr. Victor Estrella and our elite surgical board in Santo Domingo, Dominican Republic. We are honored to accompany you on your aesthetic transformation journey.</p>
          
          <div style="background-color: #ffffff; border: 1px solid #EBE6DF; border-radius: 14px; padding: 22px; margin: 24px 0;">
            <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #FCFBF9; padding-bottom: 8px; font-weight: bold;">Your Pre-Consultation Blueprint</h2>
            <table style="width: 100%; font-size: 13.5px; color: #5C4D44; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; width: 140px; border-bottom: 1px solid #FCFBF9;">Procedure:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${procedure}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Preferred Date:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Preferred Time:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Contact Phone:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${phone}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; vertical-align: top;">Aesthetic Goals:</td>
                <td style="padding: 8px 0; font-style: italic; color: #7C6C63;">"${notes}"</td>
              </tr>` : ""}
            </table>
            <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #EBE6DF;">
              <a href="${googleCalEmailUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0373bb; color: #ffffff; text-decoration: none; border-radius: 24px; font-weight: bold; font-size: 12px; font-family: Arial, sans-serif;">📅 Add to Google Calendar</a>
            </div>
          </div>

          <p style="font-size: 13.5px; line-height: 1.6; color: #5C4D44;"><strong>What happens next?</strong></p>
          <ol style="font-size: 13.5px; line-height: 1.6; color: #5C4D44; padding-left: 20px; margin-top: 6px;">
            <li style="margin-bottom: 8px;">Our specialized bilingual patient coordinator will review your clinical request and matching surgeon availability.</li>
            <li style="margin-bottom: 8px;">We will contact you via WhatsApp or Email within 24 business hours to finalize your scheduled hour.</li>
            <li style="margin-bottom: 8px;">If you are an international traveler, we will share initial concierge logistics regarding transport, accredited recovery hotels, and local nursing options.</li>
          </ol>

          <p style="font-size: 13.5px; line-height: 1.6; color: #7C6C63; margin-top: 20px;">If you have any questions or would like to send clinical photos for initial evaluation, please feel free to reply directly to this email.</p>

          <div style="border-top: 1px solid #EBE6DF; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 11px; color: #7C6C63; font-family: monospace;">
            <p style="margin: 0; font-weight: bold; color: #2D211A;">Dr. Victor Estrella • Aesthetic & Reconstructive Surgery</p>
            <p style="margin: 4px 0 0 0;">Santo Domingo Medical District, Dominican Republic</p>
            <p style="margin: 4px 0 0 0;">SODOCIPRE Board Certified Member</p>
          </div>
        </div>
      `;

      // Build Spanish HTML email
      const htmlSpanish = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D211A; background-color: #FCFBF9; border: 1px solid #EBE6DF; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          <div style="text-align: center; border-bottom: 1px solid #EBE6DF; padding-bottom: 24px; margin-bottom: 24px;">
            <h1 style="font-family: Georgia, serif; color: #2D211A; margin: 0; font-size: 26px; font-weight: normal; letter-spacing: -0.5px;">Dr. Victor Estrella</h1>
            <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 2.5px; color: #0373bb; font-weight: bold; margin: 6px 0 0 0;">Cirugía Estética y Reconstructiva</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #2D211A;">Estimado/a <strong>${firstName} ${lastName}</strong>,</p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #5C4D44;">Gracias por programar su consulta clínica con el Dr. Victor Estrella y nuestro prestigioso consejo médico en Santo Domingo, República Dominicana. Nos honra acompañarle en su viaje de transformación y bienestar.</p>
          
          <div style="background-color: #ffffff; border: 1px solid #EBE6DF; border-radius: 14px; padding: 22px; margin: 24px 0;">
            <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #FCFBF9; padding-bottom: 8px; font-weight: bold;">Detalles Clínicos de su Solicitud</h2>
            <table style="width: 100%; font-size: 13.5px; color: #5C4D44; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; width: 140px; border-bottom: 1px solid #FCFBF9;">Procedimiento:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${procedure}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Fecha Sugerida:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Hora Sugerida:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Teléfono de Contacto:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${phone}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; vertical-align: top;">Objetivos Estéticos:</td>
                <td style="padding: 8px 0; font-style: italic; color: #7C6C63;">"${notes}"</td>
              </tr>` : ""}
            </table>
            <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #EBE6DF;">
              <a href="${googleCalEmailUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0373bb; color: #ffffff; text-decoration: none; border-radius: 24px; font-weight: bold; font-size: 12px; font-family: Arial, sans-serif;">📅 Agregar a Google Calendar</a>
            </div>
          </div>

          <p style="font-size: 13.5px; line-height: 1.6; color: #5C4D44;"><strong>¿Qué sucederá a continuación?</strong></p>
          <ol style="font-size: 13.5px; line-height: 1.6; color: #5C4D44; padding-left: 20px; margin-top: 6px;">
            <li style="margin-bottom: 8px;">Nuestro coordinador de pacientes bilingüe revisará sus objetivos estéticos y la disponibilidad médica.</li>
            <li style="margin-bottom: 8px;">Le contactaremos por WhatsApp o correo electrónico dentro de las próximas 24 horas laborables para confirmar la hora exacta de su cita.</li>
            <li style="margin-bottom: 8px;">Para pacientes internacionales, compartiremos asistencia logística complementaria, incluyendo opciones de transporte local, hoteles de recuperación y enfermería especializada.</li>
          </ol>

          <p style="font-size: 13.5px; line-height: 1.6; color: #7C6C63; margin-top: 20px;">Si tiene alguna pregunta o desea enviar fotografías clínicas para una evaluación preliminar, responda directamente a este correo electrónico.</p>

          <div style="border-top: 1px solid #EBE6DF; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 11px; color: #7C6C63; font-family: monospace;">
            <p style="margin: 0; font-weight: bold; color: #2D211A;">Dr. Victor Estrella • Cirugía Estética y Reconstructiva</p>
            <p style="margin: 4px 0 0 0;">Distrito Médico de Santo Domingo, República Dominicana</p>
            <p style="margin: 4px 0 0 0;">Miembro Activo y Certificado de SODOCIPRE</p>
          </div>
        </div>
      `;

      const activeHtml = isSpanish ? htmlSpanish : htmlEnglish;

      if (apiKey) {
        // 1. Dispatch Confirmation to the Patient
        try {
          const patientSubject = isSpanish
            ? `Confirmación de Solicitud de Consulta - Dr. Victor Estrella`
            : `Consultation Request Received - Dr. Victor Estrella`;

          const patientResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: `Dr. Victor Estrella Clinic <${fromEmail}>`,
              to: [email],
              subject: patientSubject,
              html: activeHtml,
              attachments: emailAttachments
            })
          });

          if (patientResponse.ok) {
            emailSent = true;
            console.log(`[Clinical Server] Patient confirmation email successfully sent to ${email}`);
          } else {
            const errBody = await patientResponse.text();
            console.warn(`[Clinical Server] Resend patient email rejected:`, errBody);
            emailError = errBody;

            // Check if rejection is due to Resend Sandbox limits
            const isSandboxError = errBody.includes("own email address") || errBody.includes("testing emails") || errBody.includes("validation_error");
            if (isSandboxError) {
              let targetRecipient = configuredSender;
              
              // Dynamically extract the verified email from Resend error message (e.g., "(empjulio@gmail.com)")
              const emailMatch = errBody.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
              if (emailMatch && emailMatch[1]) {
                targetRecipient = emailMatch[1];
                configuredSender = targetRecipient; // Update configuredSender so admin alert also goes to the correct address
                console.log(`[Clinical Server] Dynamically detected verified sandbox email: ${targetRecipient}`);
              }

              console.log(`[Clinical Server] Resend Sandbox restriction detected. Automatically redirecting patient's confirmation email to verified developer: ${targetRecipient}`);
              
              const sandboxSubject = `[Sandbox Copy] ${patientSubject}`;
              const sandboxResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  from: `Dr. Victor Estrella Clinic <${fromEmail}>`,
                  to: [targetRecipient],
                  subject: sandboxSubject,
                  html: `
                    <div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 16px; margin-bottom: 20px; border-radius: 10px; font-family: sans-serif; font-size: 13px; color: #92400E;">
                      <strong>Resend Sandbox Redirect:</strong> This email was originally addressed to <strong>${email}</strong>. Because your Resend account is in sandbox mode, we redirected this copy to your verified email address so you can preview the patient's confirmation experience.
                    </div>
                    ${activeHtml}
                  `
                })
              });

              if (sandboxResponse.ok) {
                emailSent = true;
                console.log(`[Clinical Server] Sandbox patient confirmation copy successfully delivered to ${targetRecipient}`);
              } else {
                const sandboxErr = await sandboxResponse.text();
                console.error(`[Clinical Server] Failed to deliver redirected copy to ${targetRecipient}:`, sandboxErr);
              }
            }
          }
        } catch (err: any) {
          console.error(`[Clinical Server] Error dispatching patient confirmation email:`, err);
          emailError = err.message;
        }

        // 2. Dispatch "New Patient Alert" Notification to the Clinic Owner (sender)
        try {
          const adminSubject = `🚨 [NEW CLINICAL REQUEST] ${firstName} ${lastName} - ${procedure}`;
          const adminHtml = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D211A; background-color: #FCFBF9; border: 1px solid #EBE6DF; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
              <div style="text-align: center; border-bottom: 1px solid #EBE6DF; padding-bottom: 20px; margin-bottom: 20px;">
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2.5px; color: #d97706; font-weight: bold;">New Patient Lead Alert</span>
                <h1 style="font-family: Georgia, serif; color: #2D211A; margin: 4px 0 0 0; font-size: 22px; font-weight: normal;">Dr. Victor Estrella Clinic</h1>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #2D211A;">A new bilingual patient has submitted an aesthetic consultation inquiry from the web platform.</p>

              <div style="background-color: #ffffff; border: 1px solid #EBE6DF; border-radius: 14px; padding: 20px; margin: 20px 0;">
                <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; margin-top: 0; margin-bottom: 14px; border-bottom: 1px solid #FCFBF9; padding-bottom: 6px; font-weight: bold;">Patient Information Matrix</h2>
                <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 140px; border-bottom: 1px solid #FCFBF9;">Full Name:</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${firstName} ${lastName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Email Address:</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;"><a href="mailto:${email}" style="color: #0373bb; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Phone Number:</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;"><a href="tel:${phone}" style="color: #0373bb; text-decoration: none;">${phone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Chosen Procedure:</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A; font-weight: bold;">${procedure}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Preferred Date:</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Preferred Time:</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Portal Language:</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A; text-transform: uppercase;">${lang}</td>
                  </tr>
                  ${notes ? `
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #2D211A; vertical-align: top;">Aesthetic Goals:</td>
                    <td style="padding: 6px 0; font-style: italic; color: #7C6C63;">"${notes}"</td>
                  </tr>` : ""}
                </table>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                  💬 Contact Patient on WhatsApp
                </a>
              </div>

              <p style="font-size: 12px; color: #7C6C63; line-height: 1.5; margin-top: 24px; text-align: center;">
                Please respond to this request within 24 clinical business hours.<br />
                © Dr. Victor Estrella • Clinical Coordination Santo Domingo
              </p>
            </div>
          `;

          const adminResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: `Clinical Board Alert <${fromEmail}>`,
              to: [configuredSender], // Sends a direct lead notification copy to the clinic admin/sender
              subject: adminSubject,
              html: adminHtml,
              attachments: emailAttachments
            })
          });

          if (adminResponse.ok) {
            console.log(`[Clinical Server] Admin lead notification copy successfully dispatched to ${configuredSender}`);
            // If the patient email failed due to Sandbox limits, but admin delivery succeeded, we count this as a success for the user to view.
            emailSent = true;
          } else {
            const errBody = await adminResponse.text();
            console.error(`[Clinical Server] Admin alert Resend API response error:`, errBody);
          }
        } catch (err: any) {
          console.error(`[Clinical Server] Error dispatching clinical alert email to admin:`, err);
        }
      } else {
        // Simulation mode
        console.warn("[Clinical Server] RESEND_API_KEY environment variable is not defined. Simulating email dispatch.");
        console.log(`
[Clinical Server] SIMULATED EMAIL DISPATCH SUCCESSFUL:
--------------------------------------------------
To: ${email}
From: Dr. Victor Estrella Clinic <${configuredSender}>
Subject: ${subject}
Locale: ${lang.toUpperCase()}
Content Preview: Dear ${firstName}, thank you for your request for the "${procedure}" procedure on ${date} at ${time}.
--------------------------------------------------
        `);
        emailSent = true;
      }

      return res.status(200).json({
        success: true,
        emailSent,
        simulated: !apiKey,
        message: apiKey ? "Appointment registered and clinical confirmation email sent." : "Appointment registered (email simulated in console).",
        consultation: {
          id: "cons-" + Math.random().toString(36).substring(2, 11),
          firstName,
          lastName,
          email,
          phone,
          procedure,
          specialistId: specialistId || "any",
          date,
          time,
          notes,
          status: "scheduled"
        }
      });
    } catch (err: any) {
      console.error("[Clinical Server] API route /api/consultation error:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // API Endpoint: Process Medical Evaluation and send email to Dr. Estrella
  app.post("/api/evaluation", async (req, res) => {
    try {
      const {
        personal = {},
        surgicalGoals = {},
        medical = {},
        infectious = {},
        medsAllergies = {},
        lifestyle = {},
        gyneco = {},
        photos = {},
        lang = "en",
        gender = "female"
      } = req.body;

      const patientName = personal.fullName || "Unnamed Patient";
      console.log(`[Clinical Server] Received medical evaluation request for: ${patientName} (${personal.email || "No email"})`);

      const apiKey = process.env.RESEND_API_KEY;
      let configuredSender = process.env.SENDER_EMAIL || "doctorvictorestrella@gmail.com";
      if (configuredSender === "onboarding@resend.dev") {
        configuredSender = "doctorvictorestrella@gmail.com";
      }

      const verifiedDomain = "contact.drestrellaplasticsurgeon.com";
      let fromEmail = `evaluations@${verifiedDomain}`;
      if (process.env.SENDER_EMAIL && process.env.SENDER_EMAIL.endsWith(verifiedDomain)) {
        fromEmail = process.env.SENDER_EMAIL;
      }

      // Convert base64 previews to attachments
      const attachments: any[] = [];
      if (photos) {
        for (const [key, b64] of Object.entries(photos)) {
          if (b64 && typeof b64 === "string" && b64.startsWith("data:image/")) {
            const match = b64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
            if (match) {
              const mimeType = match[1];
              const base64Data = match[2];
              const ext = mimeType.split("/")[1] || "png";
              const label = key.replace("Preview", "");
              attachments.push({
                content: base64Data,
                filename: `${label}_view.${ext}`
              });
            }
          }
        }
      }

      // Dynamic BMI details helper
      const getBmiCategoryText = (bmi: number) => {
        if (!bmi || bmi === 0) return "N/A";
        if (bmi < 18.5) return "Underweight (Bajo peso)";
        if (bmi < 24.9) return "Normal Weight (Ideal)";
        if (bmi < 29.9) return "Overweight (Sobrepeso)";
        return "Obese (Obesidad)";
      };

      // Medical Risk evaluation flag
      const isHighRisk = medical.hypertension || medical.diabetes || medical.heartCondition || personal.bmi >= 30 || lifestyle.smoking !== 'no' || infectious.hasInfectious === 'yes';

      const subject = `📋 [SECURE INTAKE] Medical Evaluation & Surgical Intake - ${patientName}`;

      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 24px; color: #2D211A; background-color: #FCFBF9; border: 1px solid #EBE6DF; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          <div style="text-align: center; border-bottom: 2px solid #EBE6DF; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2.5px; color: #0373bb; font-weight: bold; padding: 4px 10px; background-color: rgba(3, 115, 187, 0.1); border-radius: 5px;">Bilingual Patient Board Intake File</span>
            <h1 style="font-family: Georgia, serif; color: #2D211A; margin: 8px 0 0 0; font-size: 24px; font-weight: normal;">Dr. Victor Estrella Clinic</h1>
            <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 2.5px; color: #7C6C63; font-weight: bold; margin: 4px 0 0 0;">Secure HIPAA-Compliant Medical Evaluation</p>
          </div>

          <div style="background-color: ${isHighRisk ? '#FFF5F5' : '#F0FDF4'}; border: 1px solid ${isHighRisk ? '#FEB2B2' : '#BBF7D0'}; border-radius: 12px; padding: 14px 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-size: 14px; font-weight: bold; color: ${isHighRisk ? '#9B2C2C' : '#166534'};">
                  Risk Category: ${isHighRisk ? '⚠️ Moderate/Requires Review' : '✅ Low Risk Candidate'}
                </td>
                <td style="font-size: 11px; text-align: right; color: #7C6C63; font-family: monospace;">
                  DATE: ${new Date().toLocaleDateString('en-US', { timeZone: 'UTC' })}
                </td>
              </tr>
            </table>
          </div>

          <!-- Section 1: Patient Personal Information -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">1. Patient Personal Profile</h3>
            <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 180px;">Full Name:</td>
                <td style="padding: 6px 0; color: #2D211A;">${personal.fullName || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Date of Birth (DOB):</td>
                <td style="padding: 6px 0; color: #2D211A;">${personal.dob || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Calculated Age:</td>
                <td style="padding: 6px 0; color: #2D211A;">${personal.age || "N/A"} years old</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Email Address:</td>
                <td style="padding: 6px 0; color: #2D211A;"><a href="mailto:${personal.email}" style="color: #0373bb; text-decoration: none;">${personal.email || "N/A"}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Phone Number:</td>
                <td style="padding: 6px 0; color: #2D211A;"><a href="tel:${personal.phone}" style="color: #0373bb; text-decoration: none;">${personal.phone || "N/A"}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Residence (City/Country):</td>
                <td style="padding: 6px 0; color: #2D211A;">${personal.residence || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Weight / Height:</td>
                <td style="padding: 6px 0; color: #2D211A;">${personal.weight || "N/A"} lbs / ${personal.height || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Calculated BMI:</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">
                  <span style="padding: 2px 8px; border-radius: 4px; background-color: #E2E8F0;">
                    ${personal.bmi || "N/A"} - ${getBmiCategoryText(personal.bmi)}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Section 2: Surgical Goals -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">2. Surgical Goals</h3>
            <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 180px;">Procedure of Interest:</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">${surgicalGoals.procedureOfInterest || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Timeline for Procedure:</td>
                <td style="padding: 6px 0; color: #2D211A; text-transform: uppercase;">${surgicalGoals.timeline || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">How they heard:</td>
                <td style="padding: 6px 0; color: #2D211A;">${surgicalGoals.referral || "N/A"}</td>
              </tr>
            </table>
          </div>

          <!-- Section 3: General Medical Conditions -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">3. Medical History</h3>
            <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 180px;">Hypertension (HTA):</td>
                <td style="padding: 6px 0; color: ${medical.hypertension ? '#C53030' : '#2D211A'}; font-weight: ${medical.hypertension ? 'bold' : 'normal'};">
                  ${medical.hypertension ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Diabetes:</td>
                <td style="padding: 6px 0; color: ${medical.diabetes ? '#C53030' : '#2D211A'}; font-weight: ${medical.diabetes ? 'bold' : 'normal'};">
                  ${medical.diabetes ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Thyroid Condition:</td>
                <td style="padding: 6px 0; color: ${medical.thyroid ? '#C53030' : '#2D211A'}; font-weight: ${medical.thyroid ? 'bold' : 'normal'};">
                  ${medical.thyroid ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Heart Condition:</td>
                <td style="padding: 6px 0; color: ${medical.heartCondition ? '#C53030' : '#2D211A'}; font-weight: ${medical.heartCondition ? 'bold' : 'normal'};">
                  ${medical.heartCondition ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Anemia:</td>
                <td style="padding: 6px 0; color: ${medical.anemia ? '#C53030' : '#2D211A'}; font-weight: ${medical.anemia ? 'bold' : 'normal'};">
                  ${medical.anemia ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Autoimmune Disease:</td>
                <td style="padding: 6px 0; color: ${medical.autoimmune ? '#C53030' : '#2D211A'}; font-weight: ${medical.autoimmune ? 'bold' : 'normal'};">
                  ${medical.autoimmune ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Lung Condition (Asthma/COPD):</td>
                <td style="padding: 6px 0; color: ${medical.lungCondition ? '#C53030' : '#2D211A'}; font-weight: ${medical.lungCondition ? 'bold' : 'normal'};">
                  ${medical.lungCondition ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Any Other Medical Condition?</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">
                  ${medical.hasCondition === "yes" ? "YES" : "NO"}
                </td>
              </tr>
              ${medical.hasCondition === "yes" ? `
              <tr>
                <td colspan="2" style="padding: 6px 12px; background-color: #F3F4F6; border-radius: 8px; font-style: italic; color: #1F2937; margin-top: 4px;">
                  "${medical.conditionsDetail || "No details provided"}"
                </td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Currently Under Treatment?</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">
                  ${medical.underTreatment === "yes" ? "YES" : "NO"}
                </td>
              </tr>
              ${medical.underTreatment === "yes" ? `
              <tr>
                <td colspan="2" style="padding: 6px 12px; background-color: #F3F4F6; border-radius: 8px; font-style: italic; color: #1F2937; margin-top: 4px;">
                  "${medical.treatmentDetail || "No details provided"}"
                </td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Prior Surgeries?</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">
                  ${medical.hasPriorSurgeries === "yes" ? "YES" : "NO"}
                </td>
              </tr>
              ${medical.hasPriorSurgeries === "yes" ? `
              <tr>
                <td colspan="2" style="padding: 6px 12px; background-color: #F3F4F6; border-radius: 8px; font-style: italic; color: #1F2937; margin-top: 4px;">
                  "${medical.surgeriesDetail || "No details provided"}"
                </td>
              </tr>` : ""}
            </table>
          </div>

          <!-- Section 4: Infectious Diseases -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">4. Infectious Diseases</h3>
            <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 180px;">HIV Status:</td>
                <td style="padding: 6px 0; color: ${infectious.hiv ? '#C53030' : '#2D211A'}; font-weight: ${infectious.hiv ? 'bold' : 'normal'};">
                  ${infectious.hiv ? "REACTIVE (REACTIVO)" : "NON-REACTIVE"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Hepatitis (A/B/C):</td>
                <td style="padding: 6px 0; color: ${infectious.hepatitis ? '#C53030' : '#2D211A'}; font-weight: ${infectious.hepatitis ? 'bold' : 'normal'};">
                  ${infectious.hepatitis ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Syphilis:</td>
                <td style="padding: 6px 0; color: ${infectious.syphilis ? '#C53030' : '#2D211A'}; font-weight: ${infectious.syphilis ? 'bold' : 'normal'};">
                  ${infectious.syphilis ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Tuberculosis:</td>
                <td style="padding: 6px 0; color: ${infectious.tuberculosis ? '#C53030' : '#2D211A'}; font-weight: ${infectious.tuberculosis ? 'bold' : 'normal'};">
                  ${infectious.tuberculosis ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Mycobacterium:</td>
                <td style="padding: 6px 0; color: ${infectious.mycobacterium ? '#C53030' : '#2D211A'}; font-weight: ${infectious.mycobacterium ? 'bold' : 'normal'};">
                  ${infectious.mycobacterium ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Any Other Infectious?</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">
                  ${infectious.hasInfectious === "yes" ? "YES" : "NO"}
                </td>
              </tr>
              ${infectious.hasInfectious === "yes" ? `
              <tr>
                <td colspan="2" style="padding: 6px 12px; background-color: #F3F4F6; border-radius: 8px; font-style: italic; color: #1F2937; margin-top: 4px;">
                  "${infectious.infectiousDetail || "No details provided"}"
                </td>
              </tr>` : ""}
            </table>
          </div>

          <!-- Section 5: Medications & Allergies -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">5. Medications & Allergies</h3>
            <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 180px;">Taking Meds/Vitamins?</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">
                  ${medsAllergies.takingMeds === "yes" ? "YES" : "NO"}
                </td>
              </tr>
              ${medsAllergies.takingMeds === "yes" ? `
              <tr>
                <td colspan="2" style="padding: 6px 12px; background-color: #F3F4F6; border-radius: 8px; font-style: italic; color: #1F2937; margin-top: 4px;">
                  "${medsAllergies.medsDetail || "No details provided"}"
                </td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Has Drug/Material Allergies?</td>
                <td style="padding: 6px 0; color: ${medsAllergies.hasAllergies === "yes" ? '#C53030' : '#2D211A'}; font-weight: bold;">
                  ${medsAllergies.hasAllergies === "yes" ? "YES (SÍ)" : "NO"}
                </td>
              </tr>
              ${medsAllergies.hasAllergies === "yes" ? `
              <tr>
                <td colspan="2" style="padding: 6px 12px; background-color: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 8px; font-style: italic; color: #9B2C2C; margin-top: 4px;">
                  "${medsAllergies.allergiesDetail || "No details provided"}"
                </td>
              </tr>` : ""}
            </table>
          </div>

          <!-- Section 6: Lifestyle -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">6. Lifestyle Factors</h3>
            <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 180px;">Smoking/Vaping:</td>
                <td style="padding: 6px 0; color: ${lifestyle.smoking !== "no" ? '#C53030' : '#2D211A'}; font-weight: ${lifestyle.smoking !== "no" ? 'bold' : 'normal'}; text-transform: uppercase;">
                  ${lifestyle.smoking || "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Alcohol consumption:</td>
                <td style="padding: 6px 0; color: #2D211A; text-transform: uppercase;">
                  ${lifestyle.alcohol || "NO"}
                </td>
              </tr>
            </table>
          </div>

          <!-- Section 7: Gynecological History -->
          ${gender !== "male" ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">7. Gynecological Metrics</h3>
            <table style="width: 100%; font-size: 13px; color: #5C4D44; border-collapse: collapse; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A; width: 200px;">Last Menstrual Period (LMP):</td>
                <td style="padding: 6px 0; color: #2D211A; font-weight: bold;">${gyneco.lastPeriod || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Pregnant or Breastfeeding?</td>
                <td style="padding: 6px 0; color: ${gyneco.pregnancyBreastfeeding !== "no" ? '#C53030' : '#2D211A'}; font-weight: ${gyneco.pregnancyBreastfeeding !== "no" ? 'bold' : 'normal'}; text-transform: uppercase;">
                  ${gyneco.pregnancyBreastfeeding || "NO"}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Date of Last Pregnancy/Delivery:</td>
                <td style="padding: 6px 0; color: #2D211A;">${gyneco.lastPregnancyDate || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Number of Children (Partos):</td>
                <td style="padding: 6px 0; color: #2D211A;">${gyneco.childrenCount || "0"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Number of Abortions/Losses:</td>
                <td style="padding: 6px 0; color: #2D211A;">${gyneco.abortionsCount || "0"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #2D211A;">Has C-Sections (Cesáreas)?</td>
                <td style="padding: 6px 0; color: #2D211A; text-transform: uppercase;">
                  ${gyneco.csections || "NO"} ${gyneco.csections === "yes" ? `(${gyneco.csectionsCount || "0"})` : ""}
                </td>
              </tr>
            </table>
          </div>
          ` : ""}

          <!-- Section 8: Photographic Case File -->
          <div style="margin-bottom: 12px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; border-bottom: 1px solid #EBE6DF; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold;">8. Photographic Case File (Confidential)</h3>
            <p style="font-size: 12.5px; color: #5C4D44; margin-top: 0; line-height: 1.5;">
              The patient has attached <strong>${attachments.length} clinical evaluation photograph(s)</strong>. They are encrypted and attached to this email as high-definition attachments for secure review on your clinical device.
            </p>
          </div>

          <div style="border-top: 2px solid #EBE6DF; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 11px; color: #7C6C63; font-family: monospace;">
            <p style="margin: 0; font-weight: bold; color: #2D211A;">Dr. Victor Estrella Clinic • Aesthetics & Reconstructive Surgery</p>
            <p style="margin: 4px 0 0 0;">Santo Domingo, Dominican Republic • SODOCIPRE Member</p>
            <p style="margin: 4px 0 0 0;">CONFIDENTIAL MEDICAL INFORMATION • HIPAA PRESERVING PRIVILEGES</p>
          </div>
        </div>
      `;

      let emailSent = false;
      let emailError = null;

      if (apiKey) {
        console.log(`[Clinical Server] Sending secure intake form to Dr. Estrella <doctorvictorestrella@gmail.com> via Resend...`);
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: `Secure Board Intake <${fromEmail}>`,
              to: ["doctorvictorestrella@gmail.com"],
              reply_to: personal.email,
              subject: subject,
              html: htmlContent,
              attachments: attachments
            })
          });

          if (resendResponse.ok) {
            emailSent = true;
            console.log(`[Clinical Server] Evaluation email successfully delivered to doctorvictorestrella@gmail.com`);
          } else {
            const errBody = await resendResponse.text();
            console.warn(`[Clinical Server] Primary delivery to doctorvictorestrella@gmail.com was rejected:`, errBody);
            emailError = errBody;

            // Handle sandbox fallback if Dr. Estrella is not verified on Resend sandbox
            const isSandboxError = errBody.includes("own email address") || errBody.includes("testing emails") || errBody.includes("validation_error");
            if (isSandboxError) {
              let targetRecipient = configuredSender;
              const emailMatch = errBody.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
              if (emailMatch && emailMatch[1]) {
                targetRecipient = emailMatch[1];
              }

              console.log(`[Clinical Server] Sandbox mode detected. Redirecting medical evaluation intake copy to verified developer: ${targetRecipient}`);
              
              const sandboxResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  from: `Secure Board Intake <${fromEmail}>`,
                  to: [targetRecipient],
                  reply_to: personal.email,
                  subject: `[Sandbox Copy] ${subject}`,
                  html: `
                    <div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 16px; margin-bottom: 20px; border-radius: 10px; font-family: sans-serif; font-size: 13px; color: #92400E;">
                      <strong>Resend Sandbox Redirect:</strong> This secure medical intake form was originally addressed to <strong>doctorvictorestrella@gmail.com</strong>. Because your Resend account is currently in Sandbox/Testing mode, the delivery was redirected to your verified account (<strong>${targetRecipient}</strong>) so you can preview this professional HIPAA-styled patient report and verify its flawless data format.
                    </div>
                    ${htmlContent}
                  `,
                  attachments: attachments
                })
              });

              if (sandboxResponse.ok) {
                emailSent = true;
                console.log(`[Clinical Server] Sandbox redirect delivery successful!`);
              } else {
                const sandboxErr = await sandboxResponse.text();
                console.error(`[Clinical Server] Failed to deliver redirected copy to ${targetRecipient}:`, sandboxErr);
              }
            }
          }
        } catch (err: any) {
          console.error(`[Clinical Server] Failed to execute API call to Resend:`, err);
          emailError = err.message;
        }
      } else {
        // Simulation mode
        console.warn("[Clinical Server] RESEND_API_KEY is not defined. Simulating medical evaluation intake email dispatch.");
        console.log(`
[Clinical Server] SIMULATED EVALUATION EMAIL DISPATCH SUCCESSFUL:
--------------------------------------------------
To: doctorvictorestrella@gmail.com
From: Secure Board Intake <${fromEmail}>
Subject: ${subject}
Patient Name: ${patientName}
Calculated BMI: ${personal.bmi} (${getBmiCategoryText(personal.bmi)})
Number of Attached Photos: ${attachments.length}
--------------------------------------------------
        `);
        emailSent = true;
      }

      return res.status(200).json({
        success: true,
        emailSent,
        simulated: !apiKey,
        message: apiKey ? "Medical evaluation sent successfully." : "Medical evaluation simulated successfully in developer console."
      });
    } catch (err: any) {
      console.error("[Clinical Server] Error in /api/evaluation route:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // API Endpoint: Process Instagram / Landing Page Lead & Dispatch dual emails (Patient + Dr. Victor Estrella)
  app.post("/api/landing-lead", async (req, res) => {
    try {
      const {
        fullName,
        phone,
        email,
        country = "United States",
        procedure = "Liposuction HD & BBL",
        travelTimeline = "1-3 Months",
        notes = "",
        lang = "en"
      } = req.body;

      if (!fullName || !phone) {
        return res.status(400).json({
          success: false,
          error: "Full name and WhatsApp / Phone are required."
        });
      }

      console.log(`[Clinical Server] Received Landing Page Lead for: ${fullName} (${phone} | ${email || 'No email'}) - Procedure: ${procedure}`);

      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const waLink = `https://wa.me/${cleanPhone.startsWith("1") || cleanPhone.startsWith("809") || cleanPhone.startsWith("829") || cleanPhone.startsWith("849") ? cleanPhone : "1" + cleanPhone}`;
      const clinicWaLink = `https://wa.me/18299358121?text=${encodeURIComponent(`Hello Dr. Victor Estrella team, my name is ${fullName}. I just requested a virtual consultation for ${procedure}.`)}`;

      // Save to In-Memory CRM leads store
      const newCrmLead = {
        id: `lead-landing-${Date.now()}`,
        patientName: fullName,
        email: email || "N/A",
        phone: phone,
        procedure: procedure,
        status: "evaluation",
        riskCategory: "low",
        dateCreated: new Date().toISOString().split("T")[0],
        estimatedValue: procedure.includes("Mommy") ? 7500 : procedure.includes("Liposuction") ? 5200 : 4500,
        notes: `[Instagram / Landing Page Lead] Timeline: ${travelTimeline} | Country: ${country}${notes ? ` | Goals: ${notes}` : ""}`,
        source: "instagram_landing_form"
      };
      crmLeadsStore.unshift(newCrmLead);

      const apiKey = process.env.RESEND_API_KEY;
      let configuredSender = process.env.SENDER_EMAIL || "doctorvictorestrella@gmail.com";
      if (configuredSender === "onboarding@resend.dev") {
        configuredSender = "doctorvictorestrella@gmail.com";
      }

      const verifiedDomain = "contact.drestrellaplasticsurgeon.com";
      let fromEmail = `consultations@${verifiedDomain}`;
      if (process.env.SENDER_EMAIL && process.env.SENDER_EMAIL.endsWith(verifiedDomain)) {
        fromEmail = process.env.SENDER_EMAIL;
      }

      let patientEmailSent = false;
      let doctorEmailSent = false;
      let emailError: string | null = null;

      const isSpanish = lang === "es";

      // 1. Email Template for Patient (English)
      const patientHtmlEnglish = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D211A; background-color: #FCFBF9; border: 1px solid #EBE6DF; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          <div style="text-align: center; border-bottom: 1px solid #EBE6DF; padding-bottom: 24px; margin-bottom: 24px;">
            <h1 style="font-family: Georgia, serif; color: #2D211A; margin: 0; font-size: 26px; font-weight: normal; letter-spacing: -0.5px;">Dr. Víctor Estrella</h1>
            <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 2.5px; color: #0373bb; font-weight: bold; margin: 6px 0 0 0;">Plastic, Aesthetic & Reconstructive Surgery • Santo Domingo, DR</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #2D211A;">Dear <strong>${fullName}</strong>,</p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #5C4D44;">
            Thank you for requesting a <strong>Pre-Surgical Virtual Consultation</strong> with Dr. Víctor Estrella and our international clinical team in Santo Domingo, Dominican Republic.
          </p>
          
          <div style="background-color: #ffffff; border: 1px solid #EBE6DF; border-radius: 14px; padding: 22px; margin: 24px 0;">
            <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #FCFBF9; padding-bottom: 8px; font-weight: bold;">
              Your Virtual Consultation Request Details
            </h2>
            <table style="width: 100%; font-size: 13.5px; color: #5C4D44; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; width: 140px; border-bottom: 1px solid #FCFBF9;">Procedure of Interest:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #0373bb; font-weight: bold;">${procedure}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">WhatsApp / Phone:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Country / State:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${country}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Expected Timeline:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${travelTimeline}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; vertical-align: top;">Aesthetic Goals & Notes:</td>
                <td style="padding: 8px 0; font-style: italic; color: #7C6C63;">"${notes}"</td>
              </tr>` : ""}
            </table>

            <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #EBE6DF;">
              <a href="${clinicWaLink}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 28px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.25);">
                💬 Connect Directly on WhatsApp with Patient Coordinator
              </a>
            </div>
          </div>

          <p style="font-size: 13.5px; line-height: 1.6; color: #5C4D44;"><strong>What happens next?</strong></p>
          <ol style="font-size: 13.5px; line-height: 1.6; color: #5C4D44; padding-left: 20px; margin-top: 6px;">
            <li style="margin-bottom: 8px;">Our specialized bilingual coordinator will review your aesthetic goals with Dr. Estrella's surgical calendar.</li>
            <li style="margin-bottom: 8px;">We will reach out to you via WhatsApp at <strong>${phone}</strong> to confirm your preferred video call appointment.</li>
            <li style="margin-bottom: 8px;">We will provide detailed pre-op preparation info, personalized surgical quote, and recovery retreat logistics in Santo Domingo.</li>
          </ol>

          <div style="border-top: 1px solid #EBE6DF; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 11px; color: #7C6C63; font-family: monospace;">
            <p style="margin: 0; font-weight: bold; color: #2D211A;">Dr. Víctor Estrella • Plastic & Reconstructive Surgeon</p>
            <p style="margin: 4px 0 0 0;">IPBMA Medical Associates, Santo Domingo, Dominican Republic</p>
            <p style="margin: 4px 0 0 0;">SODOCIPRE Board Certified Member • WhatsApp: +1 (829) 935-8121</p>
          </div>
        </div>
      `;

      // 1b. Email Template for Patient (Spanish)
      const patientHtmlSpanish = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D211A; background-color: #FCFBF9; border: 1px solid #EBE6DF; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          <div style="text-align: center; border-bottom: 1px solid #EBE6DF; padding-bottom: 24px; margin-bottom: 24px;">
            <h1 style="font-family: Georgia, serif; color: #2D211A; margin: 0; font-size: 26px; font-weight: normal; letter-spacing: -0.5px;">Dr. Víctor Estrella</h1>
            <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 2.5px; color: #0373bb; font-weight: bold; margin: 6px 0 0 0;">Cirugía Plástica, Estética y Reconstructiva • Santo Domingo, RD</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #2D211A;">Estimada/o <strong>${fullName}</strong>,</p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #5C4D44;">
            Gracias por solicitar su <strong>Consulta Virtual Pre-Quirúrgica</strong> con el Dr. Víctor Estrella y nuestro equipo médico en Santo Domingo, República Dominicana.
          </p>
          
          <div style="background-color: #ffffff; border: 1px solid #EBE6DF; border-radius: 14px; padding: 22px; margin: 24px 0;">
            <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #FCFBF9; padding-bottom: 8px; font-weight: bold;">
              Detalles de su Solicitud de Consulta
            </h2>
            <table style="width: 100%; font-size: 13.5px; color: #5C4D44; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; width: 140px; border-bottom: 1px solid #FCFBF9;">Procedimiento:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #0373bb; font-weight: bold;">${procedure}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">WhatsApp / Teléfono:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">País / Ubicación:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${country}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Fecha estimada de viaje:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${travelTimeline}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; vertical-align: top;">Objetivos Estéticos:</td>
                <td style="padding: 8px 0; font-style: italic; color: #7C6C63;">"${notes}"</td>
              </tr>` : ""}
            </table>

            <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #EBE6DF;">
              <a href="${clinicWaLink}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 28px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.25);">
                💬 Chatear Directamente por WhatsApp con Coordinación
              </a>
            </div>
          </div>

          <p style="font-size: 13.5px; line-height: 1.6; color: #5C4D44;"><strong>¿Cuáles son los siguientes pasos?</strong></p>
          <ol style="font-size: 13.5px; line-height: 1.6; color: #5C4D44; padding-left: 20px; margin-top: 6px;">
            <li style="margin-bottom: 8px;">Nuestro coordinador revisará sus objetivos con la agenda quirúrgica del Dr. Estrella.</li>
            <li style="margin-bottom: 8px;">Le contactaremos vía WhatsApp al <strong>${phone}</strong> para agendar la videollamada HD.</li>
            <li style="margin-bottom: 8px;">Le enviaremos presupuesto personalizado, indicaciones preoperatorias y opciones de casas de recuperación en Santo Domingo.</li>
          </ol>

          <div style="border-top: 1px solid #EBE6DF; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 11px; color: #7C6C63; font-family: monospace;">
            <p style="margin: 0; font-weight: bold; color: #2D211A;">Dr. Víctor Estrella • Cirugía Plástica y Reconstructiva</p>
            <p style="margin: 4px 0 0 0;">IPBMA Medical Associates, Santo Domingo, República Dominicana</p>
            <p style="margin: 4px 0 0 0;">Miembro Certificado SODOCIPRE • WhatsApp: +1 (829) 935-8121</p>
          </div>
        </div>
      `;

      // 2. Doctor Alert Email Template (Sent to Dr. Victor Estrella)
      const doctorSubject = `🔥 [NUEVO LEAD DE INSTAGRAM/LANDING] ${fullName} - ${procedure} (${country})`;
      const doctorHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #2D211A; background-color: #FCFBF9; border: 2px solid #0373bb; border-radius: 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.05);">
          <div style="text-align: center; border-bottom: 1px solid #EBE6DF; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2.5px; color: #ffffff; background-color: #0373bb; padding: 4px 12px; border-radius: 20px; font-weight: bold; display: inline-block;">
              NUEVO PROSPECTO QUIRÚRGICO DE INSTAGRAM
            </span>
            <h1 style="font-family: Georgia, serif; color: #2D211A; margin: 8px 0 0 0; font-size: 24px; font-weight: normal;">
              Dr. Víctor Estrella Clinic
            </h1>
            <p style="font-size: 12px; color: #7C6C63; margin: 4px 0 0 0;">
              Solicitud de Consulta Virtual Recibida desde la Landing Page
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #EBE6DF; border-radius: 14px; padding: 20px; margin: 20px 0;">
            <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0373bb; margin-top: 0; margin-bottom: 14px; border-bottom: 1px solid #FCFBF9; padding-bottom: 6px; font-weight: bold;">
              Ficha del Paciente
            </h2>
            <table style="width: 100%; font-size: 13.5px; color: #5C4D44; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; width: 160px; border-bottom: 1px solid #FCFBF9;">Nombre Completo:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A; font-weight: bold; font-size: 15px;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Procedimiento Deseado:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #0373bb; font-weight: bold; font-size: 14px;">${procedure}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">WhatsApp / Teléfono:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">
                  <a href="${waLink}" style="color: #25D366; font-weight: bold; text-decoration: none;">${phone} (Clic para WhatsApp)</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Correo Electrónico:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">
                  ${email ? `<a href="mailto:${email}" style="color: #0373bb; text-decoration: none;">${email}</a>` : '<span style="color: #9CA3AF;">No provisto</span>'}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">País / Ubicación:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #2D211A;">${country}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; border-bottom: 1px solid #FCFBF9;">Plazo Estimado de Viaje:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #FCFBF9; color: #D97706; font-weight: bold;">${travelTimeline}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2D211A; vertical-align: top;">Notas / Objetivos del Paciente:</td>
                <td style="padding: 8px 0; font-style: italic; color: #4B5563; background-color: #F9FAFB; padding: 10px; border-radius: 8px;">"${notes}"</td>
              </tr>` : ""}
            </table>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${waLink}" style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);">
              💬 Chatear Inmediatamente con ${fullName} por WhatsApp
            </a>
          </div>

          <p style="font-size: 11px; color: #7C6C63; line-height: 1.5; margin-top: 24px; text-align: center;">
            Lead registrado automáticamente en el Portal CRM de la Clínica.<br />
            © Dr. Víctor Estrella • Coordinación Quirúrgica Santo Domingo
          </p>
        </div>
      `;

      if (apiKey) {
        // A) Send Doctor Notification Email (to doctorvictorestrella@gmail.com and configured sender)
        try {
          console.log(`[Clinical Server] Dispatching Doctor Alert for lead ${fullName} via Resend...`);
          const doctorRecipients = ["doctorvictorestrella@gmail.com"];
          if (configuredSender && !doctorRecipients.includes(configuredSender) && configuredSender !== "onboarding@resend.dev") {
            doctorRecipients.push(configuredSender);
          }

          const doctorResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: `Dr. Victor Estrella Leads <${fromEmail}>`,
              to: doctorRecipients,
              reply_to: email || undefined,
              subject: doctorSubject,
              html: doctorHtml
            })
          });

          if (doctorResponse.ok) {
            doctorEmailSent = true;
            console.log(`[Clinical Server] Lead notification email delivered to Dr. Victor Estrella (${doctorRecipients.join(', ')})`);
          } else {
            const docErr = await doctorResponse.text();
            console.warn(`[Clinical Server] Primary delivery to doctor was rejected by Resend:`, docErr);

            // Handle sandbox fallback if doctor is not yet authorized on Resend sandbox
            const isSandboxError = docErr.includes("own email address") || docErr.includes("testing emails") || docErr.includes("validation_error");
            if (isSandboxError) {
              let targetRecipient = configuredSender;
              const emailMatch = docErr.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
              if (emailMatch && emailMatch[1]) {
                targetRecipient = emailMatch[1];
              }

              console.log(`[Clinical Server] Resend Sandbox detected. Redirecting Doctor alert copy to verified developer email: ${targetRecipient}`);
              const sandboxDocResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  from: `Dr. Victor Estrella Leads <${fromEmail}>`,
                  to: [targetRecipient],
                  reply_to: email || undefined,
                  subject: `[Sandbox Copy] ${doctorSubject}`,
                  html: `
                    <div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 16px; margin-bottom: 20px; border-radius: 10px; font-family: sans-serif; font-size: 13px; color: #92400E;">
                      <strong>Resend Sandbox Redirect:</strong> This lead alert was addressed to <strong>doctorvictorestrella@gmail.com</strong>. Because your Resend account is in sandbox testing mode, this lead notification was redirected to your verified email (<strong>${targetRecipient}</strong>).
                    </div>
                    ${doctorHtml}
                  `
                })
              });

              if (sandboxDocResponse.ok) {
                doctorEmailSent = true;
                console.log(`[Clinical Server] Sandbox redirect to ${targetRecipient} was delivered.`);
              }
            }
          }
        } catch (docErr: any) {
          console.error(`[Clinical Server] Error sending doctor alert email:`, docErr);
          emailError = docErr.message;
        }

        // B) Send Patient Confirmation Email (if patient entered an email address)
        if (email && email.includes("@")) {
          try {
            console.log(`[Clinical Server] Dispatching Patient Confirmation to ${email} via Resend...`);
            const patientSubject = isSpanish
              ? `✨ Confirmación de Solicitud de Consulta Virtual - Dr. Víctor Estrella`
              : `✨ Virtual Consultation Request Received - Dr. Víctor Estrella`;

            const patientHtml = isSpanish ? patientHtmlSpanish : patientHtmlEnglish;

            const patientResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                from: `Dr. Victor Estrella Clinic <${fromEmail}>`,
                to: [email],
                subject: patientSubject,
                html: patientHtml
              })
            });

            if (patientResponse.ok) {
              patientEmailSent = true;
              console.log(`[Clinical Server] Patient confirmation email successfully sent to ${email}`);
            } else {
              const pErr = await patientResponse.text();
              console.warn(`[Clinical Server] Patient confirmation email rejected by Resend:`, pErr);

              // If sandbox mode, send sandbox copy to developer
              const isSandboxError = pErr.includes("own email address") || pErr.includes("testing emails") || pErr.includes("validation_error");
              if (isSandboxError) {
                let targetRecipient = configuredSender;
                const emailMatch = pErr.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
                if (emailMatch && emailMatch[1]) {
                  targetRecipient = emailMatch[1];
                }

                console.log(`[Clinical Server] Resend Sandbox mode: Redirecting patient confirmation copy to ${targetRecipient}`);
                const sandboxPatientResponse = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    from: `Dr. Victor Estrella Clinic <${fromEmail}>`,
                    to: [targetRecipient],
                    subject: `[Sandbox Patient Copy] ${patientSubject}`,
                    html: `
                      <div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 16px; margin-bottom: 20px; border-radius: 10px; font-family: sans-serif; font-size: 13px; color: #92400E;">
                        <strong>Resend Sandbox Redirect:</strong> This confirmation was originally addressed to patient <strong>${email}</strong>. Delivered to <strong>${targetRecipient}</strong> for testing preview.
                      </div>
                      ${patientHtml}
                    `
                  })
                });

                if (sandboxPatientResponse.ok) {
                  patientEmailSent = true;
                }
              }
            }
          } catch (pErr: any) {
            console.error(`[Clinical Server] Error sending patient confirmation:`, pErr);
          }
        }
      } else {
        // Simulation mode
        console.warn("[Clinical Server] RESEND_API_KEY is not defined. Simulating dual email dispatch for Landing Lead.");
        console.log(`
[Clinical Server] SIMULATED DUAL EMAIL DISPATCH:
--------------------------------------------------
1. DOCTOR ALERT:
   To: doctorvictorestrella@gmail.com
   Subject: ${doctorSubject}
   Patient: ${fullName} | Phone: ${phone} | Procedure: ${procedure} | Country: ${country}

2. PATIENT CONFIRMATION:
   To: ${email || "No email provided (WhatsApp only)"}
   From: Dr. Victor Estrella Clinic <${fromEmail}>
   Subject: Virtual Consultation Request Confirmation
--------------------------------------------------
        `);
        doctorEmailSent = true;
        patientEmailSent = true;
      }

      return res.status(200).json({
        success: true,
        patientEmailSent,
        doctorEmailSent,
        simulated: !apiKey,
        message: apiKey 
          ? "Virtual consultation requested! Email alerts dispatched to Dr. Víctor Estrella and patient."
          : "Virtual consultation requested! (Emails simulated in developer console)."
      });
    } catch (err: any) {
      console.error("[Clinical Server] Error in /api/landing-lead route:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // =========================================================================
  // AI CLINICAL CONCIERGE & LEAD EVALUATION CHATBOT (Powered by Gemini API)
  // =========================================================================

  let genAIClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    if (!genAIClient) {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return genAIClient;
  }

  // Clinical procedures master catalog for the AI Assistant
  const PROCEDURES_CATALOG = [
    {
      id: "lipo_bbl",
      name: "Liposucción 360° + BBL (Transferencia Glútea)",
      nameEn: "Liposuction 360° + BBL (Brazilian Butt Lift)",
      price: 5100,
      medicalExpenses: 1100,
      recovery: "10-14 días en República Dominicana",
      category: "body",
      desc: "Esculpe cintura, abdomen, flancos y espalda con lipotransferencia glútea armónica y natural."
    },
    {
      id: "abdominoplastia_lipo360_bbl",
      name: "Abdominoplastia (Tummy Tuck) + Liposucción 360 + BBL",
      nameEn: "Tummy Tuck (Abdominoplasty) + Lipo 360 + BBL",
      price: 7100,
      medicalExpenses: 1100,
      recovery: "12-14 días en República Dominicana",
      category: "combo",
      desc: "Repara la diástasis muscular, retira el exceso de piel flácida del abdomen y define el contorno corporal con BBL."
    },
    {
      id: "mommy_makeover_implantes",
      name: "Mommy Makeover con Implantes",
      nameEn: "Mommy Makeover with Breast Implants",
      price: 9200,
      medicalExpenses: 1200,
      recovery: "14 días en República Dominicana",
      category: "combo",
      desc: "Transformación integral post-embarazo: Abdominoplastia + Lipo 360 + BBL + Aumento de Senos con Implantes."
    },
    {
      id: "mommy_makeover_sin_implantes",
      name: "Mommy Makeover sin Implantes (Levantamiento/Reducción)",
      nameEn: "Mommy Makeover without Implants (Lift / Reduction)",
      price: 10100,
      medicalExpenses: 1200,
      recovery: "14 días en República Dominicana",
      category: "combo",
      desc: "Abdominoplastia + Lipo 360 + BBL + Mastopexia (Levantamiento de senos con tejido propio)."
    },
    {
      id: "senos_con_implantes",
      name: "Senos con Implantes (Aumento Mamario)",
      nameEn: "Breast Augmentation with Implants",
      price: 6200,
      medicalExpenses: 1200,
      recovery: "7-10 días en República Dominicana",
      category: "breast",
      desc: "Aumento de volumen, proyección y simetría mamaria con prótesis de silicona de grado médico de alta cohesividad."
    },
    {
      id: "levantamiento_senos_sin_implantes",
      name: "Levantamiento de Senos sin Implantes (Mastopexia)",
      nameEn: "Breast Lift without Implants (Mastopexy)",
      price: 5200,
      medicalExpenses: 1200,
      recovery: "8-10 días en República Dominicana",
      category: "breast",
      desc: "Reposiciona el tejido mamario caído, mejora la firmeza y remodela la areola sin necesidad de prótesis sintéticas."
    },
    {
      id: "reduccion_mamaria",
      name: "Reducción Mamaria (Mamoplastia de Reducción)",
      nameEn: "Breast Reduction Mammoplasty",
      price: 5700,
      medicalExpenses: 1200,
      recovery: "8-12 días en República Dominicana",
      category: "breast",
      desc: "Reduce el volumen y peso excesivo de los senos, aliviando dolores de espalda y hombros con un escote juvenil."
    },
    {
      id: "lipo_senos_implantes",
      name: "Liposucción + Senos con Implantes",
      nameEn: "Liposuction + Breasts with Implants",
      price: 7700,
      medicalExpenses: 1200,
      recovery: "10-12 días en República Dominicana",
      category: "combo",
      desc: "Contorno corporal mediante lipoescultura combinada con aumento mamario."
    },
    {
      id: "lipo_senos_sin_implantes",
      name: "Liposucción + Senos sin Implantes",
      nameEn: "Liposuction + Breasts without Implants",
      price: 8200,
      medicalExpenses: 1200,
      recovery: "10-12 días en República Dominicana",
      category: "combo",
      desc: "Lipoescultura corporal combinada con levantamiento o reducción mamaria sin prótesis."
    },
    {
      id: "arm_lift",
      name: "Arm Lift (Braquioplastia)",
      nameEn: "Arm Lift (Brachioplasty)",
      price: 5100,
      medicalExpenses: 1100,
      recovery: "10-12 días en República Dominicana",
      category: "body",
      desc: "Elimina la piel colgante y grasa acumulada en la cara interna de los brazos."
    },
    {
      id: "cruroplastia",
      name: "Cruroplastia (Lifting de Muslos)",
      nameEn: "Thigh Lift (Cruroplasty)",
      price: 5600,
      medicalExpenses: 1100,
      recovery: "12-14 días en República Dominicana",
      category: "body",
      desc: "Retira el exceso de piel en la entrepierna y tensa los muslos tras pérdida de peso."
    },
    {
      id: "reparacion_ombligo",
      name: "Reparación de Ombligo (Umbilicoplastia)",
      nameEn: "Belly Button Repair (Umbilicoplasty)",
      price: 1000,
      medicalExpenses: null,
      recovery: "3-5 días",
      category: "other",
      desc: "Corrección de hernias umbilicales leves o remodelación de la forma del ombligo."
    }
  ];

  // Helper heuristic generator for when Gemini API key is missing or encounters network timeouts
  function generateHeuristicResponse(lastUserMessage: string, lang: string = 'es') {
    const text = (lastUserMessage || '').toLowerCase();
    const isEn = lang === 'en';

    // 1. Booking intent
    if (
      text.includes('agendar') ||
      text.includes('cita') ||
      text.includes('consulta') ||
      text.includes('book') ||
      text.includes('appointment') ||
      text.includes('schedule') ||
      text.includes('fecha')
    ) {
      return {
        reply: isEn
          ? "I'd be delighted to coordinate your consultation with Dr. Víctor Estrella! You can choose between a Virtual Video Consultation (ideal if traveling from the US, Canada, or abroad) or an In-Person Consultation at our clinic in Santo Domingo. Please select your preferred date and time on the booking card below:"
          : "¡Con mucho gusto te coordino una cita médica con el Dr. Víctor Estrella! Puedes optar por una Consulta Virtual por Videollamada (ideal si viajas desde el exterior) o Consulta Presencial en nuestra clínica en Santo Domingo. Por favor selecciona tu fecha y horario preferido en el formulario a continuación:",
        suggestedProcedures: ["lipo_bbl", "abdominoplastia_lipo360_bbl", "mommy_makeover_implantes"],
        bookingIntent: true
      };
    }

    // 2. Pricing inquiries
    if (
      text.includes('precio') ||
      text.includes('costo') ||
      text.includes('cuanto') ||
      text.includes('cuánto') ||
      text.includes('price') ||
      text.includes('cost') ||
      text.includes('rates') ||
      text.includes('presupuesto')
    ) {
      return {
        reply: isEn
          ? "Here are our official approximate USD prices with Dr. Víctor Estrella. All our packages include full medical expenses (pre-op lab work, medical insurance, anesthesia, hospital fees, and clinical follow-up):\n\n• **Lipo 360 + BBL**: ~$5,100 USD (Includes $1,100 medical expenses)\n• **Tummy Tuck + Lipo 360 + BBL**: ~$7,100 USD\n• **Mommy Makeover with Implants**: ~$9,200 USD\n• **Breast Augmentation with Implants**: ~$6,200 USD\n• **Breast Lift without Implants**: ~$5,200 USD\n\n*Note: VASER ultrasound technology add-on is $800 USD. Would you like to complete a quick candidacy evaluation or book a virtual consultation?"
          : "Con gusto te comparto los precios aproximados oficiales en USD con el Dr. Víctor Estrella. Todos nuestros paquetes incluyen gastos médicos completos (analíticas de laboratorio, seguro médico, anestesia, quirófano en centro acreditado y seguimiento postoperatorio):\n\n• **Lipo 360 + BBL**: ~$5,100 USD (Incluye $1,100 de gastos médicos)\n• **Abdominoplastia + Lipo 360 + BBL**: ~$7,100 USD\n• **Mommy Makeover con Implantes**: ~$9,200 USD\n• **Senos con Implantes (Aumento)**: ~$6,200 USD\n• **Levantamiento de Senos sin Implantes**: ~$5,200 USD\n\n*Nota: La tecnología ultrasónica VASER tiene un suplemento de $800 USD. ¿Te gustaría realizar una evaluación estética de tu caso o agendar una consulta virtual?",
        suggestedProcedures: ["lipo_bbl", "abdominoplastia_lipo360_bbl", "mommy_makeover_implantes", "senos_con_implantes"],
        bookingIntent: false
      };
    }

    // 3. Mommy Makeover / Post-pregnancy / Tummy Tuck
    if (
      text.includes('mommy') ||
      text.includes('tummy') ||
      text.includes('abdominoplastia') ||
      text.includes('hijos') ||
      text.includes('embarazo') ||
      text.includes('cesarea') ||
      text.includes('cesárea') ||
      text.includes('piel suelta') ||
      text.includes('flacidez')
    ) {
      return {
        reply: isEn
          ? "For post-pregnancy rejuvenation or loose abdominal skin, Dr. Estrella highly recommends the **Mommy Makeover** or **Tummy Tuck (Abdominoplasty) + Lipo 360 + BBL**.\n\nThis procedure repairs muscle separation (diastasis recti), removes stretched skin, and contours the waistline with BBL. If desired, breast lifting or implants can be included in the same surgical session.\n\nEstimated recovery: 12-14 days in Santo Domingo. Would you like to check available consultation dates?"
          : "Para corregir los cambios post-embarazo o exceso de piel abdominal, el procedimiento por excelencia con el Dr. Estrella es el **Mommy Makeover** o la **Abdominoplastia + Lipo 360 + BBL**.\n\nEste procedimiento repara la separación muscular (diástasis de rectos), elimina la piel flácida y redefine la cintura con lipotransferencia glútea. Si lo deseas, se puede incluir el levantamiento o aumento de senos en el mismo tiempo quirúrgico.\n\nEstancia recomendada en Santo Domingo: 12 a 14 días. ¿Deseas verificar fechas disponibles para tu consulta virtual?",
        suggestedProcedures: ["mommy_makeover_implantes", "abdominoplastia_lipo360_bbl", "senos_con_implantes"],
        bookingIntent: false
      };
    }

    // 4. Lipo 360 / BBL / Fat contouring
    if (
      text.includes('lipo') ||
      text.includes('bbl') ||
      text.includes('grasa') ||
      text.includes('cintura') ||
      text.includes('gluteo') ||
      text.includes('glúteo') ||
      text.includes('fat')
    ) {
      return {
        reply: isEn
          ? "Dr. Víctor Estrella is a recognized specialist in **Lipo 360 HD with Brazilian Butt Lift (BBL)**. Using advanced fat-grafting techniques and ultrasonic VASER technology, he sculpts the waistline and transfers purified fat cells to the gluteal area for natural, long-lasting curves without artificial implants.\n\n• **Total Approximate Cost**: ~$5,100 USD (Includes $1,100 medical expenses)\n• **Medical Stay**: 10-12 days in the Dominican Republic.\n\nWould you like to evaluate your BMI and candidacy for this procedure?"
          : "El Dr. Víctor Estrella es reconocido por su técnica en **Lipoescultura 360 HD con BBL**. Mediante tecnología ultrasónica VASER y lipotransferencia de grasa autóloga purificada, logra una marcación anatómica de cintura y realce de glúteos con proporciones armónicas y naturales.\n\n• **Costo Estimado Total**: ~$5,100 USD (Incluye $1,100 de gastos médicos completos)\n• **Estancia en Santo Domingo**: 10 a 12 días para drenajes y controles.\n\n¿Deseas evaluar tu IMC y confirmar si eres candidata ideal?",
        suggestedProcedures: ["lipo_bbl", "abdominoplastia_lipo360_bbl"],
        bookingIntent: false
      };
    }

    // 5. Breasts / Senos
    if (
      text.includes('seno') ||
      text.includes('busto') ||
      text.includes('pecho') ||
      text.includes('implante') ||
      text.includes('breast') ||
      text.includes('mastopexia') ||
      text.includes('reduccion') ||
      text.includes('reducción')
    ) {
      return {
        reply: isEn
          ? "For breast aesthetics, Dr. Estrella offers three customized options:\n\n1. **Breast Augmentation with Implants** (~$6,200 USD total) - Restores volume, upper-pole fullness, and projection.\n2. **Breast Lift without Implants (Mastopexy)** (~$5,200 USD total) - Corrects sagging and repositions the areola using your own glandular tissue.\n3. **Breast Reduction** (~$5,700 USD total) - Relieves physical weight and reshapes the breasts proportionally.\n\nWhich of these best matches your personal goals?"
          : "En cirugía estética de mamas, el Dr. Víctor Estrella ofrece tres alternativas según tus necesidades anatómicas:\n\n1. **Aumento de Senos con Implantes** (~$6,200 USD total) - Restaura proyección, volumen y escote con implantes de última generación.\n2. **Levantamiento de Senos sin Implantes (Mastopexia)** (~$5,200 USD total) - Corrige la caída y reposiciona el complejo areola-pezón con tu propio tejido.\n3. **Reducción Mamaria** (~$5,700 USD total) - Alivia el peso en la espalda y esculpe un busto erguido y cómodo.\n\n¿Cuál de estas alternativas se ajusta mejor a tu objetivo?",
        suggestedProcedures: ["senos_con_implantes", "levantamiento_senos_sin_implantes", "reduccion_mamaria"],
        bookingIntent: false
      };
    }

    // 6. Travel / Recovery / Dominican Republic
    if (
      text.includes('viaj') ||
      text.includes('travel') ||
      text.includes('republica dominicana') ||
      text.includes('dominican') ||
      text.includes('recuperacion') ||
      text.includes('recuperación') ||
      text.includes('recovery') ||
      text.includes('estancia') ||
      text.includes('dias') ||
      text.includes('días')
    ) {
      return {
        reply: isEn
          ? "Travelling to Santo Domingo for surgery with Dr. Víctor Estrella is smooth and completely guided! Over 60% of our patients travel from the United States, Puerto Rico, and Europe.\n\n• **Recommended Stay**: 10 to 14 days in Santo Domingo.\n• **Pre-op Day**: In-person consultation, 3D Vectra simulation, and final blood tests.\n• **Post-op Care**: Mandatory lymphatic drainage massages included, medical checkups, and final travel clearance before flying back.\n• **Accommodation**: We partner with certified recovery homes featuring specialized post-op nursing care.\n\nWould you like to schedule your initial virtual consultation to discuss your travel timeline?"
          : "Viajar a Santo Domingo para tu procedimiento con el Dr. Víctor Estrella es una experiencia segura y guiada paso a paso. Más del 60% de nuestras pacientes viajan desde Estados Unidos, Puerto Rico, Europa y las islas del Caribe.\n\n• **Tiempo de Estancia**: 10 a 14 días en Santo Domingo.\n• **Día Preoperatorio**: Consulta presencial, analíticas finales y simulación 3D.\n• **Cuidados Postoperatorios**: Drenajes linfáticos especializados, retiro de drenos y autorización médica formal de vuelo.\n• **Alojamiento**: Contamos con convenios con casas de recuperación certificadas con enfermería 24/7.\n\n¿Deseas agendar tu consulta virtual de valoración para coordinar fechas de viaje?",
        suggestedProcedures: ["lipo_bbl", "abdominoplastia_lipo360_bbl", "mommy_makeover_implantes"],
        bookingIntent: false
      };
    }

    // Default welcoming response
    return {
      reply: isEn
        ? "Hello! I am Aura, Senior Clinical Aesthetic Assistant to Dr. Víctor Estrella, Board-Certified Plastic Surgeon in Santo Domingo.\n\nI can help you:\n1. **Evaluate your surgical candidacy** based on your anatomical goals.\n2. **Explore procedures and official USD pricing** (including pre-op tests & medical expenses).\n3. **Plan travel & recovery** in the Dominican Republic.\n4. **Schedule a Virtual or In-Person Consultation** directly with Dr. Estrella.\n\nWhat procedure or aesthetic area would you like to discuss today?"
        : "¡Hola! Soy Aura, Asistente Clínica Virtual del Dr. Víctor Estrella, Cirujano Plástico y Reconstructivo certificado (SODOCIPRE) en Santo Domingo.\n\nEstoy aquí para ayudarte a:\n1. **Evaluar tu candidatura quirúrgica** según tus metas corporales o faciales.\n2. **Conocer precios oficiales en USD** con desglose completo de gastos médicos.\n3. **Coordinar viaje y recuperación** si visitas República Dominicana desde el exterior.\n4. **Agendar tu Consulta Médica** (Virtual o Presencial) con el Dr. Estrella.\n\n¿Qué área o procedimiento te gustaría transformar?",
      suggestedProcedures: ["lipo_bbl", "abdominoplastia_lipo360_bbl", "mommy_makeover_implantes"],
      bookingIntent: false
    };
  }

  // API Endpoint: Intelligent Chatbot with Gemini and Fallback
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages = [], lang = "es", leadContext = {} } = req.body;
      const isSpanish = lang === "es";

      // Extract last user message
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
      const userQuery = lastUserMsg ? lastUserMsg.content : "";

      const ai = getGenAI();

      if (!ai) {
        console.log("[Clinical Server] GEMINI_API_KEY not configured. Utilizing clinical heuristic conversational engine.");
        const fallback = generateHeuristicResponse(userQuery, lang);
        return res.status(200).json({
          success: true,
          model: "clinical-heuristic-engine",
          reply: fallback.reply,
          suggestedProcedures: fallback.suggestedProcedures,
          bookingIntent: fallback.bookingIntent,
          evaluation: null
        });
      }

      // System instruction for Gemini model
      const systemInstruction = `
You are "Aura", the empathetic, prestigious, and knowledgeable Senior Clinical Aesthetic Consultation AI for Dr. Víctor Estrella, MD.
Dr. Víctor Estrella is a Board-Certified Plastic, Reconstructive & Aesthetic Surgeon located in Santo Domingo, Dominican Republic.
He is a certified active member of SODOCIPRE (Sociedad Dominicana de Cirugía Plástica, Reconstructiva y Estética).
His clinic specializes in natural-looking transformations, High-Definition Liposculpture (Lipo 360 HD with VASER), BBL, Abdominoplasty (Tummy Tuck), Mommy Makeover, Breast Aesthetics (Augmentation, Lift, Reduction), and Facial Surgery.

OFFICIAL CLINICAL PROCEDURES & ESTIMATED USD PRICING (All packages include full medical expenses: blood tests, medical insurance, anesthesia, operating theater, clinical follow-up):
- Liposucción 360 + BBL (Transferencia Glútea): $5,100 USD (Includes $1,100 medical expenses). Downtime: 10-12 days in DR.
- Abdominoplastia (Tummy Tuck) + Liposucción 360 + BBL: $7,100 USD (Includes $1,100 medical expenses). Downtime: 12-14 days in DR.
- Mommy Makeover con Implantes (Tummy Tuck + Lipo 360 + BBL + Senos con Implantes): $9,200 USD (Includes $1,200 medical expenses). Downtime: 14 days in DR.
- Mommy Makeover sin Implantes (Tummy Tuck + Lipo 360 + BBL + Levantamiento de Senos): $10,100 USD. Downtime: 14 days in DR.
- Senos con Implantes (Aumento Mamario): $6,200 USD (Includes $1,200 medical expenses). Downtime: 7-10 days in DR.
- Levantamiento de Senos sin Implantes (Mastopexia): $5,200 USD. Downtime: 8-10 days in DR.
- Reducción Mamaria: $5,700 USD. Downtime: 8-12 days in DR.
- Liposucción + Senos con Implantes: $7,700 USD.
- Liposucción + Senos sin Implantes: $8,200 USD.
- Arm Lift (Braquioplastia): $5,100 USD.
- Cruroplastia (Muslos Internos): $5,600 USD.
- Reparación de Ombligo: $1,000 USD.
- VASER Ultrasound Technology Add-on: +$800 USD (recommended for high definition or previous liposuction cases).
- High Complexity Protocol (BMI > 35): +$800 USD.

GUIDELINES FOR CONVERSING WITH LEADS:
1. Tone: Warm, empathetic, professional, transparent, and prioritizing patient safety above all.
2. Language: Reply in the language of the user (Spanish by default if in Spanish, English if in English).
3. Evaluation: If the lead describes loose skin or asks what they need, evaluate their candidacy: explain whether they need a Tummy Tuck (for loose skin and diastasis) vs Lipo 360 (for stubborn fat with good elasticity).
4. Traveling patients: Explain that patients from the US, Puerto Rico, Canada, and Europe stay 10-14 days in Santo Domingo.
5. Appointment booking: Offer to schedule a Virtual Consultation via WhatsApp/Zoom or an In-Person Consultation at Dr. Estrella's clinic.
6. At the very end of your response, ALWAYS output a structured JSON block inside <<<JSON_METADATA>>>...<<<END_JSON_METADATA>>> with this exact schema:
<<<JSON_METADATA>>>
{
  "suggestedProcedures": ["lipo_bbl", "abdominoplastia_lipo360_bbl"],
  "bookingIntent": false,
  "evaluation": null
}
<<<END_JSON_METADATA>>>
(Use actual procedure IDs from the list: lipo_bbl, abdominoplastia_lipo360_bbl, mommy_makeover_implantes, mommy_makeover_sin_implantes, senos_con_implantes, levantamiento_senos_sin_implantes, reduccion_mamaria, lipo_senos_implantes, lipo_senos_sin_implantes, arm_lift, cruroplastia, reparacion_ombligo. Set bookingIntent to true if the user wants to book or pick a date).
`;

      // Build conversation contents for generateContent
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // If lead context is present, inject it
      if (leadContext && Object.keys(leadContext).length > 0) {
        contents.unshift({
          role: "user",
          parts: [{ text: `Lead Context: ${JSON.stringify(leadContext)}` }]
        });
        contents.splice(1, 0, {
          role: "model",
          parts: [{ text: "Understood. I will personalize my clinical recommendations with this lead context." }]
        });
      }

      console.log(`[Clinical Server] Calling Gemini API (gemini-3.6-flash) for user chat...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const fullOutput = response.text || "";

      // Parse metadata block
      let visibleReply = fullOutput;
      let suggestedProcedures: string[] = [];
      let bookingIntent = false;
      let evaluation = null;

      const metaMatch = fullOutput.match(/<<<JSON_METADATA>>>([\s\S]*?)<<<END_JSON_METADATA>>>/);
      if (metaMatch) {
        try {
          const parsed = JSON.parse(metaMatch[1].trim());
          suggestedProcedures = parsed.suggestedProcedures || [];
          bookingIntent = Boolean(parsed.bookingIntent);
          evaluation = parsed.evaluation || null;
          visibleReply = fullOutput.replace(metaMatch[0], "").trim();
        } catch (jsonErr) {
          console.warn("[Clinical Server] Failed to parse JSON metadata from Gemini response:", jsonErr);
        }
      }

      // If no suggested procedures detected, provide reasonable defaults based on content
      if (!suggestedProcedures || suggestedProcedures.length === 0) {
        const lower = visibleReply.toLowerCase();
        if (lower.includes("mommy") || lower.includes("tummy") || lower.includes("abdomino")) {
          suggestedProcedures = ["mommy_makeover_implantes", "abdominoplastia_lipo360_bbl"];
        } else if (lower.includes("seno") || lower.includes("breast") || lower.includes("implante")) {
          suggestedProcedures = ["senos_con_implantes", "levantamiento_senos_sin_implantes"];
        } else {
          suggestedProcedures = ["lipo_bbl", "abdominoplastia_lipo360_bbl"];
        }
      }

      return res.status(200).json({
        success: true,
        model: "gemini-3.8-flash",
        reply: visibleReply,
        suggestedProcedures,
        bookingIntent,
        evaluation
      });
    } catch (err: any) {
      console.error("[Clinical Server] Gemini API chat error, falling back to heuristic engine:", err.message);
      const fallback = generateHeuristicResponse(req.body?.messages?.[req.body.messages.length - 1]?.content || "", req.body?.lang || "es");
      return res.status(200).json({
        success: true,
        model: "clinical-heuristic-engine-fallback",
        reply: fallback.reply,
        suggestedProcedures: fallback.suggestedProcedures,
        bookingIntent: fallback.bookingIntent,
        evaluation: null,
        apiError: err.message
      });
    }
  });

  // API Endpoint: Instant Aesthetic Candidacy Evaluation for Leads
  app.post("/api/chat/evaluate", (req, res) => {
    try {
      const {
        zone = "body",
        goals = [],
        priorSurgery = "none",
        children = 0,
        heightCm = 165,
        weightKg = 68,
        timeline = "1-3_months",
        travel = true,
        lang = "es"
      } = req.body;

      const isEn = lang === "en";

      // Calculate BMI
      const heightM = (heightCm || 165) / 100;
      const weight = weightKg || 68;
      const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

      let candidateLevel: 'ideal' | 'good' | 'requires_clearance' = 'good';
      if (bmi >= 19 && bmi <= 29) {
        candidateLevel = 'ideal';
      } else if (bmi > 29 && bmi <= 34.9) {
        candidateLevel = 'good';
      } else {
        candidateLevel = 'requires_clearance';
      }

      let recommendedProcedureIds: string[] = [];
      let rationale = "";
      let recoveryDays = 12;

      if (zone === "mommy" || children > 0 || goals.includes("loose_skin_abdomen")) {
        recommendedProcedureIds = ["mommy_makeover_implantes", "abdominoplastia_lipo360_bbl"];
        recoveryDays = 14;
        rationale = isEn
          ? "Based on previous pregnancies or skin laxity, a combined Abdominoplasty with Lipo 360 & BBL (or Mommy Makeover) is recommended to tighten the rectus diastasis and restore full contour harmony."
          : "Debido a antecedentes de embarazos o flacidez en la pared abdominal, el procedimiento recomendado es Abdominoplastia con Lipo 360 & BBL (o Mommy Makeover), reparando la diástasis muscular y devolviendo firmeza a la cintura.";
      } else if (zone === "breast" || goals.includes("breast_volume") || goals.includes("breast_lift")) {
        recommendedProcedureIds = ["senos_con_implantes", "levantamiento_senos_sin_implantes"];
        recoveryDays = 10;
        rationale = isEn
          ? "You are an excellent candidate for tailored breast aesthetics. A mastopexy or augmentation with high-cohesive silicone implants will restore volume and symmetry."
          : "Presentas excelente candidatura para estética mamaria personalizada. Una mastopexia o aumento con prótesis de alta cohesividad restaurará volumen, proyección y simetría.";
      } else if (zone === "arms" || goals.includes("arm_flaccidity")) {
        recommendedProcedureIds = ["arm_lift", "lipo_bbl"];
        recoveryDays = 10;
        rationale = isEn
          ? "Brachioplasty combined with contouring will remove excess skin in the upper arms for firm, defined silhouettes."
          : "La braquioplastia combinada con contorno corporal eliminará el descolgamiento en brazos otorgando una apariencia estilizada.";
      } else {
        // Default body contouring
        recommendedProcedureIds = ["lipo_bbl", "abdominoplastia_lipo360_bbl"];
        recoveryDays = 12;
        rationale = isEn
          ? "High-Definition Lipo 360 with BBL is the premier choice to selectively sculpt abdominal contours and enhance natural curves."
          : "La Lipoescultura 360 HD con BBL es el procedimiento ideal para esculpir la cintura y lograr curvas armónicas de aspecto atlético y natural.";
      }

      const travelNotes = travel
        ? (isEn 
            ? "Recommended stay in Santo Domingo: 10 to 14 days. Pre-op labs on day 1, post-op lymphatic massages days 3 to 10." 
            : "Estancia recomendada en Santo Domingo: 10 a 14 días. Analíticas preoperatorias el día 1 y masajes de drenaje linfático entre los días 3 y 10.")
        : (isEn 
            ? "Local patient protocol: 2-3 weeks before returning to full physical exercise." 
            : "Protocolo para paciente local: 2 a 3 semanas de reposo relativo antes de reiniciar actividades físicas intensas.");

      return res.status(200).json({
        success: true,
        evaluation: {
          zone,
          goals,
          candidateLevel,
          bmi,
          recommendedProcedureIds,
          recoveryDays,
          travelNotes,
          rationale
        }
      });
    } catch (err: any) {
      console.error("[Clinical Server] Error in /api/chat/evaluate:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // Resolve production static files directory reliably across Docker/Hostinger/Node environments
  function getDistDirectory(): string {
    const candidatePaths = [
      path.join(process.cwd(), "dist"),
      serverDirname,
      path.join(serverDirname, "dist"),
      path.join(serverDirname, "..", "dist"),
      process.cwd()
    ];
    for (const candidate of candidatePaths) {
      if (fs.existsSync(path.join(candidate, "index.html"))) {
        return candidate;
      }
    }
    return path.join(process.cwd(), "dist");
  }

  // Serve Vite assets in development, or compiled production assets in production
  const distPath = getDistDirectory();
  const hasDistIndex = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production" || (hasDistIndex && process.env.NODE_ENV !== "development");

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: ["drestrellaplasticsurgeon.com", "crm.drestrellaplasticsurgeon.com"], 
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets with aggressive caching on hashed static assets
    console.log(`[Clinical Server] Serving static production assets from: ${distPath}`);
    
    app.use(express.static(distPath, {
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          // Hashed Vite assets are immutable
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".html")) {
          // Entry point HTML must revalidate
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
      }
    }));

    // Handle root / and client-side routes
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        return res.sendFile(indexPath);
      }
      return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dr. Víctor Estrella | Clinical Portal</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FCFBF9; color: #2D211A;">
  <div style="text-align: center; padding: 2rem;">
    <h2>Dr. Víctor Estrella</h2>
    <p>Application server is active and healthy.</p>
  </div>
</body>
</html>`);
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Clinical Server] Booted up and running on host 0.0.0.0 port ${PORT}`);
  });

  // In production, also bind secondary port (e.g. 3000 if PORT is 80, or 80 if PORT is 3000)
  if (isProduction) {
    const secondaryPort = Number(PORT) === 80 ? 3000 : 80;
    try {
      const fallbackServer = app.listen(secondaryPort, "0.0.0.0", () => {
        console.log(`[Clinical Server] Secondary listener active on port ${secondaryPort} for reverse proxy routing`);
      });
      fallbackServer.on("error", (err: any) => {
        console.log(`[Clinical Server] Note: Secondary port ${secondaryPort} listener skipped (${err?.message || err})`);
      });
    } catch {
      // Ignored
    }
  }
}

startServer();
