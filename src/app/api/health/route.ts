import { NextResponse } from "next/server";
import { sql } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          status: "FAILED_TO_CONNECT",
          error: "DATABASE_URL is missing from environment variables (.env.local).",
        },
        { status: 500 }
      );
    }

    // Ping Neon database
    const result = await sql`
      SELECT 
        current_database() AS "databaseName",
        current_user AS "currentUser",
        version() AS "postgresVersion",
        NOW() AS "serverTime"
    `;

    return NextResponse.json({
      status: "CONNECTED_TO_NEON",
      connectionDetails: result[0],
    });
  } catch (error: any) {
    console.error("[HEALTH CHECK ERROR]", error);
    return NextResponse.json(
      {
        status: "FAILED_TO_CONNECT",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}