"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { runGeminiFinancialAudit, AIAuditResult } from "@/lib/aiAuditor";

interface AIAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: any[];
}

export default function AIAuditModal({ isOpen, onClose, transactions }: AIAuditModalProps) {
  const [apiKey, setApiKey] = useState(
    typeof window !== "undefined" ? localStorage.getItem("fintrack_gemini_key") || "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<AIAuditResult | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleStartAudit = async () => {
    if (!apiKey.trim()) {
      setError("Please provide a Gemini API Key (BYOK model ensures zero data leakage).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      localStorage.setItem("fintrack_gemini_key", apiKey.trim());
      const res = await runGeminiFinancialAudit(apiKey.trim(), transactions);
      setAuditData(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate AI financial audit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ backgroundColor: "#F9F8F3", border: "2px solid #000000", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", padding: "36px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: "none", cursor: "pointer" }}>
          <X size={20} />
        </button>

        <div style={{ borderBottom: "2px solid #000000", paddingBottom: "14px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="#000000" />
            <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em" }}>
              FINTRACK INTELLIGENCE CORE
            </span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, textTransform: "uppercase", margin: "4px 0 0 0" }}>
            AI Forensic Mandate Audit
          </h2>
        </div>

        {!auditData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#EFECE1", padding: "16px", border: "1px solid #DDD9C9", fontSize: "12px", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Client-Side BYOK Security Guarantee:</strong> To honor the zero-knowledge privacy model, FinTrack never routes your transactions through an intermediary analytics server.
              </p>
              <p style={{ margin: 0, color: "#666666" }}>
                Your browser queries Google's Gemini endpoint directly. Your key is kept only in your local browser storage.
              </p>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontFamily: "monospace" }}
              />
            </div>

            {error && (
              <div style={{ padding: "10px", backgroundColor: "#FFF0F0", border: "1px solid #D00000", color: "#D00000", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button
              onClick={handleStartAudit}
              disabled={loading}
              className="br-black-button"
              style={{ width: "100%", justifyContent: "center", padding: "14px 0" }}
            >
              {loading ? (
                <span>Auditing {transactions.length} Transactions...</span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={14} /> Run AI Forensic Audit
                </span>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ backgroundColor: "#EFECE1", border: "1px solid #DDD9C9", padding: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", color: "#777777", marginBottom: "6px" }}>
                Executive Assessment
              </div>
              <p style={{ fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                {auditData.executiveSummary}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 900, textTransform: "uppercase", marginBottom: "10px" }}>
                Identified Cash Leaks & Surges
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {auditData.identifiedLeaks.map((leak, idx) => (
                  <div key={idx} style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9C9", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: "13px" }}>{leak.merchant}</div>
                      <div style={{ fontSize: "11px", color: "#666666" }}>{leak.recommendedAction}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: 900, color: "#D00000", fontFamily: "monospace" }}>
                        -₹{leak.monthlyLeak}/mo
                      </div>
                      <div style={{ fontSize: "10px", color: "#777777" }}>
                        ₹{leak.annualWaste}/yr waste
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 900, textTransform: "uppercase", marginBottom: "8px" }}>
                Tactical Portfolio Guidance
              </h4>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#444444", lineHeight: 1.6 }}>
                {auditData.optimizationTips.map((tip, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>{tip}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setAuditData(null)}
              className="br-black-button"
              style={{ justifyContent: "center" }}
            >
              Re-run Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}