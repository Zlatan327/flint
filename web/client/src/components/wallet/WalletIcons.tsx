import React from "react";

export const PhantomIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="26" fill="#AB9FF2" />
    <path
      d="M102.3 84.1c-3.1 7.8-10.4 14.1-19.4 16.4-14.8 3.8-30.8 1.4-43.9-6.5-6.7-4-12.2-9.6-15.6-16.5-3.3-6.6-4.4-14.1-3.2-21.4 1.2-7.2 4.6-13.8 9.8-18.9 5.4-5.2 12.2-8.7 19.6-10 13.9-2.5 28.3 1.5 39 10.7 7.7 6.6 12.8 15.6 14.3 25.6 1.4 9.3-.6 18.7-4.6 27.1z"
      fill="white"
    />
    <path d="M68 60a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM48 60a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="#AB9FF2" />
  </svg>
);

export const SolflareIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#18181B" />
    <path
      d="M49.9 18c-3.1 7.2-5.4 15-2.2 23.3 2.8 7.3 8.3 13 11.8 20.2 4.8 9.9 3.5 21.6-3.8 29.8 11.2-5.4 18.6-17.1 17.5-29.8-.8-9.4-6.3-17.7-11.8-25.2-3.8-5.3-8.2-11.7-11.5-18.3z"
      fill="#FC6E38"
    />
    <path
      d="M50.1 82c3.1-7.2 5.4-15 2.2-23.3-2.8-7.3-8.3-13-11.8-20.2-4.8-9.9-3.5-21.6 3.8-29.8-11.2 5.4-18.6 17.1-17.5 29.8.8 9.4 6.3 17.7 11.8 25.2 3.8 5.3 8.2 11.7 11.5 18.3z"
      fill="#F83B00"
    />
  </svg>
);

export const BackpackIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#E33E38" />
    <path d="M38 28c0-3.5 2.8-6 6-6h12c3.5 0 6 2.5 6 6v6H38v-6z" fill="#991B1B" />
    <rect x="28" y="34" width="44" height="44" rx="10" fill="#FFFFFF" />
    <rect x="34" y="44" width="32" height="26" rx="6" fill="#DC2626" />
    <rect x="46" y="44" width="8" height="6" rx="2" fill="#FFFFFF" />
  </svg>
);

export const CoinbaseIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#0052FF" />
    <circle cx="50" cy="50" r="26" fill="white" />
    <rect x="43" y="43" width="14" height="14" rx="3" fill="#0052FF" />
  </svg>
);

export const OKXIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#0A0A0A" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    <rect x="26" y="26" width="20" height="20" rx="4" fill="white" />
    <rect x="54" y="26" width="20" height="20" rx="4" fill="white" />
    <rect x="40" y="40" width="20" height="20" rx="4" fill="black" />
    <rect x="26" y="54" width="20" height="20" rx="4" fill="white" />
    <rect x="54" y="54" width="20" height="20" rx="4" fill="white" />
  </svg>
);

export const FlintSignerIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#064E3B" border="1px solid #10B981" />
    <path d="M54 18L32 52h18l-4 28 22-34H50l4-28z" fill="#10B981" />
  </svg>
);
