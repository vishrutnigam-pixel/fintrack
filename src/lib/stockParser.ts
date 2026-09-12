import { StockHolding } from "./db";

/**
 * Parses Tradebook CSV exports (Zerodha, Groww, AngelOne) or tabular CAS text in volatile memory.
 * Expected schema: Symbol/Ticker, Company, ISIN, Quantity, BuyPrice, CurrentPrice, Sector, CapType, Broker
 */
export function parseStockData(csvText: string): StockHolding[] {
  const lines = csvText.trim().split("\n");
  const holdings: StockHolding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.toLowerCase().startsWith("symbol") || line.toLowerCase().startsWith("ticker")) {
      continue;
    }

    const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length >= 6) {
      const ticker = cols[0].toUpperCase();
      const companyName = cols[1] || ticker;
      const isin = cols[2] || `INE${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const quantity = parseFloat(cols[3]) || 0;
      const avgBuyPrice = parseFloat(cols[4]) || 0;
      const currentPrice = parseFloat(cols[5]) || avgBuyPrice;
      const sector = cols[6] || "Diversified";
      const capType = (["Large", "Mid", "Small", "ETF", "Debt"].includes(cols[7]) ? cols[7] : "Large") as any;
      const broker = (["Zerodha", "Groww", "AngelOne", "ICICI Direct", "CDSL CAS"].includes(cols[8]) ? cols[8] : "Zerodha") as any;
      const expenseRatio = cols[9] ? parseFloat(cols[9]) : undefined;

      if (quantity > 0) {
        holdings.push({
          ticker,
          companyName,
          isin,
          quantity,
          avgBuyPrice,
          currentPrice,
          sector,
          capType,
          broker,
          expenseRatio,
        });
      }
    }
  }

  return holdings;
}