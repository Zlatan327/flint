import React, { useState, useEffect } from "react";
import {
  X,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Send,
  Wallet,
} from "lucide-react";
import { useFlintWallet } from "@/contexts/WalletContext";
import { transferSolOnChain } from "@/lib/flint-escrow-client";
import { PublicKey } from "@solana/web3.js";

export const SendWithdrawModal: React.FC = () => {
  const {
    connected,
    walletAddress,
    balance,
    refreshBalance,
    isSendModalOpen,
    setIsSendModalOpen,
    setIsModalOpen,
  } = useFlintWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  // Address validation
  const [isRecipientValid, setIsRecipientValid] = useState<boolean | null>(null);
  const [addressWarning, setAddressWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!recipient.trim()) {
      setIsRecipientValid(null);
      setAddressWarning(null);
      return;
    }

    try {
      const pubkey = new PublicKey(recipient.trim());
      const isValid = PublicKey.isOnCurve(pubkey.toBuffer());
      setIsRecipientValid(isValid);

      if (walletAddress && pubkey.toBase58().toLowerCase() === walletAddress.toLowerCase()) {
        setAddressWarning("Notice: Destination is your own connected wallet address.");
      } else {
        setAddressWarning(null);
      }
    } catch {
      setIsRecipientValid(false);
      setAddressWarning("Invalid Solana base58 public key format.");
    }
  }, [recipient, walletAddress]);

  if (!isSendModalOpen) return null;

  const currentBalance = balance ?? 0;
  const numAmount = parseFloat(amount) || 0;
  const estimatedFee = 0.000005;
  const maxSpendable = Math.max(0, currentBalance - 0.002);
  const remainingBalance = Math.max(0, currentBalance - numAmount - estimatedFee);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setRecipient(text.trim());
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleSetPreset = (val: number) => {
    setAmount(val.toString());
  };

  const handleSetMax = () => {
    setAmount(maxSpendable > 0 ? maxSpendable.toFixed(4) : "0");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !walletAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!isRecipientValid) {
      setErrorText("Please enter a valid Solana recipient public key.");
      return;
    }

    if (numAmount <= 0) {
      setErrorText("Please enter an amount greater than 0 SOL.");
      return;
    }

    if (numAmount > currentBalance) {
      setErrorText(`Insufficient balance. You have ${currentBalance.toFixed(4)} SOL.`);
      return;
    }

    setLoading(true);
    setErrorText(null);
    setStatusText("Preparing Solana Devnet transfer transaction...");

    try {
      const win = window as any;
      const provider =
        win.okxwallet?.solana ||
        win.phantom?.solana ||
        win.solflare ||
        win.backpack ||
        win.solana;

      if (!provider) {
        throw new Error("No Solana wallet provider detected.");
      }

      setStatusText("Awaiting signature in wallet...");
      const senderPubkey = new PublicKey(walletAddress);

      const sig = await transferSolOnChain(
        recipient.trim(),
        numAmount,
        senderPubkey,
        provider
      );

      setTxSignature(sig);
      setStatusText("Transaction confirmed!");
      await refreshBalance();
    } catch (err: any) {
      console.error("Transfer failed:", err);
      setErrorText(err?.message || "Transaction failed or was rejected by wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecipient("");
    setAmount("");
    setTxSignature(null);
    setErrorText(null);
    setStatusText("");
  };

  const handleClose = () => {
    handleReset();
    setIsSendModalOpen(false);
  };

  const handleCopyTx = () => {
    if (txSignature) {
      navigator.clipboard.writeText(txSignature);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          margin: "1rem",
          backgroundColor: "#0a0c10",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.95)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255, 107, 0, 0.12)",
                border: "1px solid rgba(255, 107, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowUpRight size={18} color="#FF6B00" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="mono" style={{ fontSize: "0.68rem", color: "#FF6B00", letterSpacing: "0.08em", fontWeight: 700 }}>
                  TREASURY / OUTFLOW
                </span>
                <span className="mono" style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.06)", color: "rgba(255, 255, 255, 0.5)" }}>
                  DEVNET L1
                </span>
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
                Send & Withdraw SOL
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: "1.5rem" }}>
          {txSignature ? (
            /* Success State */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div
                style={{
                  padding: "1.5rem",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "10px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10b981",
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>

                <h4 style={{ color: "#fff", fontSize: "1.1rem", margin: 0 }}>
                  Transfer Settled on Devnet!
                </h4>

                <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 700, color: "#10b981" }}>
                  {numAmount.toFixed(4)} SOL
                </div>

                <div className="mono" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", maxWidth: "340px", wordBreak: "break-all" }}>
                  Sent to: <span style={{ color: "#38bdf8" }}>{recipient}</span>
                </div>
              </div>

              {/* Transaction Hash Card */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                className="mono"
              >
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "10px" }}>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", display: "block" }}>
                    ON-CHAIN TRANSACTION SIGNATURE:
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#FF6B00" }}>
                    {txSignature.slice(0, 16)}...{txSignature.slice(-16)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={handleCopyTx}
                    style={{
                      padding: "5px 8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "5px",
                      color: copiedTx ? "#10b981" : "#fff",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedTx ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "5px 10px",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "5px",
                      color: "#10b981",
                      fontSize: "0.72rem",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 600,
                    }}
                  >
                    EXPLORER <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mono"
                  style={{
                    padding: "0.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  NEW WITHDRAWAL
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mono"
                  style={{
                    padding: "0.75rem",
                    background: "#10b981",
                    border: "none",
                    borderRadius: "8px",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  DONE
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Available Balance Strip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Wallet size={15} color="rgba(255,255,255,0.4)" />
                  <span className="mono" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                    AVAILABLE BALANCE:
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong className="mono" style={{ color: "#fff", fontSize: "0.95rem" }}>
                    {balance !== null ? balance.toFixed(4) : "—"} SOL
                  </strong>
                  <button
                    type="button"
                    onClick={() => refreshBalance()}
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "2px" }}
                    title="Refresh balance"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>

              {/* Recipient Address */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}>
                    DESTINATION WALLET ADDRESS (SOLANA)
                  </label>
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="mono"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#FF6B00",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    PASTE
                  </button>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    placeholder="Enter any Solana address (e.g. 7xKX...)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={loading}
                    className="mono"
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 12px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border:
                        isRecipientValid === false
                          ? "1px solid #ef4444"
                          : isRecipientValid === true
                          ? "1px solid #10b981"
                          : "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "0.82rem",
                      outline: "none",
                    }}
                  />
                  {isRecipientValid === true && (
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#10b981" }}>
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                  {isRecipientValid === false && (
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#ef4444" }}>
                      <AlertTriangle size={16} />
                    </span>
                  )}
                </div>

                {addressWarning && (
                  <span className="mono" style={{ fontSize: "0.68rem", color: isRecipientValid === false ? "#ef4444" : "#f59e0b" }}>
                    {addressWarning}
                  </span>
                )}
              </div>

              {/* Amount Input & Presets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}>
                    AMOUNT TO SEND / WITHDRAW
                  </label>
                  <span className="mono" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>
                    MAX SPENDABLE: {maxSpendable.toFixed(4)} SOL
                  </span>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    className="mono"
                    style={{
                      width: "100%",
                      padding: "10px 50px 10px 12px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      outline: "none",
                    }}
                  />
                  <span
                    className="mono"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#FF6B00",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    SOL
                  </span>
                </div>

                {/* Preset Chips */}
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  {[0.1, 0.5, 1.0, 2.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSetPreset(preset)}
                      className="mono"
                      style={{
                        flex: 1,
                        padding: "5px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "5px",
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                      }}
                    >
                      {preset} SOL
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSetMax}
                    className="mono"
                    style={{
                      flex: 1,
                      padding: "5px",
                      background: "rgba(255, 107, 0, 0.1)",
                      border: "1px solid rgba(255, 107, 0, 0.3)",
                      borderRadius: "5px",
                      color: "#FF6B00",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Execution Summary Breakdown */}
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
                className="mono"
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>NETWORK / SETTLEMENT:</span>
                  <span style={{ color: "#10b981" }}>SOLANA DEVNET L1 (CONFIRMED)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>ESTIMATED GAS FEE:</span>
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>~{estimatedFee.toFixed(6)} SOL</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>REMAINING BALANCE:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{remainingBalance.toFixed(4)} SOL</span>
                </div>
              </div>

              {errorText && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "6px",
                    color: "#ef4444",
                    fontSize: "0.75rem",
                  }}
                  className="mono"
                >
                  {errorText}
                </div>
              )}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF6B00", fontSize: "0.78rem" }} className="mono">
                  <Loader2 size={15} className="animate-spin" />
                  <span>{statusText}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isRecipientValid || numAmount <= 0 || numAmount > currentBalance}
                className="mono"
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "8px",
                  background:
                    loading || !isRecipientValid || numAmount <= 0 || numAmount > currentBalance
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#FF6B00",
                  color:
                    loading || !isRecipientValid || numAmount <= 0 || numAmount > currentBalance
                      ? "rgba(255, 255, 255, 0.3)"
                      : "#000",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor:
                    loading || !isRecipientValid || numAmount <= 0 || numAmount > currentBalance
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 160ms var(--ease-out)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    EXECUTING ON-CHAIN WITHDRAWAL...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    {numAmount > 0
                      ? `CONFIRM & WITHDRAW ${numAmount.toFixed(4)} SOL`
                      : "ENTER AMOUNT TO WITHDRAW"}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};