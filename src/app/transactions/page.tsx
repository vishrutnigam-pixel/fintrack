"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { db, TransactionRecord } from "@/lib/db";
import { Plus, Upload, Trash2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  const [bankName, setBankName] = useState<"HDFC" | "ICICI" | "SBI" | "AXIS" | "AMEX" | "OTHER">("HDFC");
  const [cardTokenId, setCardTokenId] = useState("");
  const [date, setDate] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Digital Subscriptions");
  const [isRecurring, setIsRecurring] = useState(false);
  const [baselineAmount, setBaselineAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [batchRaw, setBatchRaw] = useState("");
  const [recentEntries, setRecentEntries] = useState<TransactionRecord[]>([]);

  const refreshRecent = async () => {
    const list = await db.transactions.toArray();
    setRecentEntries(list.slice(-5).reverse());
  };

  useEffect(() => {
    refreshRecent();
  }, []);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount || !date) {
      setStatusMessage("Missing required fields: Date, Merchant, or Amount.");
      return;
    }

    const numAmount = parseFloat(amount);
    const numBase = baselineAmount ? parseFloat(baselineAmount) : undefined;
    const isSurge = isRecurring && numBase !== undefined && numAmount > numBase;

    const newRecord: TransactionRecord = {
      bankName,
      cardTokenId: cardTokenId.trim() || `${bankName}-MANUAL`,
      date,
      merchant: merchant.trim(),
      amount: numAmount,
      baselineAmount: numBase,
      category,
      isRecurring,
      flagType: isSurge ? "PriceHike" : isRecurring ? "Subscription" : "Normal",
      status: isSurge ? "Flagged" : "Active",
    };

    await db.transactions.add(newRecord);
    setStatusMessage(`Successfully committed ${newRecord.merchant} to local ledger.`);
    setMerchant("");
    setAmount("");
    setBaselineAmount("");
    refreshRecent();
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const handleBatchParse = async () => {
    if (!batchRaw.trim()) return;
    const lines = batchRaw.trim().split("\n");
    const parsed: TransactionRecord[] = [];

    for (const line of lines) {
      // Expecting CSV format: Date, Issuer, CardToken, Merchant, Category, Amount, IsRecurring(true/false), BaselineAmount
      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length >= 4) {
        const entryDate = cols[0] || new Date().toISOString().split("T")[0];
        const entryBank = (["HDFC", "ICICI", "SBI", "AXIS", "AMEX"].includes(cols[1]?.toUpperCase()) ? cols[1].toUpperCase() : "OTHER") as any;
        const entryToken = cols[2] || `${entryBank}-IMPORT`;
        const entryMerchant = cols[3];
        const entryCategory = cols[4] || "Uncategorized";
        const entryAmount = parseFloat(cols[5]) || 0;
        const entryRecurring = cols[6]?.toLowerCase() === "true";
        const entryBaseline = cols[7] ? parseFloat(cols[7]) : undefined;
        const isSurge = entryRecurring && entryBaseline !== undefined && entryAmount > entryBaseline;

        parsed.push({
          date: entryDate,
          bankName: entryBank,
          cardTokenId: entryToken,
          merchant: entryMerchant,
          category: entryCategory,
          amount: entryAmount,
          isRecurring: entryRecurring,
          baselineAmount: entryBaseline,
          flagType: isSurge ? "PriceHike" : entryRecurring ? "Subscription" : "Normal",
          status: isSurge ? "Flagged" : "Active",
        });
      }
    }

    if (parsed.length > 0) {
      await db.transactions.bulkAdd(parsed);
      setStatusMessage(`Ingested ${parsed.length} items directly into browser IndexedDB.`);
      setBatchRaw("");
      refreshRecent();
      setTimeout(() => setStatusMessage(""), 4000);
    } else {
      setStatusMessage("Could not parse records. Verify CSV format: Date, Bank, CardID, Merchant, Category, Amount");
    }
  };

  return (
    <div style={{ backgroundColor: "#F9F8F3", color: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "56px 48px", flex: 1 }}>
        <div style={{ borderBottom: "1px solid #DDD9C9", paddingBottom: "24px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="br-tagline">DATA PIPELINE</div>
            <h1 className="br-editorial-title">Direct Transaction Entry & Ledger Sync</h1>
            <p style={{ fontSize: "15px", color: "#555555", marginTop: "8px" }}>
              Inject manual debits or batch-import statement CSV records directly into client-side encrypted storage.
            </p>
          </div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#000000",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "12px 20px",
              textDecoration: "none",
            }}
          >
            <span>Return to Live Audit</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {statusMessage && (
          <div style={{ backgroundColor: "#EFECE1", border: "1px solid #000000", padding: "14px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "40px", alignItems: "start" }}>
          
          {/* Single Transaction Form */}
          <section className="br-sand-box">
            <h2 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", marginBottom: "20px" }}>
              Manual Posting Entry
            </h2>

            <form onSubmit={handleSingleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Issuer Bank
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value as any)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontWeight: 700 }}
                  >
                    <option value="HDFC">HDFC</option>
                    <option value="ICICI">ICICI</option>
                    <option value="SBI">SBI</option>
                    <option value="AXIS">AXIS</option>
                    <option value="AMEX">AMEX</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Card Identifier / Token
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REGALIA-4401"
                    value={cardTokenId}
                    onChange={(e) => setCardTokenId(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Posting Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: "100%", padding: "9px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Classification Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontWeight: 700 }}
                  >
                    <option value="Digital Subscriptions">Digital Subscriptions</option>
                    <option value="Cloud & Dev">Cloud & Dev</option>
                    <option value="Dining & Lifestyle">Dining & Lifestyle</option>
                    <option value="Travel & Transit">Travel & Transit</option>
                    <option value="General Debit">General Debit</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Merchant Narration / Entity
                </label>
                <input
                  type="text"
                  placeholder="e.g. OpenAI ChatGPT Subscription"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Debit Amount (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1999.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Baseline Amount (For Surge Audit)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1650.00"
                    value={baselineAmount}
                    onChange={(e) => setBaselineAmount(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0" }}>
                <input
                  type="checkbox"
                  id="recurring-check"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="recurring-check" style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}>
                  Recurring Mandate / Standing Instruction
                </label>
              </div>

              <button
                type="submit"
                className="br-black-button"
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
              >
                <Plus size={14} /> Commit Entry to Storage
              </button>
            </form>
          </section>

          {/* Batch CSV Parser Section */}
          <section className="br-sand-box">
            <h2 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", marginBottom: "12px" }}>
              Batch Statement Import
            </h2>
            <p style={{ fontSize: "12px", color: "#555555", lineHeight: 1.5, marginBottom: "16px" }}>
              Paste comma-separated rows. Schema:<br />
              <code style={{ fontSize: "11px", backgroundColor: "#FFFFFF", padding: "2px 6px", border: "1px solid #DDD9C9", display: "inline-block", marginTop: "4px" }}>
                Date, Bank, CardToken, Merchant, Category, Amount, IsRecurring(true/false), BaselineAmount
              </code>
            </p>

            <textarea
              value={batchRaw}
              onChange={(e) => setBatchRaw(e.target.value)}
              placeholder={`2026-09-02, HDFC, REGALIA-9012, AWS India, Cloud & Dev, 14280.50, true, 11200\n2026-09-01, HDFC, REGALIA-9012, Netflix India, Digital Subscriptions, 649.00, true, 649`}
              style={{
                width: "100%",
                height: "230px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #000000",
                padding: "12px",
                fontSize: "11px",
                fontFamily: "monospace",
                lineHeight: "1.5",
                outline: "none",
                marginBottom: "16px",
              }}
            />

            <button
              onClick={handleBatchParse}
              className="br-black-button"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Upload size={14} /> Ingest Batch Into Ledger
            </button>
          </section>
        </div>

        {/* Recently Added Section */}
        <section style={{ marginTop: "48px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px" }}>
            Last Recorded Transactions
          </h3>
          <div style={{ border: "1px solid #DDD9C9", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#EFECE1", borderBottom: "1px solid #DDD9C9", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "11px" }}>
                  <th style={{ padding: "12px 16px" }}>Date</th>
                  <th style={{ padding: "12px 16px" }}>Bank</th>
                  <th style={{ padding: "12px 16px" }}>Merchant</th>
                  <th style={{ padding: "12px 16px" }}>Category</th>
                  <th style={{ padding: "12px 16px" }}>Type</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#666666" }}>
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentEntries.map((t, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #E8E4D5", backgroundColor: "#F9F8F3" }}>
                      <td style={{ padding: "10px 16px", fontFamily: "monospace" }}>{t.date}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 800 }}>{t.bankName}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 800 }}>{t.merchant}</td>
                      <td style={{ padding: "10px 16px", color: "#555555" }}>{t.category}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 900, padding: "2px 6px", backgroundColor: t.flagType === "PriceHike" ? "#000000" : "#EFECE1", color: t.flagType === "PriceHike" ? "#FFE600" : "#000000" }}>
                          {t.flagType}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 900, fontFamily: "monospace" }}>
                        ₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: "#000000", color: "#ffffff", padding: "24px 48px", textAlign: "center", fontSize: "11px", textTransform: "uppercase" }}>
        FinTrack Local Engine • Secure IndexedDB Pipeline
      </footer>
    </div>
  );
}