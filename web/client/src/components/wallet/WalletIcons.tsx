import React from "react";

const WC_PROJECT_ID = "3a8170812b534d0ff9d794f19a901d64";

interface IconProps {
  size?: number;
  className?: string;
}

export const WalletConnectIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      background: "#3B99FC",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
    }}
    className={className}
  >
    <svg width={Math.round(size * 0.65)} height={Math.round(size * 0.65)} viewBox="0 0 300 185" fill="none">
      <path
        d="M59.4 34.6C109.4 -15.4 190.6 -15.4 240.6 34.6L246.6 40.6C249 43 249 47 246.6 49.4L225.8 70.2C224.6 71.4 222.6 71.4 221.4 70.2L213.2 62C178.2 27 121.8 27 86.8 62L78.6 70.2C77.4 71.4 75.4 71.4 74.2 70.2L53.4 49.4C51 47 51 43 53.4 40.6L59.4 34.6ZM287.6 81.6L306.4 100.4C308.8 102.8 308.8 106.8 306.4 109.2L222.2 193.4C219.8 195.8 215.8 195.8 213.4 193.4L154.2 134.2C153.6 133.6 152.6 133.6 152 134.2L92.8 193.4C90.4 195.8 86.4 195.8 84 193.4L0 109.4C-2.4 107 -2.4 103 0 100.6L18.8 81.8C21.2 79.4 25.2 79.4 27.6 81.8L86.8 141C87.4 141.6 88.4 141.6 89 141L148.2 81.8C150.6 79.4 154.6 79.4 157 81.8L216.2 141C216.8 141.6 217.8 141.6 218.4 141L277.6 81.8C280 79.2 284.8 79.2 287.6 81.6Z"
        fill="#ffffff"
      />
    </svg>
  </div>
);

export const PhantomIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/b6ec7b81-bb4f-427d-e290-7631e6e50d00?projectId=${WC_PROJECT_ID}`}
    alt="Phantom"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const SolflareIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/34c0e38d-66c4-470e-1aed-a6fabe2d1e00?projectId=${WC_PROJECT_ID}`}
    alt="Solflare"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const BackpackIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/71ca9daf-a31e-4d2a-fd01-f5dc2dc66900?projectId=${WC_PROJECT_ID}`}
    alt="Backpack"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const CoinbaseIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/04c88bf0-f115-4686-8c29-90a3d018a400?projectId=${WC_PROJECT_ID}`}
    alt="Coinbase Wallet"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const OKXIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/45f2f08e-fc0c-4d62-3e63-404e72170500?projectId=${WC_PROJECT_ID}`}
    alt="OKX Wallet"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const TrustWalletIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/7677b54f-3486-46e2-4e37-bf8747814f00?projectId=${WC_PROJECT_ID}`}
    alt="Trust Wallet"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const RainbowIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=${WC_PROJECT_ID}`}
    alt="Rainbow Wallet"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const LedgerIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <img
    src={`https://explorer-api.walletconnect.com/v3/logo/md/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=${WC_PROJECT_ID}`}
    alt="Ledger"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
    className={className}
  />
);

export const FlintSignerIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
      border: "1px solid rgba(16, 185, 129, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
    className={className}
  >
    <svg width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#10B981" />
    </svg>
  </div>
);

