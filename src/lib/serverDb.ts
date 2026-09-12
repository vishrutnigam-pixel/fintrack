import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// It pulls directly from .env.local via process.env.DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_YkmRL0C9Bbvx@ep-rough-glitter-b3g5hx6t-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const sql: NeonQueryFunction<false, false> = neon(databaseUrl);