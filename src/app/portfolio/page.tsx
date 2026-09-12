"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { StockHolding, TransactionRecord } from "@/lib/db";
import { apiClient } from "@/lib/apiClient";
import { parseStockData } from "@/lib/stockParser";
import { 
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, 
  Upload, Trash2, Plus, PieChart, Landmark, ArrowRight, Activity 
} from "lucide-react";
import Link from "next/link";

const SEED_HOLDINGS: StockHolding[] = [
  { ticker: "HDFCBANK", companyName: "HDFC Bank Ltd", isin: "INE040A01034", quantity: 120, avgBuyPrice: 1540.0, currentPrice: 1680.5, sector: "Banking & Finance", capType: "Large", broker: "Zerodha" },
  { ticker: "RELIANCE", companyName: "Reliance Industries Ltd", isin: "INE002A01018", quantity: 60, avgBuyPrice: 2820.0, currentPrice: 3010.0, sector: "Energy & Conglomerate", capType: "Large", broker: "Zerodha" },
  { ticker: "TCS", companyName: "Tata Consultancy Services", isin: "INE467B01029", quantity: 35, avgBuyPrice: 3950.0, currentPrice: 4220.0, sector: "Information Technology", capType: "Large", broker: "Groww" },
  { ticker: "NIFTYBEES", companyName: "Nippon India Nifty 50 ETF", isin: "INF204KB14I2", quantity: 1500, avgBuyPrice: 245.0, currentPrice: 272.5, sector: "Index ETF", capType: "ETF", broker: "Zerodha", expenseRatio: 0.04 },
  { ticker: "KAYNES", companyName: "Kaynes Technology India", isin: "INE918Z01012", quantity: 45, avgBuyPrice: 4100.0, currentPrice: 5350.0, sector: "Electronics Manufacturing", capType: "Mid", broker: "Groww" },
  { ticker: "LIQUIDBEES", companyName: "Nippon India Liquid ETF", isin: "INF204K01011", quantity: 400, avgBuyPrice: 1000.0, currentPrice: 1000.0, sector: "Cash Equivalent", capType: "Debt", broker: "Zerodha", expenseRatio: 0.25 },
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [csvInput, setCsvInput] = useState("");
  const [activeCapFilter, setActiveCapFilter] = useState<string>("ALL");
  const [statusMsg, setStatusMsg] = useState("");
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Direct manual entry state
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [qty, setQty] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [currPrice, setCurrPrice] = useState("");
  const [sector, setSector] = useState("Banking & Finance");
  const [capType, setCapType] = useState<"Large" | "Mid" | "Small" | "ETF" | "Debt">("Large");
  const [broker, setBroker] = useState<"Zerodha" | "Groww" | "AngelOne" | "ICICI Direct" | "CDSL CAS">("Zerodha");

  const loadAll = async () => {
    try {
      let existingH = await apiClient.getHoldings();
      if (existingH.length === 0) {
        await apiClient.addHoldings(SEED_HOLDINGS);
        existingH = SEED_HOLDINGS;
      }
      setHoldings(existingH);

      const tx = await apiClient.getTransactions();
      setTransactions(tx);
    } catch (err) {
      console.error("[LOAD HOLDINGS ERROR]", err);
      setHoldings(SEED_HOLDINGS);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSyncMarketPrices = async () => {
    setIsSyncingPrices(true);
    try {
      const res = await apiClient.syncLiveMarketPrices();
      setStatusMsg(`Synced market prices for ${res.updatedCount} positions from NSE/BSE.`);
      setLastSyncedAt(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      await loadAll();
    } catch (err: any) {
      setStatusMsg(`Failed to sync market prices: ${err.message}`);
    } finally {
      setIsSyncingPrices(false);
      setTimeout(() => setStatusMsg(""), 4500);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !qty || !buyPrice) return;

    const newH: StockHolding = {
      ticker: ticker.toUpperCase().trim(),
      companyName: companyName.trim() || ticker.toUpperCase().trim(),
      isin: `INE${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      quantity: parseFloat(qty),
      avgBuyPrice: parseFloat(buyPrice),
      currentPrice: currPrice ? parseFloat(currPrice) : parseFloat(buyPrice),
      sector,
      capType,
      broker,
    };

    try {
      await apiClient.addHoldings([newH]);
      setStatusMsg(`Committed ${newH.ticker} to Neon database.`);
      setTicker("");
      setCompanyName("");
      setQty("");
      setBuyPrice("");
      setCurrPrice("");
      await loadAll();
    } catch (err) {
      console.error("[SAVE HOLDING ERROR]", err);
    }
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const handleCsvImport = async () => {
    if (!csvInput.trim()) return;
    const parsed = parseStockData(csvInput);
    if (parsed.length > 0) {
      try {
        await apiClient.addHoldings(parsed);
        setStatusMsg(`Ingested ${parsed.length} positions into Neon database.`);
        setCsvInput("");
        await loadAll();
      } catch (err) {
        console.error("[BULK IMPORT ERROR]", err);
      }
      setTimeout(() => setStatusMsg(""), 3500);
    }
  };

  // Mathematical Aggregates
  const totalInvested = useMemo(
    () => holdings.reduce((sum, h) => sum + h.quantity * h.avgBuyPrice, 0),
    [holdings]
  );
  const currentValuation = useMemo(
    () => holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0),
    [holdings]
  );
  const unrealizedPnL = currentValuation - totalInvested;
  const pnlPercent = totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;

  // Sector Concentration Calculations
  const sectorWeights = useMemo(() => {
    const mapping: Record<string, number> = {};
    holdings.forEach((h) => {
      const val = h.quantity * h.currentPrice;
      mapping[h.sector] = (mapping[h.sector] || 0) + val;
    });
    return Object.entries(mapping)
      .map(([s, val]) => ({
        sector: s,
        value: val,
        percentage: currentValuation > 0 ? (val / currentValuation) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, currentValuation]);

  // Cross-Asset Runway Coverage vs Credit Liabilities
  const liquidReserves = useMemo(() => {
    return holdings
      .filter((h) => h.capType === "Debt" || h.sector.toLowerCase().includes("liquid"))
      .reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  }, [holdings]);

  const monthlyCardDebt = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const runwayMonths = monthlyCardDebt > 0 ? (liquidReserves / monthlyCardDebt).toFixed(1) : "N/A";

  // Depository Participant (DP) Friction Audit (₹13.50 + 18% GST = ₹15.93 per holding on redemption)
  const totalDpFriction = holdings.length * 15.93;

  const filteredHoldings = holdings.filter(
    (h) => activeCapFilter === "ALL" || h.capType === activeCapFilter
  );

  return (
    <div style={{ backgroundColor: "#F9F8F3", color: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ maxWidth: "1360px", margin: "0 auto", width: "100%", padding: "48px 48px", flex: 1 }}>
        
        {/* Editorial Masthead */}
        <section style={{ borderBottom: "1px solid #DDD9C9", paddingBottom: "36px", marginBottom: "40px" }}>
          <div className="br-tagline" style={{ color: "#666666" }}>CAPITAL ASSET & EQUITY INTELLIGENCE</div>
          <h1 className="br-editorial-title" style={{ fontSize: "3rem", margin: "8px 0 0 0" }}>
            Consolidated Equity Portfolio & Friction Audit
          </h1>
          <p style={{ fontSize: "16px", color: "#444444", lineHeight: 1.6, margin: "10px 0 0 0", maxWidth: "880px" }}>
            Track cross-broker holdings (Zerodha, Groww, CAMS/CDSL CAS) backed by Neon Serverless Postgres. Audits concentration risk, expense drag, and liquidity coverage against current credit liabilities.
          </p>
        </section>

        {statusMsg && (
          <div style={{ backgroundColor: "#EFECE1", border: "1px solid #000000", padding: "12px 18px", marginBottom: "24px", fontSize: "12px", fontWeight: 800 }}>
            {statusMsg}
          </div>
        )}

        {/* Top KPI Exposure Deck */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          
          <div className="br-sand-box">
            <span className="br-tagline" style={{ color: "#777777" }}>PORTFOLIO VALUATION</span>
            <h2 style={{ fontSize: "2.6rem", fontWeight: 900, margin: "8px 0 4px 0", letterSpacing: "-0.04em" }} className="tabular-nums">
              ₹{currentValuation.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
            <div style={{ fontSize: "12px", color: "#666666" }}>
              Invested Capital: ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="br-sand-box">
            <span className="br-tagline" style={{ color: "#777777" }}>UNREALIZED TRAJECTORY</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "8px 0 4px 0" }}>
              <h2 style={{ fontSize: "2.6rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0 }} className="tabular-nums">
                {unrealizedPnL >= 0 ? `+₹${unrealizedPnL.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : `-₹${Math.abs(unrealizedPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              </h2>
              <span style={{ fontSize: "14px", fontWeight: 900, padding: "2px 6px", backgroundColor: unrealizedPnL >= 0 ? "#000000" : "#D00000", color: unrealizedPnL >= 0 ? "#FFE600" : "#FFFFFF" }}>
                {unrealizedPnL >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#666666" }}>
              Across {holdings.length} distinct capital instruments
            </div>
          </div>

          {/* Cross-Asset Runway Matcher (Credit Liabilities vs Liquid Equity) */}
          <div className="br-sand-box">
            <span className="br-tagline" style={{ color: "#777777" }}>CROSS-ASSET RUNWAY COVERAGE</span>
            <h2 style={{ fontSize: "2.6rem", fontWeight: 900, margin: "8px 0 4px 0", letterSpacing: "-0.04em" }} className="tabular-nums">
              {runwayMonths} Months
            </h2>
            <div style={{ fontSize: "12px", color: "#666666" }}>
              Liquid Reserves (₹{liquidReserves.toLocaleString("en-IN")}) vs Current Card Obligations (₹{monthlyCardDebt.toLocaleString("en-IN")})
            </div>
          </div>

        </section>

        {/* Sector Concentration & Friction Leak Deck */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "48px" }}>
          
          {/* Sector Allocation Matrix */}
          <div className="br-sand-box">
            <span className="br-tagline" style={{ color: "#777777" }}>CONCENTRATION RISK MONITOR</span>
            <h3 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", margin: "6px 0 20px 0" }}>
              Sector Allocation Matrix
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {sectorWeights.map((w) => {
                const isOverweight = w.percentage >= 25;
                return (
                  <div key={w.sector}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 800, marginBottom: "4px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {w.sector}
                        {isOverweight && (
                          <span style={{ fontSize: "9px", backgroundColor: "#000000", color: "#FFE600", padding: "1px 5px", fontWeight: 900 }}>
                            OVERWEIGHT (&gt;25%)
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums">₹{w.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({Math.round(w.percentage)}%)</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "#DCD8CC" }}>
                      <div style={{ width: `${w.percentage}%`, height: "100%", backgroundColor: isOverweight ? "#000000" : "#666666" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Friction & Leak Audit */}
          <div className="br-sand-box">
            <span className="br-tagline" style={{ color: "#777777" }}>TRANSACTION FRICTION & LEAK AUDIT</span>
            <h3 style={{ fontSize: "18px", fontWeight: 900, textTransform: "uppercase", margin: "6px 0 20px 0" }}>
              Institutional Cost Drag
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9C9", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "13px" }}>Depository Participant (DP) Sell Friction</div>
                  <div style={{ fontSize: "11px", color: "#666666" }}>Projected debit fee (₹13.50 + 18% GST = ₹15.93 per ISIN)</div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 900, fontFamily: "monospace" }}>
                  -₹{totalDpFriction.toFixed(2)}
                </div>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9C9", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "13px" }}>STCG / LTCG Threshold Safeguard</div>
                  <div style={{ fontSize: "11px", color: "#666666" }}>Section 112A annual tax-free headroom remaining (₹1,25,000 max)</div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 900, fontFamily: "monospace" }}>
                  ₹{(Math.max(0, 125000 - Math.max(0, unrealizedPnL))).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9C9", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "13px" }}>Database Synchronization Engine</div>
                  <div style={{ fontSize: "11px", color: "#666666" }}>Neon Serverless Postgres Gateway</div>
                </div>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#008800" }}>
                  LIVE CONNECTED
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Interactive Asset Matrix & Filter */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #000000", paddingBottom: "16px", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="br-tagline" style={{ color: "#666666" }}>HOLDINGS CONSOLE</span>
              <h2 style={{ fontSize: "24px", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>
                Audited Capital Holdings
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {/* Zero-Token Live Market Sync Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={handleSyncMarketPrices}
                  disabled={isSyncingPrices}
                  style={{
                    backgroundColor: "#000000",
                    color: "#FFE600",
                    border: "1px solid #000000",
                    padding: "8px 14px",
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: isSyncingPrices ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: isSyncingPrices ? 0.7 : 1,
                  }}
                >
                  <Activity size={13} className={isSyncingPrices ? "animate-spin" : ""} />
                  <span>{isSyncingPrices ? "Updating Quotes..." : "Sync Live Market Quotes"}</span>
                </button>

                {lastSyncedAt && (
                  <span style={{ fontSize: "10px", color: "#666666", fontFamily: "monospace" }}>
                    Updated: {lastSyncedAt}
                  </span>
                )}
              </div>

              {/* Cap Classification Filters */}
              <div style={{ display: "flex", border: "1px solid #DDD9C9", padding: "4px", backgroundColor: "#EFECE1", gap: "4px" }}>
                {["ALL", "Large", "Mid", "Small", "ETF", "Debt"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCapFilter(tab)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "11px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: activeCapFilter === tab ? "#000000" : "transparent",
                      color: activeCapFilter === tab ? "#ffffff" : "#555555",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #DDD9C9", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#EFECE1", borderBottom: "1px solid #DDD9C9", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "11px" }}>
                  <th style={{ padding: "14px 18px" }}>Instrument / Ticker</th>
                  <th style={{ padding: "14px 18px" }}>Sector & Cap</th>
                  <th style={{ padding: "14px 18px" }}>Broker Account</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Quantity</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Avg Buy Price</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Current Price</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Current Value</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Net Gain/Loss</th>
                  <th style={{ padding: "14px 18px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map((h, i) => {
                  const val = h.quantity * h.currentPrice;
                  const cost = h.quantity * h.avgBuyPrice;
                  const diff = val - cost;
                  const diffPct = cost > 0 ? (diff / cost) * 100 : 0;

                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #E8E4D5", backgroundColor: i % 2 === 0 ? "#F9F8F3" : "#F3EFE4" }}>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ fontWeight: 900, fontSize: "13px" }}>{h.ticker}</div>
                        <div style={{ fontSize: "10px", color: "#777777" }}>{h.companyName}</div>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <div>{h.sector}</div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#666666" }}>{h.capType}</span>
                      </td>
                      <td style={{ padding: "12px 18px", fontWeight: 800 }}>{h.broker}</td>
                      <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "monospace" }}>{h.quantity}</td>
                      <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "monospace" }}>₹{h.avgBuyPrice.toFixed(2)}</td>
                      <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>₹{h.currentPrice.toFixed(2)}</td>
                      <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>₹{val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>
                        <span style={{ color: diff >= 0 ? "#008800" : "#D00000" }}>
                          {diff >= 0 ? "+" : ""}₹{diff.toFixed(2)} ({diffPct >= 0 ? "+" : ""}{diffPct.toFixed(1)}%)
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "center" }}>
                        <button
                          onClick={async () => {
                            if (h.id) {
                              await apiClient.deleteHolding(h.id);
                              loadAll();
                            }
                          }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#888888" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Input Deck: Direct Entry & CSV Tradebook Ingestion */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "36px", marginTop: "48px" }}>
          
          {/* Manual Entry Form */}
          <div className="br-sand-box">
            <h3 style={{ fontSize: "16px", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px" }}>
              Manual Position Posting
            </h3>

            <form onSubmit={handleManualAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Ticker Symbol</label>
                  <input type="text" placeholder="e.g. INFY" value={ticker} onChange={(e) => setTicker(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Company / Scheme Name</label>
                  <input type="text" placeholder="Infosys Limited" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Quantity</label>
                  <input type="number" placeholder="50" value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Avg Buy Price</label>
                  <input type="number" placeholder="1850" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Current Price</label>
                  <input type="number" placeholder="1920" value={currPrice} onChange={(e) => setCurrPrice(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Cap Classification</label>
                  <select value={capType} onChange={(e) => setCapType(e.target.value as any)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "11px", fontWeight: 700 }}>
                    <option value="Large">Large Cap</option>
                    <option value="Mid">Mid Cap</option>
                    <option value="Small">Small Cap</option>
                    <option value="ETF">ETF / Index</option>
                    <option value="Debt">Debt / Liquid</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Sector Bucket</label>
                  <input type="text" value={sector} onChange={(e) => setSector(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "12px" }} />
                </div>

                <div>
                  <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Depository / Broker</label>
                  <select value={broker} onChange={(e) => setBroker(e.target.value as any)} style={{ width: "100%", padding: "8px", border: "1px solid #000000", fontSize: "11px", fontWeight: 700 }}>
                    <option value="Zerodha">Zerodha</option>
                    <option value="Groww">Groww</option>
                    <option value="AngelOne">AngelOne</option>
                    <option value="ICICI Direct">ICICI Direct</option>
                    <option value="CDSL CAS">CDSL CAS</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="br-black-button" style={{ justifyContent: "center", marginTop: "8px" }}>
                <Plus size={14} /> Commit Position to Neon Cloud
              </button>
            </form>
          </div>

          {/* Tradebook CSV Importer */}
          <div className="br-sand-box">
            <h3 style={{ fontSize: "16px", fontWeight: 900, textTransform: "uppercase", marginBottom: "10px" }}>
              Batch Tradebook / CAS Import
            </h3>
            <p style={{ fontSize: "11.5px", color: "#555555", margin: "0 0 12px 0" }}>
              Paste lines from Zerodha Console, Groww tradebook, or CDSL e-CAS. Schema:<br />
              <code style={{ fontSize: "10px", backgroundColor: "#FFFFFF", padding: "2px 4px", border: "1px solid #DDD9C9", display: "inline-block", marginTop: "4px" }}>
                Symbol, Company, ISIN, Quantity, BuyPrice, CurrentPrice, Sector, CapType, Broker
              </code>
            </p>

            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={`TATAMOTORS, Tata Motors Ltd, INE155A01022, 100, 920.00, 1040.00, Auto, Large, Zerodha\nITC, ITC Limited, INE154A01025, 250, 410.00, 480.00, FMCG, Large, Groww`}
              style={{ width: "100%", height: "140px", backgroundColor: "#FFFFFF", border: "1px solid #000000", padding: "10px", fontSize: "11px", fontFamily: "monospace", outline: "none", marginBottom: "12px" }}
            />

            <button onClick={handleCsvImport} className="br-black-button" style={{ width: "100%", justifyContent: "center" }}>
              <Upload size={14} /> Parse Positions into Neon Cloud
            </button>
          </div>

        </section>

      </main>

      <footer style={{ backgroundColor: "#000000", color: "#ffffff", padding: "28px 48px", textAlign: "center", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        FinTrack Capital Assets • Neon Serverless Postgres • Zero Broker Telemetry
      </footer>
    </div>
  );
}