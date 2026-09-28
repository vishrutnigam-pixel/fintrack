"use client";

import React, { useState, useEffect } from "react";
import { Database } from "lucide-react";

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
    const interval = setInterval(checkHealth, 45000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    ONLINE: {
      dotColor: "#10b981",
      label: "NEON POSTGRESQL",
      sublabel: healthData?.latencyMs ? `[${healthData.latencyMs}ms]` : "[ONLINE]",
      textColor: "#888888",
    },
    CONNECTING: {
      dotColor: "#666666",
      label: "PROBING CLUSTER",
      sublabel: "[...]",
      textColor: "#666666",
    },
    OFFLINE: {
      dotColor: "#f59e0b",
      label: "STORAGE: LOCAL CACHE",
      sublabel: "[INDEXEDDB]",
      textColor: "#d97706",
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
          gap: "8px",
          cursor: "pointer",
          userSelect: "none",
          fontFamily: "monospace",
          fontSize: "11px",
        }}
      >
        {/* Subtle Status Dot */}
        <span
          style={{
            display: "inline-block",
            height: "6px",
            width: "6px",
            borderRadius: "50%",
            backgroundColor: config.dotColor,
          }}
        />

        <span style={{ color: config.textColor, letterSpacing: "0.05em" }}>
          {config.label} {config.sublabel}
        </span>
      </div>

      {/* Upward Tooltip for Footer Placement */}
      {isTooltipOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            width: "240px",
            backgroundColor: "#0d0d0d",
            border: "1px solid #262626",
            padding: "10px 12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
            color: "#ffffff",
            fontFamily: "monospace",
            fontSize: "10px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              borderBottom: "1px solid #222222",
              paddingBottom: "4px",
              color: "#888888",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            <span>TELEMETRY METRICS</span>
            <Database size={11} color={config.dotColor} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px", color: "#cccccc" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666666" }}>Driver:</span>
              <span>@neondatabase/serverless</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666666" }}>Transport:</span>
              <span>Direct HTTPS-SQL</span>
            </div>
            {healthData && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666666" }}>Database:</span>
                  <span>{healthData.databaseName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666666" }}>Latency:</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>{healthData.latencyMs}ms</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}