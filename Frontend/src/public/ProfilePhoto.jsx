import { useEffect, useState } from 'react';
import { apiUrl } from '@/utils/api';

export function getProfilePhotoSources(profile) {
  const githubUrl = profile?.socials?.github || '';
  const githubUsername = githubUrl.match(/github\.com\/([^/?#]+)/i)?.[1];
  const githubPhoto = githubUsername ? `https://github.com/${githubUsername}.png?size=384` : '';
  const avatarUrl = profile?.avatarUrl?.trim();
  const uploadedPhoto = avatarUrl ? apiUrl(avatarUrl) : '';

  return {
    primary: uploadedPhoto || githubPhoto,
    fallback: uploadedPhoto && githubPhoto && uploadedPhoto !== githubPhoto ? githubPhoto : '',
  };
}

export default function ProfilePhoto({ profile, name, alt = '', className = '' }) {
  const sources = getProfilePhotoSources(profile);
  const [failedSource, setFailedSource] = useState('');
  const [loaded, setLoaded] = useState(false);
  const initials = (name || 'Tosif Raza')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    setFailedSource('');
    setLoaded(false);
  }, [sources.primary, sources.fallback]);

  const imageSrc = !failedSource
    ? sources.primary
    : failedSource === sources.primary
      ? sources.fallback
      : '';

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-primary/10 ${className}`}>
      <span className={`absolute inset-0 flex items-center justify-center font-bold text-primary/70 transition-opacity ${loaded ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
        {initials}
      </span>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailedSource(imageSrc)}
        />
      )}
    </div>
  );
}
