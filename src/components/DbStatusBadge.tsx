"use client";

import React, { useState, useEffect } from "react";
import { Database, AlertCircle, RefreshCw } from "lucide-react";

type ConnectionState = "CONNECTING" | "ONLINE" | "OFFLINE";

interface HealthData {
  databaseName?: string;
  currentUser?: string;
  latencyMs?: number;
  serverTime?: string;
}

export default function DbStatusBadge() {
  const [state, setState] = useState<ConnectionState>("CONNECTING");
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        const json = await res.json();
        if (json.status === "CONNECTED_TO_NEON") {
          setHealthData({
            databaseName: json.connectionDetails?.databaseName,
            currentUser: json.connectionDetails?.currentUser,
            latencyMs: latency,
            serverTime: json.connectionDetails?.serverTime,
          });
          setState("ONLINE");
          return;
        }
      }
      setState("OFFLINE");
    } catch {
      setState("OFFLINE");
    }
  };

  useEffect(() => {
    checkHealth();
    // Re-verify health every 45 seconds
    const interval = setInterval(checkHealth, 45000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    ONLINE: {
      color: "#00FF66",
      label: "NEON CONNECTED",
      sublabel: healthData?.latencyMs ? `${healthData.latencyMs}ms` : "Active",
      borderColor: "rgba(0, 255, 102, 0.25)",
      bg: "rgba(0, 255, 102, 0.05)",
    },
    CONNECTING: {
      color: "#FFE600",
      label: "PROBING NEON",
      sublabel: "Handshake",
      borderColor: "rgba(255, 230, 0, 0.25)",
      bg: "rgba(255, 230, 0, 0.05)",
    },
    OFFLINE: {
      color: "#FF4D4D",
      label: "NEON OFFLINE",
      sublabel: "Local Fallback",
      borderColor: "rgba(255, 77, 77, 0.3)",
      bg: "rgba(255, 77, 77, 0.06)",
    },
  }[state];

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => setIsTooltipOpen(false)}
    >
      <div
        onClick={checkHealth}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "4px 9px",
          backgroundColor: config.bg,
          border: `1px solid ${config.borderColor}`,
          borderRadius: "2px",
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.15s ease",
        }}
      >
        {/* Pulsing Status Dot */}
        <span
          style={{
            position: "relative",
            display: "flex",
            height: "6px",
            width: "6px",
          }}
        >
          {state === "ONLINE" && (
            <span
              style={{
                position: "absolute",
                display: "inline-flex",
                height: "100%",
                width: "100%",
                borderRadius: "50%",
                backgroundColor: config.color,
                opacity: 0.75,
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
          )}
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              borderRadius: "50%",
              height: "6px",
              width: "6px",
              backgroundColor: config.color,
              boxShadow: `0 0 6px ${config.color}`,
            }}
          />
        </span>

        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.12em",
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#FFFFFF",
            fontFamily: "monospace",
          }}
        >
          {config.label}
        </span>

        <span
          style={{
            fontSize: "8.5px",
            fontWeight: 700,
            color: config.color,
            fontFamily: "monospace",
            opacity: 0.9,
          }}
        >
          [{config.sublabel}]
        </span>
      </div>

      {/* Hover Diagnostic Dossier */}
      {isTooltipOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 100,
            width: "260px",
            backgroundColor: "#111111",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            padding: "12px 14px",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)",
            color: "#FFFFFF",
          }}
        >
          <div
            style={{
              fontSize: "9.5px",
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#888888",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Telemetry Diagnostic</span>
            <Database size={10} color={config.color} />
          </div>

          <div
            style={{
              fontSize: "11px",
              lineHeight: 1.6,
              fontFamily: "monospace",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#777777" }}>Driver:</span>
              <span style={{ fontWeight: 800 }}>@neondatabase/serverless</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#777777" }}>Transport:</span>
              <span style={{ fontWeight: 800 }}>Direct HTTPS SQL</span>
            </div>
            {healthData && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#777777" }}>Database:</span>
                  <span style={{ fontWeight: 800 }}>{healthData.databaseName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#777777" }}>User:</span>
                  <span style={{ fontWeight: 800 }}>{healthData.currentUser}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#777777" }}>Latency:</span>
                  <span style={{ fontWeight: 800, color: "#00FF66" }}>
                    {healthData.latencyMs} ms
                  </span>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              marginTop: "8px",
              paddingTop: "6px",
              fontSize: "9px",
              color: "#666666",
              textAlign: "right",
            }}
          >
            Click badge to re-probe
          </div>
        </div>
      )}
    </div>
  );
}