import { TransactionRecord } from "./db";

// Heuristic categories based on common Indian merchant patterns
const CATEGORY_MAP: Record<string, string> = {
  netflix: "Subscriptions",
  spotify: "Subscriptions",
  hotstar: "Subscriptions",
  prime: "Subscriptions",
  youtube: "Subscriptions",
  aws: "Cloud & Dev",
  swiggy: "Food & Dining",
  zomato: "Food & Dining",
  blinkit: "Groceries",
  zepto: "Groceries",
  instamart: "Groceries",
  uber: "Travel & Transit",
  ola: "Travel & Transit",
  makemytrip: "Travel & Transit",
  irctc: "Travel & Transit",
  amazon: "Shopping",
  flipkart: "Shopping",
  tatacliq: "Shopping",
  cred: "Financial",
  zerodha: "Investment",
  groww: "Investment",
};

const KNOWN_SUBSCRIPTION_KEYWORDS = [
  "netflix",
  "spotify",
  "hotstar",
  "prime video",
  "amazon prime",
  "youtube premium",
  "openai",
  "chatgpt",
  "claude.ai",
  "github",
  "cursor",
  "google one",
  "apple.com/bill",
  "times prime",
];

function sanitizeMerchant(raw: string): string {
  return raw
    .replace(/\b(IN|IND|MUMBAI|BANGALORE|NEW DELHI|GURGAON|HYDERABAD)\b/gi, "")
    .replace(/[0-9*#@_\-]{4,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function categorizeMerchant(merchant: string): { category: string; isRecurring: boolean } {
  const lower = merchant.toLowerCase();
  let category = "General Expenditure";
  let isRecurring = false;

  for (const [kw, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(kw)) {
      category = cat;
      break;
    }
  }

  for (const kw of KNOWN_SUBSCRIPTION_KEYWORDS) {
    if (lower.includes(kw)) {
      isRecurring = true;
      category = "Subscriptions";
      break;
    }
  }

  return { category, isRecurring };
}

/**
 * Universal Regex Engine for Indian Bank Credit Card Text Streams
 */
export function parseBankStatement(
  rawText: string,
  bankName: "HDFC" | "ICICI" | "SBI" | "AXIS" | "AMEX" | "OTHER"
): TransactionRecord[] {
  const transactions: TransactionRecord[] = [];
  const cardTokenId = `card_${bankName.toLowerCase()}_${Date.now().toString().slice(-4)}`;

  // Normalize multi-spaces and linefeeds
  const cleanStream = rawText.replace(/\r/g, "");

  // Match: DD/MM/YYYY or DD/MM/YY followed by merchant and amount
  const universalRegex = /(\d{2}[\/\-\.]\d{2}[\/\-\.](?:\d{4}|\d{2}))\s+([A-Za-z0-9\s*.\-_#&]+?)\s+(?:INR|Rs\.?|₹)?\s*([\d,]+\.\d{2})\s*(Cr|Dr)?/gi;

  let match;
  while ((match = universalRegex.exec(cleanStream)) !== null) {
    const rawDate = match[1];
    const rawMerchant = match[2];
    const rawAmount = match[3];
    const creditDebit = match[4]?.toUpperCase();

    // Skip card payment / credit rows to focus on spending
    if (creditDebit === "CR") continue;

    const amount = parseFloat(rawAmount.replace(/,/g, ""));
    const merchant = sanitizeMerchant(rawMerchant);

    if (merchant.length < 3 || isNaN(amount) || amount <= 0) continue;

    const { category, isRecurring } = categorizeMerchant(merchant);

    transactions.push({
      cardTokenId,
      bankName,
      date: rawDate,
      merchant,
      amount,
      category,
      isRecurring,
      flagType: isRecurring ? "Subscription" : "Normal",
    });
  }

  return transactions;
}
