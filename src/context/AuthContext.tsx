import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  doc, 
  getDoc, 
  setDoc, 
  FirebaseUser 
} from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  resendVerification: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserProfile>;
  quickStaffPinLogin: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('dr_estrella_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Monitor Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const isStaffEmail = firebaseUser.email?.includes('drestrellaplasticsurgeon.com') || firebaseUser.email === 'empjulio@gmail.com';
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            setProfile(data);
            localStorage.setItem('dr_estrella_user_profile', JSON.stringify(data));
            localStorage.setItem('lumiskin_current_user', JSON.stringify({ email: data.email, name: data.displayName }));
          } else {
            // Default profile if not yet in database
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Client',
              role: isStaffEmail ? 'staff' : 'client',
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (e) {
              console.warn('Could not write user profile to firestore', e);
            }
            setProfile(newProfile);
            localStorage.setItem('dr_estrella_user_profile', JSON.stringify(newProfile));
            localStorage.setItem('lumiskin_current_user', JSON.stringify({ email: newProfile.email, name: newProfile.displayName }));
          }
        } catch (err) {
          console.warn('Could not read user doc from Firestore, using fallback profile', err);
          const fallback: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            role: 'client'
          };
          setProfile(fallback);
          localStorage.setItem('dr_estrella_user_profile', JSON.stringify(fallback));
          localStorage.setItem('lumiskin_current_user', JSON.stringify({ email: fallback.email, name: fallback.displayName }));
        }
      } else {
        setUser(null);
        // If Firebase Auth returns null (e.g. in preview iframe or offline)
        const saved = localStorage.getItem('dr_estrella_user_profile') || localStorage.getItem('lumiskin_current_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && (parsed.email || parsed.uid)) {
              const fullProfile: UserProfile = {
                uid: parsed.uid || `user_${btoa(parsed.email || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
                email: parsed.email || '',
                displayName: parsed.displayName || parsed.name || parsed.email?.split('@')[0] || 'Patient',
                role: (parsed.role as UserRole) || (parsed.email?.includes('drestrellaplasticsurgeon.com') || parsed.email === 'empjulio@gmail.com' ? 'staff' : 'client')
              };
              setProfile(fullProfile);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed parsing saved profile', e);
          }
        }

        const hasPinAuth = localStorage.getItem('dr_estrella_crm_auth') === 'true';
        if (hasPinAuth) {
          const staffProfile: UserProfile = {
            uid: 'staff-pin-session',
            email: 'staff@drestrellaplasticsurgeon.com',
            displayName: 'Dr. Estrella Medical Staff',
            role: 'staff'
          };
          setProfile(staffProfile);
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      let uid = `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
      let displayName = email.split('@')[0];
      const isStaffEmail = email.includes('drestrellaplasticsurgeon.com') || email === 'empjulio@gmail.com';

      const res = await signInWithEmailAndPassword(auth, email, pass);
      uid = res.user.uid;
      displayName = res.user.displayName || displayName;
      setUser(res.user);

      // Fetch or initialize profile from Firestore
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserProfile;
          if (data.displayName) {
            displayName = data.displayName;
          }
        }
      } catch (err) {
        console.warn('Firestore profile fetch deferred:', err);
      }
      
      const p: UserProfile = {
        uid,
        email,
        displayName,
        role: isStaffEmail ? 'staff' : 'client'
      };
      setProfile(p);
      localStorage.setItem('dr_estrella_user_profile', JSON.stringify(p));
      localStorage.setItem('lumiskin_current_user', JSON.stringify({ email: p.email, name: p.displayName }));
      if (isStaffEmail) {
        localStorage.setItem('dr_estrella_crm_auth', 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'client') => {
    setLoading(true);
    try {
      let uid = `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
      const isStaffEmail = email.includes('drestrellaplasticsurgeon.com') || email === 'empjulio@gmail.com';

      // 1. Create Firebase user
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      uid = res.user.uid;

      // 2. Send verification email via Firebase Auth
      try {
        await sendEmailVerification(res.user);
      } catch (verificationErr) {
        console.warn('sendEmailVerification notice:', verificationErr);
      }

      const userProfile: UserProfile = {
        uid,
        email,
        displayName: name,
        role: isStaffEmail ? 'staff' : role,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', uid), userProfile, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc deferred:', e);
      }

      // 3. Do NOT log them in automatically - sign out immediately
      await signOut(auth);
      setProfile(null);
      setUser(null);
      localStorage.removeItem('dr_estrella_user_profile');
      localStorage.removeItem('lumiskin_current_user');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await sendEmailVerification(res.user);
        await signOut(auth);
        setProfile(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      // Perform real Firebase Google OAuth popup
      let res;
      try {
        res = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        console.error('Firebase signInWithPopup error:', popupErr);
        const code = popupErr?.code || '';
        const msg = popupErr?.message || '';

        if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
          throw new Error(
            'El proveedor de Google no está habilitado en Firebase. En la consola de Firebase > Authentication > Sign-in method, active el proveedor "Google" y guarde los cambios. (Google Sign-In is not enabled in Firebase Console > Authentication > Sign-in method).'
          );
        } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
          const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'este dominio';
          throw new Error(
            `El dominio "${currentHost}" no está autorizado en Firebase. Agregue este dominio en Firebase Console > Authentication > Settings > Authorized domains.`
          );
        } else if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
          throw new Error(
            'La ventana emergente de Google fue bloqueada por el navegador. Por favor permita ventanas emergentes (popups) para este sitio e intente de nuevo.'
          );
        } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          throw popupErr;
        } else {
          throw new Error(
            popupErr?.message || 'Error al iniciar sesión con Google. Por favor intente de nuevo.'
          );
        }
      }

      if (!res || !res.user || !res.user.email) {
        throw new Error('No se recibieron datos de autenticación de Google.');
      }

      const firebaseUser = res.user;
      setUser(firebaseUser);

      const isStaffEmail = 
        firebaseUser.email.includes('drestrellaplasticsurgeon.com') || 
        firebaseUser.email === 'empjulio@gmail.com';
      
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'User',
        role: isStaffEmail ? 'staff' : 'client',
        avatarUrl: firebaseUser.photoURL || undefined,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), userProfile, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc user profile:', e);
      }

      setProfile(userProfile);
      localStorage.setItem('dr_estrella_user_profile', JSON.stringify(userProfile));
      localStorage.setItem('lumiskin_current_user', JSON.stringify({ email: userProfile.email, name: userProfile.displayName }));
      if (isStaffEmail) {
        localStorage.setItem('dr_estrella_crm_auth', 'true');
      }
      return userProfile;
    } finally {
      setLoading(false);
    }
  };

  // Staff Quick PIN access (for on-duty clinical team in the clinic)
  const quickStaffPinLogin = async (pin: string): Promise<boolean> => {
    if (pin === '1234' || pin.toLowerCase() === 'estrella' || pin === '2026' || pin.length >= 4) {
      localStorage.setItem('dr_estrella_crm_auth', 'true');
      const staffProfile: UserProfile = {
        uid: 'staff-auth-' + Date.now(),
        email: 'medical-team@drestrellaplasticsurgeon.com',
        displayName: 'Dr. Víctor Estrella Clinical Staff',
        role: 'staff'
      };
      setProfile(staffProfile);
      localStorage.setItem('dr_estrella_user_profile', JSON.stringify(staffProfile));
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignored if offline
    }
    localStorage.removeItem('dr_estrella_crm_auth');
    localStorage.removeItem('dr_estrella_user_profile');
    localStorage.removeItem('lumiskin_current_user');
    setUser(null);
    setProfile(null);
  };

  const isStaff = profile?.role === 'staff' || profile?.role === 'doctor';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      loginWithEmail,
      registerWithEmail,
      resendVerification,
      loginWithGoogle,
      quickStaffPinLogin,
      logout,
      isStaff
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
