import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/serverDb";

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        token, bank, card_name AS "cardName", last_four_digits AS "lastFourDigits", 
        credit_limit::FLOAT AS "creditLimit", billing_day AS "billingDay", 
        due_date_offset_days AS "dueDateOffsetDays", password_schema AS "passwordSchema"
      FROM card_profiles
      ORDER BY bank ASC
    `;
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error("[NEON CARDS GET ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const card = await req.json();
    await sql`
      INSERT INTO card_profiles (
        token, bank, card_name, last_four_digits, credit_limit, 
        billing_day, due_date_offset_days, password_schema
      ) VALUES (
        ${card.token}, ${card.bank}, ${card.cardName}, ${card.lastFourDigits}, 
        ${card.creditLimit}, ${card.billingDay}, ${card.dueDateOffsetDays || 20}, 
        ${card.passwordSchema || null}
      )
      ON CONFLICT (token) DO UPDATE SET
        card_name = EXCLUDED.card_name,
        credit_limit = EXCLUDED.credit_limit,
        billing_day = EXCLUDED.billing_day,
        password_schema = EXCLUDED.password_schema,
        updated_at = NOW()
    `;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[NEON CARDS POST ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}