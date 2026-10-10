/**
 * High-performance image optimization utility.
 * Automatically injects Cloudinary on-the-fly transformations (f_auto, q_auto, w_*)
 * to serve modern WebP/AVIF formats with optimal compression, preventing massive
 * multi-megabyte payloads, network congestion, and HTTP/2 protocol stream aborts.
 */
export function optimizeCloudinary(url: string, width?: number): string {
  if (!url || typeof url !== 'string') return url;
  
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  // Avoid double-applying transformations
  if (url.includes('f_auto') || url.includes('q_auto')) {
    return url;
  }

  const transforms: string[] = ['f_auto', 'q_auto'];
  if (width && width > 0) {
    transforms.push(`w_${width}`);
  }

  return url.replace('/image/upload/', `/image/upload/${transforms.join(',')}/`);
}
