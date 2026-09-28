"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowRight, Upload, Search, AlertTriangle, 
  CheckCircle2, Copy, Trash2, X, CreditCard, Calendar, 
  TrendingUp, Layers, Sparkles, SplitSquareVertical
} from "lucide-react";
import Navbar from "@/components/Navbar";
import DbStatusBadge from "@/components/DbStatusBadge";
import IngestModal from "@/components/IngestModal";
import AIAuditModal from "@/components/AIAuditModal";
import DiffModal from "@/components/DiffModal";
import { parseBankStatement } from "@/lib/statementParser";
import { TransactionRecord, CardProfile } from "@/lib/db";
import { apiClient } from "@/lib/apiClient";
import { generateRevocationNotice, MandateCancellationDraft } from "@/lib/mandateAuditor";
import { generateAIEnhancedRevocation } from "@/lib/aiAuditor";

const INITIAL_CARDS: CardProfile[] = [
  {
    token: "card_hdfc_regalia",
    bank: "HDFC",
    cardName: "Regalia Gold",
    lastFourDigits: "9012",
    creditLimit: 500000,
    billingDay: 16,
    dueDateOffsetDays: 20,
    passwordSchema: "First 4 Letters (CAPS) + DDMM",
  },
  {
    token: "card_axis_magnus",
    bank: "AXIS",
    cardName: "Magnus Privilege",
    lastFourDigits: "3341",
    creditLimit: 300000,
    billingDay: 20,
    dueDateOffsetDays: 18,
    passwordSchema: "First 4 Letters (CAPS) + Last 4 Digits",
  },
  {
    token: "card_icici_sapphiro",
    bank: "ICICI",
    cardName: "Sapphiro Dual",
    lastFourDigits: "1082",
    creditLimit: 400000,
    billingDay: 10,
    dueDateOffsetDays: 18,
    passwordSchema: "First 4 Letters (lower) + DDMM",
  },
  {
    token: "card_sbi_aurum",
    bank: "SBI",
    cardName: "Aurum Prime",
    lastFourDigits: "4451",
    creditLimit: 250000,
    billingDay: 25,
    dueDateOffsetDays: 20,
    passwordSchema: "DOB (DDMMYYYY) + Last 4 Digits",
  },
];

const SEED_DATA: TransactionRecord[] = [
  { bankName: "HDFC", cardTokenId: "card_hdfc_regalia", date: "2026-09-02", merchant: "Amazon Web Services India", amount: 14280.5, category: "Cloud & Dev", isRecurring: true, flagType: "PriceHike", statementCycle: "2026-09", status: "Flagged" },
  { bankName: "AXIS", cardTokenId: "card_axis_magnus", date: "2026-08-26", merchant: "OpenAI ChatGPT Plus Renewal", amount: 1999.0, category: "Digital Subscriptions", isRecurring: true, flagType: "PriceHike", statementCycle: "2026-09", status: "Flagged" },
  { bankName: "HDFC", cardTokenId: "card_hdfc_regalia", date: "2026-09-01", merchant: "Netflix Entertainment IN", amount: 649.0, category: "Digital Subscriptions", isRecurring: true, flagType: "Subscription", statementCycle: "2026-09", status: "Active" },
  { bankName: "HDFC", cardTokenId: "card_hdfc_regalia", date: "2026-08-20", merchant: "Spotify India Recurring Autopay", amount: 119.0, category: "Digital Subscriptions", isRecurring: true, flagType: "Subscription", statementCycle: "2026-09", status: "Active" },
  { bankName: "ICICI", cardTokenId: "card_icici_sapphiro", date: "2026-08-28", merchant: "Swiggy Food Bangalore", amount: 1240.0, category: "Dining & Lifestyle", isRecurring: false, flagType: "Normal", statementCycle: "2026-09", status: "Active" },
  { bankName: "SBI", cardTokenId: "card_sbi_aurum", date: "2026-08-24", merchant: "MakeMyTrip India Pvt Ltd", amount: 28450.0, category: "Travel & Transit", isRecurring: false, flagType: "Normal", statementCycle: "2026-09", status: "Active" },
  { bankName: "ICICI", cardTokenId: "card_icici_sapphiro", date: "2026-08-15", merchant: "Google One Storage Renewal", amount: 130.0, category: "Cloud & Dev", isRecurring: true, flagType: "Subscription", statementCycle: "2026-09", status: "Active" },
  { bankName: "HDFC", cardTokenId: "card_hdfc_regalia", date: "2026-08-02", merchant: "Amazon Web Services India", amount: 11200.0, category: "Cloud & Dev", isRecurring: true, flagType: "Subscription", statementCycle: "2026-08", status: "Active" },
  { bankName: "AXIS", cardTokenId: "card_axis_magnus", date: "2026-07-26", merchant: "OpenAI ChatGPT Plus Renewal", amount: 1650.0, category: "Digital Subscriptions", isRecurring: true, flagType: "Subscription", statementCycle: "2026-08", status: "Active" },
];

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedCardToken, setSelectedCardToken] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIAuditOpen, setIsAIAuditOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [cards, setCards] = useState<CardProfile[]>([]);
  const [selectedRevocation, setSelectedRevocation] = useState<TransactionRecord | null>(null);
  const [customRevocationBody, setCustomRevocationBody] = useState("");
  const [isAIGeneratingNotice, setIsAIGeneratingNotice] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const loadData = async () => {
    try {
      let existingCards = await apiClient.getCards();
      if (existingCards.length === 0) {
        for (const c of INITIAL_CARDS) {
          await apiClient.saveCard(c);
        }
        existingCards = INITIAL_CARDS;
      }
      setCards(existingCards);

      let existingTx = await apiClient.getTransactions();
      if (existingTx.length === 0) {
        await apiClient.addTransactions(SEED_DATA);
        existingTx = SEED_DATA;
      }
      setTransactions(existingTx);
    } catch (err) {
      console.error("[LOAD DATA ERROR]", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExtractionComplete = async (bank: string, rawText: string) => {
    const validBank = (["HDFC", "ICICI", "SBI", "AXIS", "AMEX"].includes(bank) ? bank : "OTHER") as any;
    const parsed = parseBankStatement(rawText, validBank);
    if (parsed.length > 0) {
      await apiClient.addTransactions(parsed);
      await loadData();
    }
  };

  // MoM Delta Algorithm
  const enrichedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.map((tx) => {
      if (!tx.isRecurring) return tx;
      
      const priorPosting = sorted.find(
        (t) => t.merchant.toLowerCase() === tx.merchant.toLowerCase() &&
               new Date(t.date).getTime() < new Date(tx.date).getTime()
      );

      if (priorPosting && tx.amount > priorPosting.amount) {
        return {
          ...tx,
          flagType: "PriceHike" as const,
          baselineAmount: priorPosting.amount,
        };
      }
      return tx;
    });
  }, [transactions]);

  const filtered = useMemo(() => {
    return enrichedTransactions.filter((t) => {
      const matchesIssuer = activeTab === "ALL" || t.bankName === activeTab;
      const matchesCard = selectedCardToken === "ALL" || t.cardTokenId === selectedCardToken;
      const matchesCategory = selectedCategory === "ALL" || t.category === selectedCategory;
      const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesIssuer && matchesCard && matchesCategory && matchesSearch;
    });
  }, [enrichedTransactions, activeTab, selectedCardToken, selectedCategory, searchQuery]);

  const totalSpend = filtered.reduce((sum, t) => sum + t.amount, 0);
  const recurringItems = filtered.filter((t) => t.isRecurring);
  const recurringMonthly = recurringItems.reduce((sum, t) => sum + t.amount, 0);
  const recurringAnnualized = recurringMonthly * 12;
  const hikes = filtered.filter((t) => t.flagType === "PriceHike");

  const categoryWeights = useMemo(() => {
    const mapping: Record<string, number> = {};
    filtered.forEach((t) => {
      mapping[t.category] = (mapping[t.category] || 0) + t.amount;
    });
    return Object.entries(mapping).map(([cat, val]) => ({
      category: cat,
      amount: val,
      percentage: totalSpend > 0 ? (val / totalSpend) * 100 : 0,
    }));
  }, [filtered, totalSpend]);

  const upcomingMandates = useMemo(() => {
    return recurringItems.map((mandate) => {
      const parts = mandate.date.split(/[-/]/);
      const originalDay = parseInt(parts[2] || parts[0], 10) || 1;
      return {
        ...mandate,
        projectedDay: originalDay,
      };
    }).sort((a, b) => a.projectedDay - b.projectedDay);
  }, [recurringItems]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = "Date,Issuer,CardToken,Merchant,Category,Amount,IsRecurring,FlagType\n";
    const body = filtered
      .map((t) => `"${t.date}","${t.bankName}","${t.cardTokenId}","${t.merchant}","${t.category}",${t.amount},${t.isRecurring},"${t.flagType}"`)
      .join("\n");
    const blob = new Blob([headers + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FinTrack_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const defaultDraft: MandateCancellationDraft | null = selectedRevocation 
    ? generateRevocationNotice(
        selectedRevocation.merchant, 
        selectedRevocation.bankName, 
        selectedRevocation.amount, 
        selectedRevocation.cardTokenId,
        selectedRevocation.date
      )
    : null;

  const handleAITailorNotice = async () => {
    if (!selectedRevocation) return;
    const key = localStorage.getItem("fintrack_gemini_key") || "";
    if (!key) {
      alert("Please open the AI Audit tool in the navbar first to save your Gemini API Key.");
      return;
    }

    setIsAIGeneratingNotice(true);
    try {
      const reason = selectedRevocation.flagType === "PriceHike"
        ? `Merchant raised fee from INR ${selectedRevocation.baselineAmount} to INR ${selectedRevocation.amount} without statutory prior notice.`
        : "Unwanted recurring e-mandate standing instruction.";
      const aiText = await generateAIEnhancedRevocation(
        key,
        selectedRevocation.merchant,
        selectedRevocation.bankName,
        selectedRevocation.amount,
        selectedRevocation.cardTokenId,
        reason
      );
      setCustomRevocationBody(aiText);
    } catch (err: any) {
      alert(err.message || "Failed to generate AI notice.");
    } finally {
      setIsAIGeneratingNotice(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#F9F8F3", color: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <IngestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExtractionComplete={handleExtractionComplete}
      />

      <AIAuditModal
        isOpen={isAIAuditOpen}
        onClose={() => setIsAIAuditOpen(false)}
        transactions={filtered}
      />

      <DiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        transactions={transactions}
      />

      <Navbar 
        onOpenIngest={() => setIsModalOpen(true)} 
        onExportCSV={handleExportCSV} 
        onOpenAIAudit={() => setIsAIAuditOpen(true)}
        onOpenDiff={() => setIsDiffOpen(true)}
      />

      <main style={{ maxWidth: "1360px", margin: "0 auto", width: "100%", padding: "40px 48px", flex: 1 }}>
        
        {/* Multi-Card Instrument Deck */}
        <section style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
            <div>
              <span className="br-tagline" style={{ color: "#666666" }}>MULTI-CARD TOKEN STACK</span>
              <h2 style={{ fontSize: "20px", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>
                Instrument Balances & Utilization
              </h2>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#666666" }}>
              {cards.length} REGISTERED CARD PROFILES
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {cards.map((card) => {
              const cardTx = transactions.filter((t) => t.cardTokenId === card.token);
              const cardTotal = cardTx.reduce((sum, t) => sum + t.amount, 0);
              const utilization = Math.round((cardTotal / card.creditLimit) * 100);
              const isHighUtilization = utilization >= 30;

              return (
                <div
                  key={card.token}
                  onClick={() => setSelectedCardToken(selectedCardToken === card.token ? "ALL" : card.token)}
                  style={{
                    backgroundColor: selectedCardToken === card.token ? "#EFECE1" : "#F6F4EC",
                    border: selectedCardToken === card.token ? "2px solid #000000" : "1px solid #DDD9C9",
                    padding: "20px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {card.bank} •••• {card.lastFourDigits}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", backgroundColor: isHighUtilization ? "#000000" : "#E5E2D6", color: isHighUtilization ? "#FFE600" : "#000000" }}>
                      {utilization}% UTILIZED
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", fontWeight: 900, marginBottom: "12px", textTransform: "uppercase" }}>
                    {card.cardName}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", color: "#777777" }}>Statement Total</div>
                      <div style={{ fontSize: "16px", fontWeight: 900, fontFamily: "monospace" }}>
                        ₹{cardTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", color: "#777777" }}>Assigned Limit</div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#666666", fontFamily: "monospace" }}>
                        ₹{card.creditLimit.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: "4px", backgroundColor: "#DCD8CC", marginTop: "14px" }}>
                    <div style={{ width: `${Math.min(utilization, 100)}%`, height: "100%", backgroundColor: isHighUtilization ? "#000000" : "#666666" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Aggregated KPI Deck */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "28px", borderTop: "1px solid #DDD9C9", borderBottom: "1px solid #DDD9C9", padding: "36px 0", marginBottom: "40px" }}>
          <div>
            <span className="br-tagline" style={{ color: "#777777" }}>AGGREGATED STATEMENT TOTAL</span>
            <h1 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "6px 0 12px 0", lineHeight: 1 }}>
              ₹{totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h1>
            <p style={{ fontSize: "14px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
              Consolidated obligations filtered across {filtered.length} audited statement ledger postings.
            </p>
          </div>

          <div className="br-sand-box" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="br-tagline" style={{ color: "#777777" }}>ANNUALIZED AUTODEBIT VOLUME</span>
                <span style={{ fontSize: "11px", fontWeight: 900, color: "#000000" }}>{recurringItems.length} MANDATES</span>
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: "6px 0 8px 0", letterSpacing: "-0.03em" }}>
                ₹{recurringAnnualized.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: "13px", color: "#555555", margin: 0 }}>
                Projected annual cash commitment across active subscriptions and standing instructions.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
              <button
                onClick={() => setIsAIAuditOpen(true)}
                style={{
                  backgroundColor: "#FFE600",
                  color: "#000000",
                  border: "none",
                  padding: "10px 14px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={13} />
                <span>AI Forensic Report</span>
              </button>

              <button
                onClick={() => setIsDiffOpen(true)}
                style={{
                  backgroundColor: "#EFECE1",
                  color: "#000000",
                  border: "1px solid #DDD9C9",
                  padding: "10px 14px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <SplitSquareVertical size={13} />
                <span>MoM Diff View</span>
              </button>

              {hikes.length > 0 && (
                <button
                  onClick={() => { setSelectedRevocation(hikes[0]); setCustomRevocationBody(""); }}
                  style={{
                    backgroundColor: "#000000",
                    color: "#FFE600",
                    border: "none",
                    padding: "10px 14px",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>Audit {hikes.length} MoM Surge(s)</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Category Distribution & Upcoming Renewals Deck */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "44px" }}>
          <div className="br-sand-box">
            <span className="br-tagline" style={{ color: "#777777" }}>CATEGORY DISTRIBUTION</span>
            <h3 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", margin: "6px 0 20px 0" }}>
              Spending Weights
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {categoryWeights.map((w) => (
                <div key={w.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 800, marginBottom: "4px" }}>
                    <span>{w.category}</span>
                    <span className="tabular-nums">₹{w.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({Math.round(w.percentage)}%)</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", backgroundColor: "#DCD8CC" }}>
                    <div style={{ width: `${w.percentage}%`, height: "100%", backgroundColor: "#000000" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="br-sand-box">
            <span className="br-tagline" style={{ color: "#777777" }}>PROJECTED RENEWALS</span>
            <h3 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", margin: "6px 0 20px 0" }}>
              Upcoming Mandate Schedule
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcomingMandates.slice(0, 4).map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #DDD9C9",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "38px", height: "38px", backgroundColor: "#000000", color: "#FFE600", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900 }}>
                      <Calendar size={12} />
                      <span>{m.projectedDay}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 900, textTransform: "uppercase" }}>{m.merchant}</div>
                      <div style={{ fontSize: "10px", color: "#777777" }}>{m.bankName} • Scheduled Autopay</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 900, fontFamily: "monospace" }}>
                      ₹{m.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => { setSelectedRevocation(m); setCustomRevocationBody(""); }}
                      style={{ background: "none", border: "none", fontSize: "10px", fontWeight: 800, textDecoration: "underline", color: "#000000", cursor: "pointer", padding: 0 }}
                    >
                      Revoke Mandate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ledger */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #000000", paddingBottom: "16px", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="br-tagline" style={{ color: "#666666" }}>LEDGER CONSOLE</span>
              <h2 style={{ fontSize: "24px", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>
                Unified Statement Audit
              </h2>
            </div>

            <div style={{ display: "flex", border: "1px solid #DDD9C9", padding: "4px", backgroundColor: "#EFECE1", gap: "4px" }}>
              {["ALL", "HDFC", "ICICI", "SBI", "AXIS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedCardToken("ALL"); }}
                  style={{
                    padding: "8px 16px",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: activeTab === tab ? "#000000" : "transparent",
                    color: activeTab === tab ? "#ffffff" : "#555555",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Search size={14} color="#666666" />
              <input
                type="text"
                placeholder="Search merchant or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 12px", backgroundColor: "#EFECE1", border: "1px solid #DDD9C9", fontSize: "12px", width: "240px", outline: "none" }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: "8px 12px", backgroundColor: "#EFECE1", border: "1px solid #DDD9C9", fontSize: "12px", fontWeight: 700, outline: "none" }}
            >
              <option value="ALL">All Categories</option>
              <option value="Digital Subscriptions">Digital Subscriptions</option>
              <option value="Cloud & Dev">Cloud & Dev</option>
              <option value="Dining & Lifestyle">Dining & Lifestyle</option>
              <option value="Travel & Transit">Travel & Transit</option>
            </select>
          </div>

          <div style={{ border: "1px solid #DDD9C9", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#EFECE1", borderBottom: "1px solid #DDD9C9", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "11px" }}>
                  <th style={{ padding: "14px 18px" }}>Posting Date</th>
                  <th style={{ padding: "14px 18px" }}>Card Account Token</th>
                  <th style={{ padding: "14px 18px" }}>Merchant Narration</th>
                  <th style={{ padding: "14px 18px" }}>Category</th>
                  <th style={{ padding: "14px 18px" }}>Mandate State & Surge</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Debit Amount</th>
                  <th style={{ padding: "14px 18px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#666666" }}>
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #E8E4D5", backgroundColor: idx % 2 === 0 ? "#F9F8F3" : "#F3EFE4" }}>
                      <td style={{ padding: "12px 18px", color: "#666666" }} className="tabular-nums">{t.date}</td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ fontWeight: 900, marginRight: "6px" }}>{t.bankName}</span>
                        <span style={{ fontSize: "10px", color: "#777777", fontFamily: "monospace" }}>({t.cardTokenId})</span>
                      </td>
                      <td style={{ padding: "12px 18px", fontWeight: 900, fontSize: "13px" }}>{t.merchant}</td>
                      <td style={{ padding: "12px 18px", color: "#444444" }}>{t.category}</td>
                      <td style={{ padding: "12px 18px" }}>
                        {t.flagType === "PriceHike" ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ backgroundColor: "#000000", color: "#FFE600", padding: "2px 6px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
                              MOM SURGE (+{t.baselineAmount ? Math.round(((t.amount - t.baselineAmount) / t.baselineAmount) * 100) : 0}%)
                            </span>
                            {t.baselineAmount && (
                              <span style={{ fontSize: "10px", color: "#777777" }}>
                                (Prior: ₹{t.baselineAmount})
                              </span>
                            )}
                          </div>
                        ) : t.isRecurring ? (
                          <span style={{ backgroundColor: "#DDD9C9", color: "#000000", padding: "2px 6px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>
                            E-MANDATE
                          </span>
                        ) : (
                          <span style={{ color: "#888888", fontSize: "11px" }}>STANDARD DEBIT</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "right", fontWeight: 900, fontSize: "13px" }} className="tabular-nums">
                        ₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                          {t.isRecurring && (
                            <button
                              onClick={() => { setSelectedRevocation(t); setCustomRevocationBody(""); }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#000000", fontWeight: 800, fontSize: "11px", textDecoration: "underline" }}
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (t.id) {
                                await apiClient.deleteTransaction(t.id);
                                loadData();
                              }
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#888888" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Slide-out Legal Drawer with AI Customization Engine */}
      {selectedRevocation && defaultDraft && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 10000, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: "620px", backgroundColor: "#F9F8F3", height: "100%", padding: "36px", borderLeft: "2px solid #000000", display: "flex", flexDirection: "column", justifyContent: "space-between", overflowY: "auto" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000000", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <span className="br-tagline" style={{ color: "#777777" }}>LEAK ERADICATOR</span>
                  <h3 style={{ fontSize: "20px", fontWeight: 900, textTransform: "uppercase", margin: "4px 0 0 0" }}>
                    RBI Mandate Revocation Notice
                  </h3>
                </div>
                <button onClick={() => setSelectedRevocation(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ backgroundColor: "#EFECE1", border: "1px solid #DDD9C9", padding: "14px", marginBottom: "16px", fontSize: "12px" }}>
                <p style={{ margin: "0 0 4px 0" }}><strong>Nodal Desk:</strong> {defaultDraft.recipientEmail}</p>
                <p style={{ margin: 0 }}><strong>Statutory Reference:</strong> RBI Circular DPSS.CO.PD.No.750/02.14.003/2020-21</p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                <button
                  type="button"
                  onClick={handleAITailorNotice}
                  disabled={isAIGeneratingNotice}
                  style={{
                    backgroundColor: "#000000",
                    color: "#FFE600",
                    border: "none",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={12} />
                  <span>{isAIGeneratingNotice ? "Synthesizing Legal Grievance..." : "Tailor with Gemini AI"}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={customRevocationBody || defaultDraft.body}
                style={{
                  width: "100%",
                  height: "290px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #000000",
                  padding: "16px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  lineHeight: "1.5",
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(customRevocationBody || defaultDraft.body);
                  setCopiedDraft(true);
                  setTimeout(() => setCopiedDraft(false), 2500);
                }}
                className="br-black-button"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {copiedDraft ? <CheckCircle2 size={14} color="#FFE600" /> : <Copy size={14} />}
                <span>{copiedDraft ? "Notice Copied" : "Copy Legal Notice"}</span>
              </button>
              
              <a
                href={`mailto:${defaultDraft.recipientEmail}?subject=${encodeURIComponent(defaultDraft.subject)}&body=${encodeURIComponent(customRevocationBody || defaultDraft.body)}`}
                className="br-black-button"
                style={{ textDecoration: "none", backgroundColor: "#333333", display: "flex", alignItems: "center" }}
              >
                Open in Mail Client
              </a>
            </div>
          </div>
        </div>
      )}

      <footer style={{ backgroundColor: "#000000", color: "#ffffff", padding: "32px 48px" }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 900, textTransform: "uppercase" }}>
              FinTrack<span style={{ color: "#FFE600" }}>.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
  <DbStatusBadge />
  <span style={{ color: "#444444" }}>•</span>
  <span style={{ fontSize: "11px", color: "#888888" }}>
    Client-Side Volatile Memory Safe
  </span>
</div>
          </div>
          <div style={{ fontSize: "11px", color: "#666666" }}>
            RBI Circular DPSS.CO.PD.No.750/02.14.003/2020-21 Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}