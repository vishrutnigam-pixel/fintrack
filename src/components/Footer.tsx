import React from "react";
import Link from "next/link";
import DbStatusBadge from "@/components/DbStatusBadge";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#000000", color: "#ffffff", padding: "48px 48px 32px 48px", marginTop: "auto", borderTop: "2px solid #222222" }}>
      <div style={{ maxWidth: "1360px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "36px", paddingBottom: "36px", borderBottom: "1px solid #222222" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            FinTrack<span style={{ color: "#FFE600" }}>.</span>
          </div>
          <p style={{ fontSize: "12px", color: "#888888", margin: "8px 0 0 0", lineHeight: 1.6 }}>
            Institutional credit portfolio intelligence, recurring mandate audits, and client-side statement compilation.
          </p>
        </div>

        <div>
          <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", color: "#666666", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
            SYSTEM DIRECTORY
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <Link href="/" style={{ color: "#CCCCCC", textDecoration: "none" }}>Portfolio Ledger</Link>
            <Link href="/about" style={{ color: "#CCCCCC", textDecoration: "none" }}>Architecture & Backing</Link>
            <Link href="/features" style={{ color: "#CCCCCC", textDecoration: "none" }}>Capabilities & Engine</Link>
            <Link href="/team" style={{ color: "#CCCCCC", textDecoration: "none" }}>Core Contributors</Link>
          </div>
        </div>

        <div>
          <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", color: "#666666", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
            REGULATORY STANDARDS
          </span>
          <p style={{ fontSize: "11px", color: "#888888", margin: 0, lineHeight: 1.6 }}>
            RBI Circular DPSS.CO.PD.No.750/02.14.003/2020-21 (E-Mandate Revocation Mandate)
            <br /><br />
            Digital Personal Data Protection Act (DPDP) 2023 Compliant: Zero Data Retention.
          </p>
        </div>

        <div>
          <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", color: "#666666", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
            ZERO-KNOWLEDGE VERIFICATION
          </span>
          <p style={{ fontSize: "11px", color: "#888888", margin: 0, lineHeight: 1.6 }}>
            All parsing execution occurs inside client WebWorker sandbox memory. Zero statement bytes are serialized or transmitted via network sockets.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1360px", margin: "24px auto 0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#555555" }}>
        <span>© 2026 FinTrack Intelligence Unit. All rights reserved.</span>

        {/* Institutional Bottom Status Placement */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DbStatusBadge />
          <span style={{ color: "#333333" }}>|</span>
          <span style={{ fontFamily: "monospace", color: "#555555" }}>DIRECT HTTPS-SQL</span>
        </div>

        <span style={{ letterSpacing: "0.05em" }}>CONFIDENTIAL • INTERNAL CLIENT-SIDE APPLICATION</span>
      </div>
    </footer>
  );
}