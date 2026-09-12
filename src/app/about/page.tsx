import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, EyeOff, Lock, CheckSquare, Scale, Terminal } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#F9F8F3", color: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ maxWidth: "1360px", margin: "0 auto", width: "100%", padding: "56px 48px", flex: 1 }}>
        {/* Editorial Top Title */}
        <div style={{ borderBottom: "2px solid #000000", paddingBottom: "28px", marginBottom: "48px" }}>
          <div className="br-tagline">SYSTEM ARCHITECTURE & MANDATE</div>
          <h1 className="br-editorial-title" style={{ maxWidth: "1050px" }}>
            Institutional financial visibility without data surrender.
          </h1>
          <p style={{ fontSize: "18px", color: "#444444", maxWidth: "800px", lineHeight: 1.6, margin: "18px 0 0 0" }}>
            FinTrack was engineered to solve a fundamental contradiction in personal finance: you shouldn't have to surrender your complete transactional identity to cloud aggregators just to audit silent billing leaks.
          </p>
        </div>

        {/* Core Pillars 3-Column Sand Grid */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", marginBottom: "56px" }}>
          <div className="br-sand-box">
            <Shield size={24} style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 10px 0" }}>
              Zero-Knowledge Client-Side RAM
            </h3>
            <p style={{ fontSize: "14px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
              Password-protected statements are ingested into client memory buffers via WebAssembly (PDF.js). Decryption, regex-tokenization, and ledgering occur purely in RAM and are committed to your browser's IndexedDB. Zero network requests exit your browser.
            </p>
          </div>

          <div className="br-sand-box">
            <Scale size={24} style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 10px 0" }}>
              RBI Circular Alignment
            </h3>
            <p style={{ fontSize: "14px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
              Built strictly around the Reserve Bank of India framework for processing e-mandates (RBI/2020-21/74). We equip cardholders with verified legal revocation drafts to terminate rogue recurring instructions directly with issuing bank nodal officers.
            </p>
          </div>

          <div className="br-sand-box">
            <EyeOff size={24} style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 10px 0" }}>
              Anti-Account Aggregator
            </h3>
            <p style={{ fontSize: "14px", color: "#444444", lineHeight: 1.6, margin: 0 }}>
              Mainstream aggregators sell credit card spending patterns to NBFC lending syndicates. FinTrack delivers enterprise-grade analytics without SMS scrape permissions, phone access, or invasive consent brokers.
            </p>
          </div>
        </section>

        {/* Deep Dive Working Mechanics */}
        <section style={{ borderTop: "1px solid #DDD9C9", paddingTop: "48px", marginBottom: "56px" }}>
          <div className="br-tagline">OPERATIONAL PIPELINE</div>
          <h2 className="br-editorial-subtitle" style={{ marginBottom: "32px" }}>
            The 4-stage ephemeral execution loop
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <div style={{ borderLeft: "2px solid #000000", paddingLeft: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, fontFamily: "monospace" }}>PHASE 01</span>
              <h4 style={{ fontSize: "16px", fontWeight: 900, margin: "6px 0 8px 0" }}>Password Matching</h4>
              <p style={{ fontSize: "13px", color: "#555555", margin: 0, lineHeight: 1.5 }}>
                Local heuristics match bank schemas (e.g. HDFC DOB+PAN pattern) to decrypt document byte streams locally in memory.
              </p>
            </div>

            <div style={{ borderLeft: "2px solid #000000", paddingLeft: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, fontFamily: "monospace" }}>PHASE 02</span>
              <h4 style={{ fontSize: "16px", fontWeight: 900, margin: "6px 0 8px 0" }}>Entity Tokenization</h4>
              <p style={{ fontSize: "13px", color: "#555555", margin: 0, lineHeight: 1.5 }}>
                Parses unstructured OCR and text streams to pull transaction date, issuer reference, merchant ID, and numerical debits.
              </p>
            </div>

            <div style={{ borderLeft: "2px solid #000000", paddingLeft: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, fontFamily: "monospace" }}>PHASE 03</span>
              <h4 style={{ fontSize: "16px", fontWeight: 900, margin: "6px 0 8px 0" }}>Surge Detection</h4>
              <p style={{ fontSize: "13px", color: "#555555", margin: 0, lineHeight: 1.5 }}>
                Identifies recurring billing cadences and compares current billing against baseline numbers to detect sneaky price surges.
              </p>
            </div>

            <div style={{ borderLeft: "2px solid #000000", paddingLeft: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, fontFamily: "monospace" }}>PHASE 04</span>
              <h4 style={{ fontSize: "16px", fontWeight: 900, margin: "6px 0 8px 0" }}>Notice Dispatch</h4>
              <p style={{ fontSize: "13px", color: "#555555", margin: 0, lineHeight: 1.5 }}>
                Pre-fills an RBI mandate revocation document linked straight to the card issuer's official grievance desk.
              </p>
            </div>
          </div>
        </section>

        {/* Future Endeavors */}
        <section style={{ backgroundColor: "#EFECE1", padding: "40px", border: "1px solid #DDD9C9" }}>
          <div className="br-tagline" style={{ color: "#666666" }}>ROADMAP & STRATEGIC ENDEAVORS</div>
          <h2 style={{ fontSize: "24px", fontWeight: 900, margin: "8px 0 16px 0" }}>
            Where FinTrack is heading next
          </h2>
          <ul style={{ fontSize: "14px", color: "#333333", lineHeight: 1.8, paddingLeft: "20px", margin: 0 }}>
            <li><strong>Cross-Card Reward Arbitrage Engine</strong>: Local calculation engine matching upcoming merchant spends to your highest-rewarding card instrument.</li>
            <li><strong>Hidden Interest Rate (APR) Verifier</strong>: Instant audit of finance charges, GST on late fees, and revolving credit costs against issuer schedule of charges.</li>
            <li><strong>Offline Desktop Core</strong>: Standalone, completely offline desktop build using Electron/Tauri with hardware security key tokenization.</li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}