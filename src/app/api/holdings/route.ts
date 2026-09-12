import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/serverDb";

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        id, ticker, company_name AS "companyName", isin, 
        quantity::FLOAT, avg_buy_price::FLOAT AS "avgBuyPrice", 
        current_price::FLOAT AS "currentPrice", sector, 
        cap_type AS "capType", broker, expense_ratio::FLOAT AS "expenseRatio"
      FROM stock_holdings
      ORDER BY (quantity * current_price) DESC
    `;
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error("[NEON HOLDINGS GET ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    for (const h of items) {
      await sql`
        INSERT INTO stock_holdings (
          ticker, company_name, isin, quantity, avg_buy_price, 
          current_price, sector, cap_type, broker, expense_ratio
        ) VALUES (
          ${h.ticker.toUpperCase()}, ${h.companyName}, ${h.isin}, 
          ${h.quantity}, ${h.avgBuyPrice}, ${h.currentPrice}, 
          ${h.sector}, ${h.capType}, ${h.broker}, ${h.expenseRatio || null}
        )
      `;
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (err: any) {
    console.error("[NEON HOLDINGS POST ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });

    await sql`DELETE FROM stock_holdings WHERE id = ${parseInt(id, 10)}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}