import { useState } from 'react';
import { apiUrl } from '@/utils/api';
import bundledAvatar from '@/assets/tosif-avatar.jpg';

export function getProfilePhotoSources(profile) {
  const githubUrl = profile?.socials?.github || '';
  const githubUsername = githubUrl.match(/github\.com\/([^/?#]+)/i)?.[1];
  const githubPhoto = githubUsername ? `https://github.com/${githubUsername}.png?size=384` : '';
  const avatarUrl = profile?.avatarUrl?.trim();
  // Serve this known profile's GitHub photo with the site; CMS uploads still win.
  const isBundledAvatar = /^https:\/\/avatars\.githubusercontent\.com\/u\/160727165(?:\?|$)/i.test(avatarUrl || '');
  const uploadedPhoto = isBundledAvatar ? bundledAvatar : avatarUrl ? apiUrl(avatarUrl) : '';
  const accountPhoto = githubUsername?.toLowerCase() === 'tosifraza' ? bundledAvatar : githubPhoto;

  return {
    primary: uploadedPhoto || accountPhoto,
    fallback: uploadedPhoto && accountPhoto && uploadedPhoto !== accountPhoto ? accountPhoto : '',
  };
}

export default function ProfilePhoto({ profile, name, alt = '', className = '' }) {
  const sources = getProfilePhotoSources(profile);
  return <Photo key={`${sources.primary}|${sources.fallback}`} sources={sources} name={name} alt={alt} className={className} />;
}

function Photo({ sources, name, alt, className }) {
  const [failedSource, setFailedSource] = useState('');
  const [loaded, setLoaded] = useState(false);
  const initials = (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

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
          fetchpriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(false); setFailedSource(imageSrc); }}
        />
      )}
    </div>
  );
}
