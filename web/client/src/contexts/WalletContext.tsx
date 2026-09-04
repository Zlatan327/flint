import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string;
  isInstalled: boolean;
  detect: () => any;
}

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  walletAddress: string | null;
  walletName: string | null;
  balance: number | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  connectWallet: (wallet: WalletOption) => Promise<void>;
  disconnectWallet: () => void;
  availableWallets: WalletOption[];
}

const DEVNET_RPC = "https://api.devnet.solana.com";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch balance from Solana Devnet RPC
  const fetchBalance = useCallback(async (pubkey: string) => {
    try {
      const response = await fetch(DEVNET_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [pubkey],
        }),
      });
      const data = await response.json();
      if (data.result && typeof data.result.value === "number") {
        setBalance(data.result.value / 1_000_000_000);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  }, []);

  // Standard Solana wallet providers list
  const getWallets = useCallback((): WalletOption[] => {
    const isBrowser = typeof window !== "undefined";
    const win = isBrowser ? (window as any) : {};

    return [
      {
        id: "phantom",
        name: "Phantom",
        icon: "🟣",
        url: "https://phantom.app/download",
        description: "Leading Solana wallet & browser extension",
        isInstalled: Boolean(win.phantom?.solana?.isPhantom || win.solana?.isPhantom),
        detect: () => win.phantom?.solana || (win.solana?.isPhantom ? win.solana : null),
      },
      {
        id: "solflare",
        name: "Solflare",
        icon: "🟠",
        url: "https://solflare.com/",
        description: "High-performance native Solana wallet",
        isInstalled: Boolean(win.solflare?.isSolflare),
        detect: () => (win.solflare?.isSolflare ? win.solflare : null),
      },
      {
        id: "backpack",
        name: "Backpack",
        icon: "🎒",
        url: "https://backpack.app/",
        description: "Developer-first xNFT wallet by Coral",
        isInstalled: Boolean(win.backpack?.isBackpack),
        detect: () => (win.backpack?.isBackpack ? win.backpack : null),
      },
      {
        id: "coinbase",
        name: "Coinbase Wallet",
        icon: "🔵",
        url: "https://www.coinbase.com/wallet",
        description: "Official Coinbase self-custody wallet",
        isInstalled: Boolean(win.coinbaseSolana),
        detect: () => win.coinbaseSolana || null,
      },
      {
        id: "okx",
        name: "OKX Wallet",
        icon: "⚪",
        url: "https://www.okx.com/web3",
        description: "Universal multi-chain Web3 wallet",
        isInstalled: Boolean(win.okxwallet?.solana),
        detect: () => win.okxwallet?.solana || null,
      },
      {
        id: "devnet_demo",
        name: "Flint Devnet Signer",
        icon: "⚡",
        url: "",
        description: "Live Codespace deployer wallet (0.05 SOL)",
        isInstalled: true,
        detect: () => ({
          isDemo: true,
          publicKey: { toString: () => "HQexps4XRk9ZxVxyD4RaZEoK51MqDPqxY1aBuAk8qRZw" },
        }),
      },
    ];
  }, []);

  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  useEffect(() => {
    setAvailableWallets(getWallets());
  }, [getWallets]);

  // Connect handler
  const connectWallet = async (wallet: WalletOption) => {
    try {
      setConnecting(true);
      const provider = wallet.detect();

      if (!provider) {
        // Not installed: redirect to official install site
        window.open(wallet.url, "_blank", "noopener,noreferrer");
        setConnecting(false);
        return;
      }

      let pubkeyStr = "";

      if (provider.isDemo) {
        pubkeyStr = provider.publicKey.toString();
      } else {
        const resp = await provider.connect();
        pubkeyStr = (resp?.publicKey || provider.publicKey)?.toString();
      }

      if (pubkeyStr) {
        setWalletAddress(pubkeyStr);
        setWalletName(wallet.name);
        setConnected(true);
        localStorage.setItem("flint_wallet_name", wallet.name);
        localStorage.setItem("flint_wallet_address", pubkeyStr);
        fetchBalance(pubkeyStr);
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setWalletAddress(null);
    setWalletName(null);
    setBalance(null);
    localStorage.removeItem("flint_wallet_name");
    localStorage.removeItem("flint_wallet_address");
  };

  // Reconnect previous session
  useEffect(() => {
    const savedAddress = localStorage.getItem("flint_wallet_address");
    const savedName = localStorage.getItem("flint_wallet_name");
    if (savedAddress && savedName) {
      setWalletAddress(savedAddress);
      setWalletName(savedName);
      setConnected(true);
      fetchBalance(savedAddress);
    }
  }, [fetchBalance]);

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        walletAddress,
        walletName,
        balance,
        isModalOpen,
        setIsModalOpen,
        connectWallet,
        disconnectWallet,
        availableWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useFlintWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useFlintWallet must be used within a WalletProvider");
  }
  return context;
};
