"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  ShieldCheck, XCircle, CheckCircle2, Lock, 
  Cpu, AlertTriangle, ArrowRight, Zap, EyeOff, Scale, Landmark
} from "lucide-react";

export default function ComparePage() {
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "SECURITY" | "AUDIT" | "MANDATES">("ALL");

  const comparisonMatrix = [
    {
      capability: "Core Processing Architecture",
      category: "SECURITY",
      fintrack: "Zero-Knowledge Local RAM (WASM + IndexedDB)",
      others: "Centralized Cloud Databases (AWS / GCP Multi-tenant)",
      advantage: "Your statements, PAN, and transactions never hit external company servers.",
    },
    {
      capability: "Access Authorization Model",
      category: "SECURITY",
      fintrack: "Zero Permissions (No SMS access, No NetBanking login)",
      others: "Invasive Android SMS Scrapers or Account Aggregator (AA) OAuth",
      advantage: "No risk of leaked banking OTPs, private SMS snooping, or persistent bank tokens.",
    },
    {
      capability: "Encrypted Statement Ingestion",
      category: "SECURITY",
      fintrack: "Client-side PDF decryption with issuer password profiling",
      others: "Requires uploading plain text PDFs or linking Gmail OAuth centrally",
      advantage: "Decrypts bank PDFs natively in browser memory without storing your password on disk.",
    },
    {
      capability: "Silent MoM Price Hike Detection",
      category: "AUDIT",
      fintrack: "Automated Cross-Cycle Diff Engine with baseline tracking",
      others: "Basic categorization only (No historical surge alerts)",
      advantage: "Automatically flags sneaky subscription price increases (e.g., AWS, Netflix, OpenAI).",
    },
    {
      capability: "E-Mandate Revocation Execution",
      category: "MANDATES",
      fintrack: "Statutory RBI Grievance Generator (Circular RBI/2020-21/74)",
      others: "Redirects you to merchant app or third-party auto-debit portal",
      advantage: "Provides legally binding cancellation notices directly to issuing bank nodal officers.",
    },
    {
      capability: "Data Portability & Vault Security",
      category: "SECURITY",
      fintrack: "AES-GCM-256 Client Vaults & Raw Flattened CSV Export",
      others: "Walled garden proprietary database (No easy bulk export)",
      advantage: "Own your data entirely. One-click purge or export directly to Google Sheets / Excel.",
    },
    {
      capability: "Monetization & Privacy Policy",
      category: "SECURITY",
      fintrack: "100% Ad-Free, Zero Data Brokering, BYOK AI Model",
      others: "Data monetization via personal loans, credit card cross-selling",
      advantage: "FinTrack is a pure financial audit tool, not a disguised lead-generation marketplace.",
    },
    {
      capability: "Multi-Card Utilization Safeguards",
      category: "AUDIT",
      fintrack: "Live Credit Limit vs. Balance Stack with >30% CIBIL impact alerts",
      others: "General bill due-date push notifications without granular ratio math",
      advantage: "Prevents credit score degradation by monitoring specific credit utilization tiers.",
    },
  ];

  const filteredMatrix = comparisonMatrix.filter((item) => 
    selectedCategory === "ALL" || item.category === selectedCategory
  );

  return (
    <div style={{ backgroundColor: "#F9F8F3", color: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ maxWidth: "1360px", margin: "0 auto", width: "100%", padding: "56px 48px", flex: 1 }}>
        
        {/* Editorial Masthead */}
        <section style={{ borderBottom: "1px solid #DDD9C9", paddingBottom: "48px", marginBottom: "48px" }}>
          <div className="br-tagline">COMPETITIVE ARCHITECTURE AUDIT</div>
          <h1 className="br-editorial-title" style={{ fontSize: "3.6rem", maxWidth: "1000px" }}>
            Why Sovereign Ledger Engineering Outperforms Cloud Aggregators.
          </h1>
          <p style={{ fontSize: "18px", color: "#444444", lineHeight: 1.6, maxWidth: "850px", marginTop: "18px" }}>
            Conventional Indian credit platforms operate as credit card bill aggregators disguised as personal finance utilities. FinTrack was engineered from the ground up to reverse the asymmetric power balance between financial institutions, subscription merchants, and privacy-conscious users.
          </p>
        </section>

        {/* 3 Core Philosophical Differentiators */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px", marginBottom: "56px" }}>
          
          <div className="editorial-glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "40px", height: "40px", backgroundColor: "#000000", color: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <EyeOff size={20} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", color: "#777777" }}>Differentiator 01</span>
              <h3 style={{ fontSize: "20px", fontWeight: 900, margin: "6px 0 12px 0", textTransform: "uppercase" }}>
                Zero Cloud Telemetry
              </h3>
              <p style={{ fontSize: "13.5px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
                Other apps ingest your statements onto centralized servers to train marketing models, analyze your purchasing power, and bombard you with pre-approved personal loans. FinTrack processes everything inside your browser's RAM via WebAssembly. Nothing touches our disk.
              </p>
            </div>
            <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.08)", marginTop: "20px", paddingTop: "12px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
              Standard: 100% Client-Side Sovereignty
            </div>
          </div>

          <div className="editorial-glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "40px", height: "40px", backgroundColor: "#000000", color: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <Scale size={20} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", color: "#777777" }}>Differentiator 02</span>
              <h3 style={{ fontSize: "20px", fontWeight: 900, margin: "6px 0 12px 0", textTransform: "uppercase" }}>
                Statutory RBI Enforcement
              </h3>
              <p style={{ fontSize: "13.5px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
                Canceling recurring e-mandates in India is deliberately made painful by subscription providers. Instead of vague self-service links, FinTrack formats legally binding notice drafts under RBI Circular DPSS.CO.PD.No.750/02.14.003/2020-21 that bank grievance cells cannot ignore.
              </p>
            </div>
            <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.08)", marginTop: "20px", paddingTop: "12px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
              Standard: RBI/2020-21/74 Direct Legal Action
            </div>
          </div>

          <div className="editorial-glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "40px", height: "40px", backgroundColor: "#000000", color: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <Cpu size={20} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", color: "#777777" }}>Differentiator 03</span>
              <h3 style={{ fontSize: "20px", fontWeight: 900, margin: "6px 0 12px 0", textTransform: "uppercase" }}>
                Heuristic Price Surge Engine
              </h3>
              <p style={{ fontSize: "13.5px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
                Traditional expense trackers only classify payments into generic buckets like "Entertainment" or "Utilities". FinTrack computes month-over-month deltas across consecutive billing cycles to highlight sneaky unannounced rate hikes before you get billed again.
              </p>
            </div>
            <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.08)", marginTop: "20px", paddingTop: "12px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
              Standard: Automated Delta Surge Alerting
            </div>
          </div>

        </section>

        {/* Feature Comparison Matrix Section */}
        <section style={{ borderTop: "2px solid #000000", paddingTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="br-tagline" style={{ color: "#777777" }}>GRANULAR FEATURE COMPARISON</span>
              <h2 style={{ fontSize: "24px", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>
                FinTrack AI vs. Traditional Industry Apps
              </h2>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", border: "1px solid #DDD9C9", padding: "4px", backgroundColor: "#EFECE1", gap: "4px" }}>
              {[
                { id: "ALL", label: "Full Breakdown" },
                { id: "SECURITY", label: "Privacy & Architecture" },
                { id: "AUDIT", label: "Audit Engine" },
                { id: "MANDATES", label: "Legal & Mandates" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  style={{
                    padding: "8px 14px",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: selectedCategory === tab.id ? "#000000" : "transparent",
                    color: selectedCategory === tab.id ? "#ffffff" : "#555555",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Matrix */}
          <div style={{ border: "1px solid #DDD9C9", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#EFECE1", borderBottom: "2px solid #000000", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "11px" }}>
                  <th style={{ padding: "16px 20px", width: "24%" }}>Capability & Dimension</th>
                  <th style={{ padding: "16px 20px", width: "30%", backgroundColor: "#000000", color: "#FFE600" }}>
                    FinTrack AI (Local-First)
                  </th>
                  <th style={{ padding: "16px 20px", width: "24%", color: "#666666" }}>
                    Industry Platforms (CRED, Fold, Walnut)
                  </th>
                  <th style={{ padding: "16px 20px", width: "22%" }}>Architectural Benefit</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatrix.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #E8E4D5", backgroundColor: idx % 2 === 0 ? "#F9F8F3" : "#F3EFE4" }}>
                    <td style={{ padding: "16px 20px", fontWeight: 900, textTransform: "uppercase", fontSize: "12px" }}>
                      {row.capability}
                    </td>
                    <td style={{ padding: "16px 20px", backgroundColor: "rgba(255, 230, 0, 0.04)", fontWeight: 800, borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <CheckCircle2 size={16} color="#000000" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{row.fintrack}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#666666" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <XCircle size={16} color="#AA0000" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{row.others}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "12px", color: "#333333", lineHeight: 1.5 }}>
                      {row.advantage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Action Callout */}
        <section style={{ backgroundColor: "#EFECE1", border: "1px solid #DDD9C9", padding: "40px", marginTop: "56px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <span className="br-tagline" style={{ color: "#777777" }}>GET STARTED WITHOUT CREATING AN ACCOUNT</span>
            <h3 style={{ fontSize: "22px", fontWeight: 900, textTransform: "uppercase", margin: "4px 0 6px 0" }}>
              Ready to audit your active credit cards?
            </h3>
            <p style={{ fontSize: "14px", color: "#555555", margin: 0 }}>
              No email required, no sign-up forms, and no cloud syncing. Load statements or paste lines directly into your browser.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href="/transactions"
              className="br-black-button"
              style={{ textDecoration: "none" }}
            >
              <span>Record Transactions</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="br-black-button"
              style={{ textDecoration: "none", backgroundColor: "#333333", borderColor: "#333333" }}
            >
              <span>View Dashboard</span>
            </Link>
          </div>
        </section>

      </main>

      <footer style={{ backgroundColor: "#000000", color: "#ffffff", padding: "32px 48px", textAlign: "center", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        FinTrack AI Benchmark • Zero Data Brokering • DPDP Act 2023 Compliant
      </footer>
    </div>
  );
}