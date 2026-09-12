"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { db, CardProfile } from "@/lib/db";
import { encryptVaultPayload, decryptVaultPayload } from "@/lib/vaultCrypto";
import { Plus, Trash2, Key, Download, Upload, ShieldCheck, CheckCircle2, AlertTriangle, Sliders } from "lucide-react";

export default function SettingsPage() {
  const [cards, setCards] = useState<CardProfile[]>([]);
  const [token, setToken] = useState("");
  const [bank, setBank] = useState<"HDFC" | "ICICI" | "SBI" | "AXIS" | "AMEX">("HDFC");
  const [cardName, setCardName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [billingDay, setBillingDay] = useState("15");
  const [passwordSchema, setPasswordSchema] = useState("");
  
  const [backupPassphrase, setBackupPassphrase] = useState("");
  const [restorePassphrase, setRestorePassphrase] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadCards = async () => {
    const list = await db.cards.toArray();
    setCards(list);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !lastFourDigits || !creditLimit) {
      setErrorMsg("Card name, last 4 digits, and total limit are required.");
      return;
    }

    const generatedToken = token.trim() || `card_${bank.toLowerCase()}_${lastFourDigits}`;
    const newProfile: CardProfile = {
      token: generatedToken,
      bank,
      cardName: cardName.trim(),
      lastFourDigits: lastFourDigits.trim(),
      creditLimit: parseFloat(creditLimit),
      billingDay: parseInt(billingDay, 10) || 1,
      dueDateOffsetDays: 20,
      passwordSchema: passwordSchema.trim() || "Default Institution Schema",
    };

    await db.cards.put(newProfile);
    setStatusMsg(`Registered credit instrument: ${newProfile.cardName}`);
    setCardName("");
    setLastFourDigits("");
    setCreditLimit("");
    setToken("");
    setPasswordSchema("");
    setErrorMsg("");
    loadCards();
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const handleDeleteCard = async (cardToken: string) => {
    await db.cards.delete(cardToken);
    loadCards();
  };

  // Encrypted Vault Exporter
  const handleExportEncryptedVault = async () => {
    if (!backupPassphrase || backupPassphrase.length < 8) {
      setErrorMsg("Passphrase must be at least 8 characters to encrypt export vault.");
      return;
    }

    try {
      const allCards = await db.cards.toArray();
      const allTransactions = await db.transactions.toArray();

      const dump = {
        exportedAt: new Date().toISOString(),
        cards: allCards,
        transactions: allTransactions,
      };

      const encryptedJson = await encryptVaultPayload(backupPassphrase, dump);
      const blob = new Blob([encryptedJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FinTrack_Encrypted_Vault_${Date.now()}.fintrack`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatusMsg("Encrypted client-side vault generated successfully.");
      setBackupPassphrase("");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch {
      setErrorMsg("Failed to serialize database vault.");
    }
  };

  // Encrypted Vault Restorer
  const handleRestoreEncryptedVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!restorePassphrase) {
      setErrorMsg("Enter the decryption passphrase before uploading the vault file.");
      return;
    }

    try {
      const text = await file.text();
      const decrypted = await decryptVaultPayload(restorePassphrase, text);

      if (decrypted.cards && decrypted.transactions) {
        await db.cards.clear();
        await db.transactions.clear();
        await db.cards.bulkAdd(decrypted.cards);
        await db.transactions.bulkAdd(decrypted.transactions);

        setStatusMsg(`Successfully restored ${decrypted.cards.length} cards and ${decrypted.transactions.length} transactions.`);
        setRestorePassphrase("");
        loadCards();
      }
    } catch {
      setErrorMsg("Decryption failed. Invalid passphrase or corrupted vault file.");
    }
  };

  return (
    <div style={{ backgroundColor: "#F9F8F3", color: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "56px 48px", flex: 1 }}>
        <div style={{ borderBottom: "1px solid #DDD9C9", paddingBottom: "24px", marginBottom: "40px" }}>
          <div className="br-tagline">CARD PORTFOLIO & ENCRYPTED VAULT STORAGE</div>
          <h1 className="br-editorial-title">Instrument Setup & Cryptographic Sync</h1>
          <p style={{ fontSize: "15px", color: "#555555", marginTop: "8px" }}>
            Add customized cards, set decryption schema templates, and produce zero-knowledge AES-256 backup vaults.
          </p>
        </div>

        {statusMsg && (
          <div style={{ backgroundColor: "#EFECE1", border: "1px solid #000000", padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 800 }}>
            <CheckCircle2 size={16} /> {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ backgroundColor: "#FFF0F0", border: "1px solid #D00000", color: "#D00000", padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 800 }}>
            <AlertTriangle size={16} /> {errorMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "40px", alignItems: "start" }}>
          
          {/* Card Registration Form */}
          <section className="br-sand-box">
            <h2 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", marginBottom: "18px" }}>
              Add Instrument Profile
            </h2>

            <form onSubmit={handleCreateCard} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Issuer Bank</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value as any)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontWeight: 800 }}
                  >
                    <option value="HDFC">HDFC</option>
                    <option value="ICICI">ICICI</option>
                    <option value="SBI">SBI</option>
                    <option value="AXIS">AXIS</option>
                    <option value="AMEX">AMEX</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="9012"
                    value={lastFourDigits}
                    onChange={(e) => setLastFourDigits(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Commercial Card Variant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diners Club Black / Magnus Privilege"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Total Assigned Limit (INR)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Cycle Billing Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={billingDay}
                    onChange={(e) => setBillingDay(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>PDF Decryption Password Formula</label>
                <input
                  type="text"
                  placeholder="e.g. First 4 Letters (CAPS) + DDMM of DOB"
                  value={passwordSchema}
                  onChange={(e) => setPasswordSchema(e.target.value)}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                />
              </div>

              <button type="submit" className="br-black-button" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>
                <Plus size={14} /> Commit Card Profile
              </button>
            </form>
          </section>

          {/* AES-GCM Encrypted Vault Section */}
          <section className="br-sand-box">
            <h2 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", marginBottom: "14px" }}>
              AES-GCM Encrypted Vault Sync
            </h2>
            <p style={{ fontSize: "12px", color: "#555555", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              FinTrack does not sync data through servers. Securely migrate your complete database between workstations by producing a client-encrypted <code>.fintrack</code> vault file.
            </p>

            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9C9", padding: "16px", marginBottom: "18px" }}>
              <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", marginBottom: "6px" }}>Export Encrypted Vault</div>
              <input
                type="password"
                placeholder="Passphrase (min 8 chars)"
                value={backupPassphrase}
                onChange={(e) => setBackupPassphrase(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px", marginBottom: "10px" }}
              />
              <button
                onClick={handleExportEncryptedVault}
                className="br-black-button"
                style={{ width: "100%", justifyContent: "center", padding: "8px 0" }}
              >
                <Download size={13} /> Export .fintrack Vault
              </button>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9C9", padding: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", marginBottom: "6px" }}>Restore Encrypted Vault</div>
              <input
                type="password"
                placeholder="Enter Vault Decryption Passphrase"
                value={restorePassphrase}
                onChange={(e) => setRestorePassphrase(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px", marginBottom: "10px" }}
              />
              <input
                type="file"
                accept=".fintrack,.json"
                id="vault-restore-file"
                style={{ display: "none" }}
                onChange={handleRestoreEncryptedVault}
              />
              <label
                htmlFor="vault-restore-file"
                className="br-black-button"
                style={{ width: "100%", justifyContent: "center", padding: "8px 0", cursor: "pointer", display: "flex" }}
              >
                <Upload size={13} /> Select .fintrack Vault File
              </label>
            </div>
          </section>
        </div>

        {/* Configured Cards Matrix */}
        <section style={{ marginTop: "48px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px" }}>
            Active Registered Instruments ({cards.length})
          </h3>

          <div style={{ border: "1px solid #DDD9C9", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#EFECE1", borderBottom: "1px solid #DDD9C9", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "11px" }}>
                  <th style={{ padding: "12px 16px" }}>Instrument Token</th>
                  <th style={{ padding: "12px 16px" }}>Bank</th>
                  <th style={{ padding: "12px 16px" }}>Card Variant</th>
                  <th style={{ padding: "12px 16px" }}>Limit (INR)</th>
                  <th style={{ padding: "12px 16px" }}>Billing Day</th>
                  <th style={{ padding: "12px 16px" }}>Password Schema</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c) => (
                  <tr key={c.token} style={{ borderBottom: "1px solid #E8E4D5", backgroundColor: "#F9F8F3" }}>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace" }}>{c.token}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 800 }}>{c.bank}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 900 }}>{c.cardName} (•••• {c.lastFourDigits})</td>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace" }}>₹{c.creditLimit.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "10px 16px" }}>Day {c.billingDay}</td>
                    <td style={{ padding: "10px 16px", color: "#666666" }}>{c.passwordSchema}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteCard(c.token)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#888888" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: "#000000", color: "#ffffff", padding: "24px 48px", textAlign: "center", fontSize: "11px", textTransform: "uppercase" }}>
        FinTrack Core Settings • AES-GCM-256 Client-Side Vault Engine
      </footer>
    </div>
  );
}