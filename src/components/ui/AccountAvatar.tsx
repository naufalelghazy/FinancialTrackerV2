import React, { useState } from 'react';
import type { Account } from '../../types';
import { getLogoDevUrl, getLocalFallback } from '../../services/logoService';

interface AccountAvatarProps {
  acc: Account;
  size?: 'sm' | 'md';
}

export const AccountAvatar: React.FC<AccountAvatarProps> = ({ acc, size = 'md' }) => {
  const [hasError, setHasError] = useState(false);
  const logoDevUrl = getLogoDevUrl(acc.name, acc.website);
  const localFallback = getLocalFallback(acc.name);
  const candidateUrl = !hasError && (acc.icon || logoDevUrl);

  const sizeClasses =
    size === 'sm'
      ? 'w-6 h-6 rounded-[6px] p-0.5 text-[9px]'
      : 'w-10 h-10 rounded-[8px] p-1 text-xs';

  if (candidateUrl) {
    return (
      <img
        src={candidateUrl}
        alt=""
        aria-hidden="true"
        onError={() => setHasError(true)}
        className={`${sizeClasses} object-contain bg-white dark:bg-[#252836] border border-[#dedee5] dark:border-[#282937] shadow-2xs shrink-0`}
      />
    );
  }

  if (localFallback) {
    return (
      <img
        src={localFallback}
        alt=""
        aria-hidden="true"
        className={`${sizeClasses} object-contain bg-white dark:bg-[#252836] border border-[#dedee5] dark:border-[#282937] shadow-2xs shrink-0`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClasses} bg-[#f1edfe] text-[#7132f5] flex items-center justify-center font-bold border border-[#dedee5] dark:border-[#282937] shrink-0`}
    >
      {acc.name.slice(0, 3).toUpperCase()}
    </div>
  );
};
