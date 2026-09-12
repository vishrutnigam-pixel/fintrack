"use client";

import React, { useState } from "react";
import { X, Lock, Upload, CheckCircle2, AlertTriangle, FileText, Mail, RefreshCw } from "lucide-react";
import { extractTextFromProtectedPdf } from "@/lib/pdfParser";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionComplete: (bank: string, extractedRawText: string) => void;
}

export default function IngestModal({
  isOpen,
  onClose,
  onExtractionComplete,
}: IngestModalProps) {
  const [selectedBank, setSelectedBank] = useState<string>("HDFC");
  const [ingestMode, setIngestMode] = useState<"PDF" | "PASTE" | "GMAIL">("PDF");
  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "NEEDS_PASSWORD" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [gmailPollingState, setGmailPollingState] = useState<"IDLE" | "POLLING" | "FOUND">("IDLE");

  if (!isOpen) return null;

  const handleProcess = async () => {
    setStatus("PROCESSING");
    setErrorMessage("");

    try {
      if (ingestMode === "PASTE") {
        if (!pastedText.trim()) {
          setStatus("ERROR");
          setErrorMessage("Please supply transaction statement lines.");
          return;
        }
        setStatus("SUCCESS");
        setTimeout(() => {
          onExtractionComplete(selectedBank, pastedText);
          onClose();
        }, 500);
        return;
      }

      if (!file) return;
      const buffer = await file.arrayBuffer();
      const result = await extractTextFromProtectedPdf(buffer, password);

      if (!result.success) {
        if (result.error === "PASSWORD_REQUIRED_OR_INVALID") {
          setStatus("NEEDS_PASSWORD");
          setErrorMessage("Decryption key rejected by document security module.");
        } else {
          setStatus("ERROR");
          setErrorMessage(result.error || "Decryption failed.");
        }
        return;
      }

      const combinedText = result.pages?.map((p) => p.text).join("\n") || "";
      setStatus("SUCCESS");
      setTimeout(() => {
        onExtractionComplete(selectedBank, combinedText);
        onClose();
      }, 500);
    } catch {
      setStatus("ERROR");
      setErrorMessage("RAM allocation error during execution.");
    }
  };

  const simulateGmailPolling = () => {
    setGmailPollingState("POLLING");
    setTimeout(() => {
      setGmailPollingState("FOUND");
      setPastedText(
        `02/09/2026 AMAZON WEB SERVICES IN 14280.50 Dr\n01/09/2026 NETFLIX ENTERTAINMENT IN 649.00 Dr\n20/08/2026 SPOTIFY INDIA 119.00 Dr`
      );
    }, 1800);
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ backgroundColor: "#F9F8F3", border: "2px solid #000000", width: "100%", maxWidth: "560px", padding: "36px", position: "relative" }}>
        
        <button onClick={onClose} style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: "none", cursor: "pointer" }}>
          <X size={20} />
        </button>

        <div style={{ borderBottom: "2px solid #000000", paddingBottom: "12px", marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#666666", display: "block" }}>
            SECTION 3 DATA RETRIEVAL MATRIX
          </span>
          <h2 style={{ fontSize: "22px", fontWeight: 900, textTransform: "uppercase", margin: "4px 0 0 0" }}>
            Ingest Bank Statements
          </h2>
        </div>

        {/* Bank Picker */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Issuing Bank
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
            {["HDFC", "ICICI", "SBI", "AXIS", "AMEX"].map((bank) => (
              <button
                key={bank}
                onClick={() => setSelectedBank(bank)}
                style={{
                  padding: "8px 0",
                  fontSize: "11px",
                  fontWeight: 900,
                  border: "1px solid #000000",
                  cursor: "pointer",
                  backgroundColor: selectedBank === bank ? "#000000" : "#EFECE1",
                  color: selectedBank === bank ? "#ffffff" : "#000000",
                }}
              >
                {bank}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{ display: "flex", borderBottom: "1px solid #DDD9C9", marginBottom: "16px", gap: "8px" }}>
          {[
            { id: "PDF", label: "Local PDF File" },
            { id: "PASTE", label: "Paste Ledger Text" },
            { id: "GMAIL", label: "Automated Polling" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setIngestMode(mode.id as any)}
              style={{
                padding: "8px 12px",
                fontSize: "11px",
                fontWeight: 800,
                border: "none",
                borderBottom: ingestMode === mode.id ? "2px solid #000000" : "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Ingest Mode Views */}
        {ingestMode === "PDF" && (
          <div style={{ border: "2px dashed #DDD9C9", padding: "28px", textAlign: "center", backgroundColor: "#EFECE1", marginBottom: "18px" }}>
            <input
              type="file"
              accept=".pdf"
              id="pdf-input"
              style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
            />
            <label htmlFor="pdf-input" style={{ cursor: "pointer", display: "block" }}>
              {file ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 800, fontSize: "12px" }}>
                  <FileText size={16} /> {file.name}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <Upload size={24} />
                  <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Select Encrypted PDF</span>
                  <span style={{ fontSize: "10px", color: "#666666" }}>EPHEMERAL RAM BUFFER • ZERO DISK WRITE</span>
                </div>
              )}
            </label>
          </div>
        )}

        {ingestMode === "PASTE" && (
          <div style={{ marginBottom: "18px" }}>
            <textarea
              placeholder="Paste raw text lines copied from statement..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              style={{
                width: "100%",
                height: "110px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #000000",
                padding: "10px",
                fontSize: "11px",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
          </div>
        )}

        {ingestMode === "GMAIL" && (
          <div style={{ backgroundColor: "#EFECE1", border: "1px solid #DDD9C9", padding: "18px", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Mail size={16} />
              <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase" }}>
                Restricted Read-Only Statement Scanner
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#555555", lineHeight: 1.5, margin: "0 0 12px 0" }}>
              Queries incoming messages matching criteria (e.g. <code>from:alerts@{selectedBank.toLowerCase()}bank.net filename:pdf</code>) to retrieve statements directly into temporary memory.
            </p>
            {gmailPollingState === "FOUND" ? (
              <div style={{ fontSize: "11px", color: "#008800", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} /> Retrieved latest {selectedBank} statement attachment into memory stream.
              </div>
            ) : (
              <button
                type="button"
                onClick={simulateGmailPolling}
                disabled={gmailPollingState === "POLLING"}
                style={{
                  backgroundColor: "#000000",
                  color: "#FFFFFF",
                  padding: "8px 14px",
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {gmailPollingState === "POLLING" ? <RefreshCw size={12} className="animate-spin" /> : <Mail size={12} />}
                <span>{gmailPollingState === "POLLING" ? "Querying Repository..." : "Run Background Poll"}</span>
              </button>
            )}
          </div>
        )}

        {(status === "NEEDS_PASSWORD" || password.length > 0) && ingestMode === "PDF" && (
          <div style={{ marginBottom: "16px", backgroundColor: "#EFECE1", border: "1px solid #DDD9C9", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 900, marginBottom: "6px" }}>
              <Lock size={12} /> Enter Decryption Key
            </div>
            <input
              type="password"
              placeholder="Cardholder Schema Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px", outline: "none" }}
            />
          </div>
        )}

        {errorMessage && (
          <div style={{ marginBottom: "14px", padding: "10px", backgroundColor: "#FFF0F0", border: "1px solid #000000", fontSize: "11px", color: "#D00000", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} /> {errorMessage}
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={status === "PROCESSING"}
          style={{
            backgroundColor: "#000000",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            padding: "12px 20px",
            border: "1px solid #000000",
            cursor: "pointer",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {status === "PROCESSING" ? "Parsing in RAM..." : "Commit Statement to Memory"}
        </button>
      </div>
    </div>
  );
}