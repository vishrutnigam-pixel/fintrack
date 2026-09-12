import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/serverDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardToken = searchParams.get("cardToken");
    const cycle = searchParams.get("cycle");

    let rows: any[];

    if (cardToken && cardToken !== "ALL" && cycle && cycle !== "ALL") {
      rows = await sql`
        SELECT 
          id, card_token_id AS "cardTokenId", bank_name AS "bankName",
          TO_CHAR(posting_date, 'YYYY-MM-DD') AS "date", merchant, amount::FLOAT,
          category, is_recurring AS "isRecurring", flag_type AS "flagType",
          baseline_amount::FLOAT AS "baselineAmount", statement_cycle AS "statementCycle", status
        FROM transactions
        WHERE card_token_id = ${cardToken} AND statement_cycle = ${cycle}
        ORDER BY posting_date DESC, id DESC
      `;
    } else if (cardToken && cardToken !== "ALL") {
      rows = await sql`
        SELECT 
          id, card_token_id AS "cardTokenId", bank_name AS "bankName",
          TO_CHAR(posting_date, 'YYYY-MM-DD') AS "date", merchant, amount::FLOAT,
          category, is_recurring AS "isRecurring", flag_type AS "flagType",
          baseline_amount::FLOAT AS "baselineAmount", statement_cycle AS "statementCycle", status
        FROM transactions
        WHERE card_token_id = ${cardToken}
        ORDER BY posting_date DESC, id DESC
      `;
    } else if (cycle && cycle !== "ALL") {
      rows = await sql`
        SELECT 
          id, card_token_id AS "cardTokenId", bank_name AS "bankName",
          TO_CHAR(posting_date, 'YYYY-MM-DD') AS "date", merchant, amount::FLOAT,
          category, is_recurring AS "isRecurring", flag_type AS "flagType",
          baseline_amount::FLOAT AS "baselineAmount", statement_cycle AS "statementCycle", status
        FROM transactions
        WHERE statement_cycle = ${cycle}
        ORDER BY posting_date DESC, id DESC
      `;
    } else {
      rows = await sql`
        SELECT 
          id, card_token_id AS "cardTokenId", bank_name AS "bankName",
          TO_CHAR(posting_date, 'YYYY-MM-DD') AS "date", merchant, amount::FLOAT,
          category, is_recurring AS "isRecurring", flag_type AS "flagType",
          baseline_amount::FLOAT AS "baselineAmount", statement_cycle AS "statementCycle", status
        FROM transactions
        ORDER BY posting_date DESC, id DESC
      `;
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error("[NEON TRANSACTIONS GET ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Empty payload" }, { status: 400 });
    }

    let inserted = 0;
    for (const item of items) {
      await sql`
        INSERT INTO transactions (
          card_token_id, bank_name, posting_date, merchant, amount, 
          category, is_recurring, flag_type, baseline_amount, statement_cycle, status
        ) VALUES (
          ${item.cardTokenId || null}, ${item.bankName}, ${item.date}, ${item.merchant}, 
          ${item.amount}, ${item.category || "General"}, ${item.isRecurring ?? false}, 
          ${item.flagType || "Normal"}, ${item.baselineAmount || null}, 
          ${item.statementCycle || null}, ${item.status || "Active"}
        )
      `;
      inserted++;
    }

    return NextResponse.json({ success: true, count: inserted });
  } catch (err: any) {
    console.error("[NEON TRANSACTIONS POST ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });

    await sql`DELETE FROM transactions WHERE id = ${parseInt(id, 10)}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}