"use client";

import React, { useState, useMemo } from "react";
import { X, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, SplitSquareVertical } from "lucide-react";
import { TransactionRecord } from "@/lib/db";

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionRecord[];
}

export default function DiffModal({ isOpen, onClose, transactions }: DiffModalProps) {
  const cycles = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.statementCycle) set.add(t.statementCycle);
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const [currentCycle, setCurrentCycle] = useState<string>(cycles[0] || "2026-09");
  const [comparisonCycle, setComparisonCycle] = useState<string>(cycles[1] || "2026-08");

  const diffAnalysis = useMemo(() => {
    const currTx = transactions.filter((t) => t.statementCycle === currentCycle);
    const prevTx = transactions.filter((t) => t.statementCycle === comparisonCycle);

    const currTotal = currTx.reduce((sum, t) => sum + t.amount, 0);
    const prevTotal = prevTx.reduce((sum, t) => sum + t.amount, 0);
    const netDelta = currTotal - prevTotal;

    const matchedSurges: Array<{
      merchant: string;
      prevAmount: number;
      currAmount: number;
      deltaPercent: number;
      category: string;
    }> = [];

    const newDebits: TransactionRecord[] = [];

    currTx.forEach((curr) => {
      const match = prevTx.find(
        (prev) => prev.merchant.toLowerCase().trim() === curr.merchant.toLowerCase().trim()
      );

      if (match) {
        if (curr.amount > match.amount) {
          const delta = ((curr.amount - match.amount) / match.amount) * 100;
          matchedSurges.push({
            merchant: curr.merchant,
            prevAmount: match.amount,
            currAmount: curr.amount,
            deltaPercent: Math.round(delta),
            category: curr.category,
          });
        }
      } else {
        newDebits.push(curr);
      }
    });

    return {
      currTotal,
      prevTotal,
      netDelta,
      matchedSurges,
      newDebits,
    };
  }, [transactions, currentCycle, comparisonCycle]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        zIndex: 10002,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#F9F8F3",
          border: "2px solid #000000",
          width: "100%",
          maxWidth: "840px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "36px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: "none", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        <div style={{ borderBottom: "2px solid #000000", paddingBottom: "14px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SplitSquareVertical size={16} />
            <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em" }}>
              CROSS-STATEMENT COMPARATIVE ENGINE
            </span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, textTransform: "uppercase", margin: "4px 0 0 0" }}>
            Month-over-Month Delta Audit
          </h2>
        </div>

        {/* Cycle Selection Matrix */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Active Statement Cycle
            </label>
            <select
              value={currentCycle}
              onChange={(e) => setCurrentCycle(e.target.value)}
              style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontWeight: 800 }}
            >
              {cycles.map((c) => (
                <option key={c} value={c}>{c} (Current Index)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Baseline Comparator Cycle
            </label>
            <select
              value={comparisonCycle}
              onChange={(e) => setComparisonCycle(e.target.value)}
              style={{ width: "100%", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #000000", fontSize: "12px", fontWeight: 800 }}
            >
              {cycles.map((c) => (
                <option key={c} value={c}>{c} (Historical Baseline)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Net Expenditure Spread Deck */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
          <div style={{ backgroundColor: "#EFECE1", padding: "16px", border: "1px solid #DDD9C9" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#666666" }}>{comparisonCycle} Baseline</span>
            <div style={{ fontSize: "18px", fontWeight: 900, marginTop: "4px" }} className="tabular-nums">
              ₹{diffAnalysis.prevTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ backgroundColor: "#EFECE1", padding: "16px", border: "1px solid #DDD9C9" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#666666" }}>{currentCycle} Current</span>
            <div style={{ fontSize: "18px", fontWeight: 900, marginTop: "4px" }} className="tabular-nums">
              ₹{diffAnalysis.currTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ backgroundColor: "#000000", color: "#FFFFFF", padding: "16px" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#FFE600" }}>Net Trajectory Delta</span>
            <div style={{ fontSize: "18px", fontWeight: 900, marginTop: "4px" }} className="tabular-nums">
              {diffAnalysis.netDelta >= 0 ? `+₹${diffAnalysis.netDelta.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : `-₹${Math.abs(diffAnalysis.netDelta).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </div>
          </div>
        </div>

        {/* Matched MoM Price Hikes */}
        <div style={{ marginBottom: "28px" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} /> Silent Price Bumps Across Identical Merchants ({diffAnalysis.matchedSurges.length})
          </h4>

          {diffAnalysis.matchedSurges.length === 0 ? (
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9C9", padding: "16px", fontSize: "12px", color: "#666666" }}>
              Zero recurring merchant price increases detected between these consecutive cycles.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {diffAnalysis.matchedSurges.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #000000",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "13px" }}>{s.merchant}</div>
                    <div style={{ fontSize: "11px", color: "#666666" }}>{s.category}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ fontSize: "12px", color: "#666666", textDecoration: "line-through" }} className="tabular-nums">
                      ₹{s.prevAmount.toFixed(2)}
                    </div>
                    <ArrowRight size={13} color="#999999" />
                    <div style={{ fontSize: "14px", fontWeight: 900 }} className="tabular-nums">
                      ₹{s.currAmount.toFixed(2)}
                    </div>
                    <span style={{ backgroundColor: "#000000", color: "#FFE600", padding: "3px 8px", fontSize: "10px", fontWeight: 900 }}>
                      +{s.deltaPercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Newly Added Postings in Current Cycle */}
        <div>
          <h4 style={{ fontSize: "13px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Newly Introduced Debit Charges ({diffAnalysis.newDebits.length})
          </h4>

          <div style={{ border: "1px solid #DDD9C9", maxHeight: "180px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <tbody>
                {diffAnalysis.newDebits.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #E8E4D5", backgroundColor: i % 2 === 0 ? "#F9F8F3" : "#F3EFE4" }}>
                    <td style={{ padding: "10px 14px", color: "#666666" }}>{d.date}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 800 }}>{d.merchant}</td>
                    <td style={{ padding: "10px 14px", color: "#555555" }}>{d.category}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 900 }} className="tabular-nums">
                      ₹{d.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}