import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

interface QuoteResult {
  ticker: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
}

// Clean Indian ticker to Yahoo Finance format (e.g., "HDFCBANK" -> "HDFCBANK.NS")
function formatYahooSymbol(ticker: string): string {
  const cleaned = ticker.trim().toUpperCase();
  if (cleaned.endsWith(".NS") || cleaned.endsWith(".BO")) {
    return cleaned;
  }
  // Standard Indian equity symbols default to NSE (.NS)
  return `${cleaned}.NS`;
}

async function fetchQuote(symbol: string): Promise<QuoteResult | null> {
  const querySymbol = formatYahooSymbol(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    querySymbol
  )}?interval=1d&range=1d`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice ?? meta.chartPreviousClose;
    const prevClose = meta.chartPreviousClose ?? currentPrice;
    const change = currentPrice - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      ticker: symbol.toUpperCase(),
      price: Math.round(currentPrice * 100) / 100,
      currency: meta.currency || "INR",
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  } catch (err) {
    console.error(`[QUOTE FETCH ERROR] Symbol: ${symbol}`, err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      return NextResponse.json(
        { success: false, error: "Missing 'symbols' query parameter (e.g. ?symbols=HDFCBANK,RELIANCE)" },
        { status: 400 }
      );
    }

    const tickers = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    // Fetch quotes in parallel
    const quotes = (await Promise.all(tickers.map((t) => fetchQuote(t)))).filter(
      Boolean
    ) as QuoteResult[];

    return NextResponse.json({ success: true, quotes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST endpoint updates prices across all database holdings in Neon
export async function POST() {
  try {
    // 1. Fetch distinct tickers currently held in Neon database
    const rows = await sql`SELECT DISTINCT ticker FROM stock_holdings`;
    const tickers = rows.map((r: any) => r.ticker);

    if (tickers.length === 0) {
      return NextResponse.json({ success: true, updatedCount: 0, quotes: [] });
    }

    // 2. Fetch live quotes
    const quotes = (await Promise.all(tickers.map((t: string) => fetchQuote(t)))).filter(
      Boolean
    ) as QuoteResult[];

    // 3. Batch update Neon stock_holdings table
    let updatedCount = 0;
    for (const q of quotes) {
      if (q.price > 0) {
        await sql`
          UPDATE stock_holdings 
          SET current_price = ${q.price}, updated_at = NOW() 
          WHERE ticker = ${q.ticker}
        `;
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      quotes,
    });
  } catch (err: any) {
    console.error("[QUOTE SYNC POST ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}