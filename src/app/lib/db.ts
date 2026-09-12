import Dexie, { Table } from "dexie";

export interface TransactionRecord {
  id?: number;
  cardTokenId: string;
  bankName: "HDFC" | "ICICI" | "SBI" | "AXIS" | "AMEX" | "OTHER";
  date: string;
  merchant: string;
  amount: number;
  category: string;
  isRecurring: boolean;
  flagType: "Normal" | "Subscription" | "Anomaly" | "PriceHike";
  baselineAmount?: number;
  statementCycle?: string;
  status?: "Active" | "Flagged" | "Revoked";
}

export interface CardProfile {
  token: string;
  bank: "HDFC" | "ICICI" | "SBI" | "AXIS" | "AMEX";
  cardName: string;
  lastFourDigits: string;
  creditLimit: number;
  billingDay: number;
  dueDateOffsetDays: number;
  passwordSchema: string;
}

export interface StockHolding {
  id?: number;
  ticker: string;
  companyName: string;
  isin: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  sector: string;
  capType: "Large" | "Mid" | "Small" | "ETF" | "Debt";
  broker: "Zerodha" | "Groww" | "AngelOne" | "ICICI Direct" | "CDSL CAS";
  expenseRatio?: number;
}

export class FinTrackDatabase extends Dexie {
  transactions!: Table<TransactionRecord>;
  cards!: Table<CardProfile>;
  holdings!: Table<StockHolding>;

  constructor() {
    super("FinTrackDB");
    this.version(5).stores({
      transactions: "++id, cardTokenId, bankName, date, merchant, category, isRecurring, flagType, statementCycle, status",
      cards: "token, bank, lastFourDigits",
      holdings: "++id, ticker, isin, sector, capType, broker",
    });
  }
}

export const db = new FinTrackDatabase();