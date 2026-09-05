import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { WalletConnectModal } from "@walletconnect/modal";

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
  openWalletConnect: () => Promise<void>;
  connectWallet: (wallet: WalletOption) => Promise<void>;
  disconnectWallet: () => void;
  requestAirdrop: () => Promise<any>;
  refreshBalance: () => Promise<void>;
  availableWallets: WalletOption[];
}

const DEVNET_RPC = "https://api.devnet.solana.com";
const WC_PROJECT_ID = "3a8170812b534d0ff9d794f19a901d64";

let wcModalInstance: WalletConnectModal | null = null;

const getWalletConnectModal = (): WalletConnectModal | null => {
  if (typeof window === "undefined") return null;
  if (!wcModalInstance) {
    wcModalInstance = new WalletConnectModal({
      projectId: WC_PROJECT_ID,
      chains: ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
      themeMode: "dark",
      themeVariables: {
        "--wcm-accent-color": "#3B99FC",
        "--wcm-background-color": "#0a0c10",
        "--wcm-z-index": "99999",
      },
    });
  }
  return wcModalInstance;
};

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
        id: "walletconnect",
        name: "WalletConnect",
        icon: "walletconnect",
        url: "https://walletconnect.com/",
        description: "Universal QR code for 300+ mobile & desktop wallets",
        isInstalled: true,
        detect: () => ({ isWalletConnect: true }),
      },
      {
        id: "phantom",
        name: "Phantom",
        icon: "phantom",
        url: "https://phantom.app/download",
        description: "Leading Solana wallet & browser extension",
        isInstalled: Boolean(win.phantom?.solana?.isPhantom || win.solana?.isPhantom),
        detect: () => win.phantom?.solana || (win.solana?.isPhantom ? win.solana : null),
      },
      {
        id: "solflare",
        name: "Solflare",
        icon: "solflare",
        url: "https://solflare.com/",
        description: "High-performance native Solana wallet",
        isInstalled: Boolean(win.solflare?.isSolflare),
        detect: () => (win.solflare?.isSolflare ? win.solflare : null),
      },
      {
        id: "backpack",
        name: "Backpack",
        icon: "backpack",
        url: "https://backpack.app/",
        description: "Developer-first xNFT wallet by Coral",
        isInstalled: Boolean(win.backpack?.isBackpack),
        detect: () => (win.backpack?.isBackpack ? win.backpack : null),
      },
      {
        id: "coinbase",
        name: "Coinbase Wallet",
        icon: "coinbase",
        url: "https://www.coinbase.com/wallet",
        description: "Official Coinbase self-custody wallet",
        isInstalled: Boolean(win.coinbaseSolana),
        detect: () => win.coinbaseSolana || null,
      },
      {
        id: "okx",
        name: "OKX Wallet",
        icon: "okx",
        url: "https://www.okx.com/web3",
        description: "Universal multi-chain Web3 wallet",
        isInstalled: Boolean(win.okxwallet?.solana),
        detect: () => win.okxwallet?.solana || null,
      },
      {
        id: "trust",
        name: "Trust Wallet",
        icon: "trust",
        url: "https://trustwallet.com/",
        description: "Mobile & browser multi-chain wallet",
        isInstalled: Boolean(win.trustwallet?.solana),
        detect: () => win.trustwallet?.solana || null,
      },
      {
        id: "rainbow",
        name: "Rainbow Wallet",
        icon: "rainbow",
        url: "https://rainbow.me/",
        description: "Fun, simple, and secure mobile wallet",
        isInstalled: Boolean(win.rainbow),
        detect: () => win.rainbow || null,
      },
      {
        id: "ledger",
        name: "Ledger",
        icon: "ledger",
        url: "https://www.ledger.com/",
        description: "Hardware security wallet connection",
        isInstalled: false,
        detect: () => null,
      },
      {
        id: "devnet_demo",
        name: "Flint Devnet Signer",
        icon: "flint",
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

  const openWalletConnect = useCallback(async () => {
    try {
      setIsModalOpen(false);
      const modal = getWalletConnectModal();
      if (modal) {
        await modal.openModal();
      }
    } catch (err: any) {
      console.error("WalletConnect open error:", err);
    }
  }, []);

  // Connect handler
  const connectWallet = async (wallet: WalletOption) => {
    try {
      setConnecting(true);

      if (wallet.id === "walletconnect") {
        await openWalletConnect();
        setConnecting(false);
        return;
      }

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
    try {
      const win = window as any;
      if (win.phantom?.solana?.disconnect) {
        win.phantom.solana.disconnect().catch(() => {});
      }
      if (win.solflare?.disconnect) {
        win.solflare.disconnect().catch(() => {});
      }
    } catch (_) {}

    setConnected(false);
    setWalletAddress(null);
    setWalletName(null);
    setBalance(null);
    localStorage.removeItem("flint_wallet_name");
    localStorage.removeItem("flint_wallet_address");
  };

  const refreshBalance = useCallback(async () => {
    if (walletAddress) {
      await fetchBalance(walletAddress);
    }
  }, [walletAddress, fetchBalance]);

  const requestAirdrop = async () => {
    if (!walletAddress) throw new Error("Wallet not connected.");
    try {
      const response = await fetch(DEVNET_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "requestAirdrop",
          params: [walletAddress, 1_000_000_000], // 1 SOL
        }),
      });
      const data = await response.json();
      if (data.result) {
        setTimeout(() => {
          fetchBalance(walletAddress);
        }, 2000);
        return data.result;
      } else if (data.error) {
        throw new Error(data.error.message || "Airdrop limit reached on Devnet RPC.");
      }
    } catch (err: any) {
      console.error("Airdrop request failed:", err);
      throw err;
    }
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
        openWalletConnect,
        connectWallet,
        disconnectWallet,
        requestAirdrop,
        refreshBalance,
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
