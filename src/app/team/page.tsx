import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Terminal, Shield, Code, Cpu } from "lucide-react";

export default function TeamPage() {
  const principles = [
    { label: "Execution Model", value: "Pure Client-Side WebWorker / WebAssembly" },
    { label: "Data Persistence", value: "IndexedDB via Dexie.js (Zero Cloud Database)" },
    { label: "Styling Standards", value: "High-Contrast Institutional Monochrome / Warm Sand" },
    { label: "Regulatory Target", value: "RBI/2020-21/74 e-Mandate Framework" },
  ];

  return (
    <div style={{ backgroundColor: "#F9F8F3", color: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ maxWidth: "1360px", margin: "0 auto", width: "100%", padding: "56px 48px", flex: 1 }}>
        <div style={{ borderBottom: "2px solid #000000", paddingBottom: "24px", marginBottom: "48px" }}>
          <div className="br-tagline">ENGINEERING & CONTRIBUTORS</div>
          <h1 className="br-editorial-title">
            Built by systems engineers and privacy researchers.
          </h1>
          <p style={{ fontSize: "17px", color: "#444444", maxWidth: "780px", lineHeight: 1.6, margin: "16px 0 0 0" }}>
            FinTrack is developed as an open institutional platform dedicated to consumer financial sovereignty and zero-leak cryptography.
          </p>
        </div>

        {/* Lead Contributor Cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "32px", marginBottom: "56px" }}>
          <div className="br-sand-box">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", backgroundColor: "#000000", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                FT
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 900, margin: 0 }}>FinTrack Core Architecture Unit</h3>
                <span style={{ fontSize: "11px", color: "#666666", fontWeight: 800, textTransform: "uppercase" }}>
                  Systems Engineering & Local Storage
                </span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
              Specializes in browser WebAssembly sandboxing, high-throughput regular expression compilation, and IndexedDB performance optimization for parsing large transaction datasets.
            </p>
          </div>

          <div className="br-sand-box">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", backgroundColor: "#000000", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                CR
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 900, margin: 0 }}>Financial Security Research</h3>
                <span style={{ fontSize: "11px", color: "#666666", fontWeight: 800, textTransform: "uppercase" }}>
                  Regulatory Compliance & Cryptography
                </span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
              Focused on RBI digital mandate provisions, privacy verification, anti-telemetry audits, and establishing enforceable revocation standards across Indian card payment gateways.
            </p>
          </div>
        </section>

        {/* Engineering Principles Table */}
        <section style={{ borderTop: "1px solid #DDD9C9", paddingTop: "48px" }}>
          <div className="br-tagline">SYSTEM CREDENTIALS & AUDIT TRAIL</div>
          <h2 className="br-editorial-subtitle" style={{ marginBottom: "24px" }}>
            Institutional Engineering Manifesto
          </h2>

          <div style={{ border: "1px solid #DDD9C9", backgroundColor: "#EFECE1" }}>
            {principles.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: idx !== principles.length - 1 ? "1px solid #DDD9C9" : "none",
                  fontSize: "13px",
                }}
              >
                <span style={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</span>
                <span style={{ color: "#555555", fontFamily: "monospace" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}