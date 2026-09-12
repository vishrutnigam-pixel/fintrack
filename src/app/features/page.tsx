"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Cpu, Database, FileSpreadsheet, Lock, AlertTriangle } from "lucide-react";

export default function FeaturesPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "Encrypted Statement Ingestion",
      issuer: "HDFC, ICICI, SBI, AXIS, AMEX",
      desc: "Native web-assembly PDF text extraction capable of decrypting password-protected card statements entirely within browser memory.",
      icon: <Lock size={20} color="#000000" />,
      status: "Operational",
    },
    {
      title: "Subscription & Mandate Detection",
      issuer: "Universal",
      desc: "Heuristic pattern analysis identifying monthly recurring digital services, cloud providers, and standing debit instructions.",
      icon: <Cpu size={20} color="#000000" />,
      status: "Operational",
    },
    {
      title: "Silent Price Hike Auditing",
      issuer: "Cross-Issuer",
      desc: "Compares current transaction charges against baseline historical amounts to flag unannounced rate increases.",
      icon: <AlertTriangle size={20} color="#000000" />,
      status: "Operational",
    },
    {
      title: "RBI Revocation Notice Builder",
      issuer: "Framework RBI/2020-21/74",
      desc: "Generates formal cancellation notices addressed to specific bank nodal officers to legally terminate uncooperative merchant debits.",
      icon: <ShieldCheck size={20} color="#000000" />,
      status: "Operational",
    },
    {
      title: "Client-Side Persistent Ledger",
      issuer: "IndexedDB / Dexie.js",
      desc: "Maintains your ledger securely on your physical device. No account creation, passwords, or cookies required.",
      icon: <Database size={20} color="#000000" />,
      status: "Operational",
    },
    {
      title: "Standardized Data Export",
      issuer: "CSV / JSON",
      desc: "Full portfolio data portability. Export transaction logs at any time or completely purge local records in a single click.",
      icon: <FileSpreadsheet size={20} color="#000000" />,
      status: "Operational",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#F9F8F3",
        color: "#000000",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Ambient Floating Glow Orbs (Visible Parallax Motion) */}
      <div
        style={{
          position: "absolute",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 230, 0, 0.22) 0%, rgba(249, 248, 243, 0) 70%)",
          filter: "blur(40px)",
          top: "-60px",
          right: "-80px",
          pointerEvents: "none",
          transform: `translate3d(0, ${scrollY * 0.12}px, 0)`,
          transition: "transform 0.05s linear",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220, 210, 180, 0.45) 0%, rgba(249, 248, 243, 0) 70%)",
          filter: "blur(50px)",
          top: "350px",
          left: "-150px",
          pointerEvents: "none",
          transform: `translate3d(0, ${scrollY * -0.08}px, 0)`,
          transition: "transform 0.05s linear",
          zIndex: 0,
        }}
      />

      <Navbar />

      <main style={{ maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "56px 48px", flex: 1, zIndex: 1, position: "relative" }}>
        
        {/* Editorial Heading with Parallax Offset */}
        <div
          style={{
            borderBottom: "1px solid #DDD9C9",
            paddingBottom: "32px",
            marginBottom: "48px",
            transform: `translate3d(0, ${Math.min(scrollY * 0.04, 25)}px, 0)`,
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#666666", marginBottom: "8px" }}>
            CORE CAPABILITIES
          </div>
          <h1 style={{ fontSize: "3.4rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0, lineHeight: 1.05 }}>
            Institutional Features & Specifications
          </h1>
          <p style={{ fontSize: "16px", color: "#555555", marginTop: "12px", maxWidth: "700px", lineHeight: 1.6 }}>
            Every cryptographic module, heuristic auditor, and regulatory generator runs completely on-device in isolated memory.
          </p>
        </div>

        {/* Dynamic Glassmorphism Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "28px" }}>
          {features.map((feat, i) => (
            <div
              key={i}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 35px -10px rgba(0, 0, 0, 0.12)";
                e.currentTarget.style.borderColor = "#000000";
                e.currentTarget.style.backgroundColor = "rgba(242, 238, 224, 0.95)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "0 8px 24px -12px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.borderColor = "rgba(221, 217, 201, 0.9)";
                e.currentTarget.style.backgroundColor = "rgba(239, 236, 225, 0.65)";
              }}
              style={{
                padding: "36px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: "rgba(239, 236, 225, 0.65)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(221, 217, 201, 0.9)",
                boxShadow: "0 8px 24px -12px rgba(0, 0, 0, 0.05)",
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "default",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ padding: "8px", backgroundColor: "#FFE600", display: "inline-flex" }}>
                    {feat.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      backgroundColor: "#000000",
                      color: "#FFE600",
                      padding: "3px 8px",
                    }}
                  >
                    {feat.status}
                  </span>
                </div>

                <div style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", color: "#777777", letterSpacing: "0.12em", marginBottom: "6px" }}>
                  {feat.issuer}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>

              <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.08)", marginTop: "24px", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#000000" }}>
                  Status: Monitored
                </span>
                <span style={{ width: "8px", height: "8px", backgroundColor: "#000000", display: "inline-block" }} />
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ backgroundColor: "#000000", color: "#ffffff", padding: "28px 48px", textAlign: "center", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", zIndex: 1 }}>
        FinTrack Core Architecture • Zero-Knowledge Engine • DPDP 2023 Compliant
      </footer>
    </div>
  );
}