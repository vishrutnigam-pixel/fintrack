"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Upload, Download, Sparkles, SplitSquareVertical, 
  ChevronDown, SlidersHorizontal 
} from "lucide-react";

interface NavbarProps {
  onOpenIngest?: () => void;
  onExportCSV?: () => void;
  onOpenAIAudit?: () => void;
  onOpenDiff?: () => void;
}

export default function Navbar({
  onOpenIngest,
  onExportCSV,
  onOpenAIAudit,
  onOpenDiff,
}: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  
  // Dropdown menus state
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const overviewRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overviewRef.current && !overviewRef.current.contains(e.target as Node)) {
        setIsOverviewOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary workspaces visible directly
  const primaryLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Stocks & Assets", href: "/portfolio" },
    { label: "Ledger Entries", href: "/transactions" },
  ];

  // Secondary navigational pages grouped under "Intelligence"
  const secondaryLinks = [
    { label: "Capabilities & Specs", href: "/features" },
    { label: "Benchmark vs Industry", href: "/compare" },
    { label: "Instrument Setup & Vaults", href: "/settings" },
    { label: "Architecture & DPDP Vision", href: "/about" },
    { label: "Institutional Team", href: "/team" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled
          ? "rgba(10, 10, 10, 0.88)"
          : "rgba(10, 10, 10, 0.76)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        color: "#ffffff",
        padding: "0 40px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "58px",
        }}
      >
        {/* Left: Brand Identity & Primary Workspaces */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "17px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              FinTrack<span style={{ color: "#FFE600" }}>.</span>
            </span>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.22em",
                color: "#777777",
                textTransform: "uppercase",
                fontWeight: 800,
                paddingLeft: "8px",
                borderLeft: "1px solid rgba(255, 255, 255, 0.14)",
              }}
            >
              Terminal
            </span>
          </Link>

          {/* Primary Route Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "10.5px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: isActive ? 900 : 700,
                    color: isActive ? "#ffffff" : "#8e8e93",
                    textDecoration: "none",
                    position: "relative",
                    padding: "6px 0",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#8e8e93";
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "-1px",
                        left: 0,
                        right: 0,
                        height: "2px",
                        backgroundColor: "#FFE600",
                        boxShadow: "0 0 8px rgba(255, 230, 0, 0.5)",
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Consolidated Secondary Dropdown: "Intelligence" */}
            <div ref={overviewRef} style={{ position: "relative" }}>
              <button
                onClick={() => setIsOverviewOpen((prev) => !prev)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "10.5px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: isOverviewOpen ? "#ffffff" : "#8e8e93",
                  padding: "6px 0",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => {
                  if (!isOverviewOpen) e.currentTarget.style.color = "#8e8e93";
                }}
              >
                <span>Intelligence</span>
                <ChevronDown
                  size={11}
                  style={{
                    transform: isOverviewOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>

              {isOverviewOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: 0,
                    width: "210px",
                    backgroundColor: "#111111",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    padding: "8px 0",
                    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.7)",
                    zIndex: 100,
                  }}
                >
                  {secondaryLinks.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setIsOverviewOpen(false)}
                        style={{
                          display: "block",
                          padding: "8px 16px",
                          fontSize: "10.5px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: isSubActive ? 900 : 700,
                          color: isSubActive ? "#FFE600" : "#a1a1aa",
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                          backgroundColor: isSubActive ? "rgba(255, 255, 255, 0.04)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSubActive ? "rgba(255, 255, 255, 0.04)" : "transparent";
                          e.currentTarget.style.color = isSubActive ? "#FFE600" : "#a1a1aa";
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Forensic Tools Menu + Ingest */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            fontSize: "10.5px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          {/* Consolidated Action Menu: "Forensic Tools" */}
          <div ref={toolsRef} style={{ position: "relative" }}>
            <button
              onClick={() => setIsToolsOpen((prev) => !prev)}
              style={{
                background: "none",
                border: "none",
                padding: "6px 0",
                color: isToolsOpen ? "#ffffff" : "#a1a1aa",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => {
                if (!isToolsOpen) e.currentTarget.style.color = "#a1a1aa";
              }}
            >
              <SlidersHorizontal size={12} style={{ opacity: 0.8 }} />
              <span>Forensic Tools</span>
              <ChevronDown
                size={11}
                style={{
                  transform: isToolsOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {isToolsOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  right: 0,
                  width: "200px",
                  backgroundColor: "#111111",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  padding: "8px 0",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.7)",
                  zIndex: 100,
                }}
              >
                {onOpenAIAudit && (
                  <button
                    onClick={() => {
                      onOpenAIAudit();
                      setIsToolsOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "10.5px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 800,
                      color: "#FFE600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Sparkles size={12} />
                    <span>AI Forensic Audit</span>
                  </button>
                )}

                {onOpenDiff && (
                  <button
                    onClick={() => {
                      onOpenDiff();
                      setIsToolsOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "10.5px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#d4d4d8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <SplitSquareVertical size={12} />
                    <span>MoM Diff View</span>
                  </button>
                )}

                {onExportCSV && (
                  <button
                    onClick={() => {
                      onExportCSV();
                      setIsToolsOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "10.5px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#d4d4d8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Download size={12} />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Primary Action: Ingest Statement */}
          {onOpenIngest ? (
            <button
              onClick={onOpenIngest}
              style={{
                background: "none",
                border: "none",
                padding: "4px 0",
                color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
                transition: "border-color 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FFE600";
                e.currentTarget.style.color = "#FFE600";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              <Upload size={12} />
              <span>Ingest</span>
            </button>
          ) : (
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
              }}
            >
              <span>Console</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}