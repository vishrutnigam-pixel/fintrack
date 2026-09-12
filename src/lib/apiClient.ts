import { db, TransactionRecord, StockHolding, CardProfile } from "./db";

// Reads flag from .env.local; defaults to true if set
const USE_REMOTE_DB =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_USE_REMOTE_DB === "true"
    : true;

export const apiClient = {
  // ==========================
  // TRANSACTIONS
  // ==========================
  async getTransactions(cardToken?: string, cycle?: string): Promise<TransactionRecord[]> {
    if (USE_REMOTE_DB) {
      try {
        const params = new URLSearchParams();
        if (cardToken && cardToken !== "ALL") params.append("cardToken", cardToken);
        if (cycle && cycle !== "ALL") params.append("cycle", cycle);

        const res = await fetch(`/api/transactions?${params.toString()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Sync local Dexie cache in the background
          if (db.transactions) {
            await db.transactions.clear();
            await db.transactions.bulkAdd(json.data);
          }
          return json.data;
        }
      } catch (err) {
        console.warn("[API CLIENT] Remote fetch failed, falling back to local storage:", err);
      }
    }

    if (db.transactions) {
      return db.transactions.toArray();
    }
    return [];
  },

  async addTransactions(items: TransactionRecord[]): Promise<void> {
    if (USE_REMOTE_DB) {
      try {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items),
        });
      } catch (err) {
        console.warn("[API CLIENT] Remote save failed:", err);
      }
    }

    if (db.transactions) {
      await db.transactions.bulkAdd(items);
    }
  },

  async deleteTransaction(id: number): Promise<void> {
    if (USE_REMOTE_DB) {
      try {
        await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("[API CLIENT] Remote delete failed:", err);
      }
    }

    if (db.transactions) {
      await db.transactions.delete(id);
    }
  },

  // ==========================
  // STOCK & ASSET HOLDINGS
  // ==========================
  async getHoldings(): Promise<StockHolding[]> {
    if (USE_REMOTE_DB) {
      try {
        const res = await fetch("/api/holdings");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (db.holdings) {
            await db.holdings.clear();
            await db.holdings.bulkAdd(json.data);
          }
          return json.data;
        }
      } catch (err) {
        console.warn("[API CLIENT] Remote fetch failed for holdings:", err);
      }
    }

    if (db.holdings) {
      return db.holdings.toArray();
    }
    return [];
  },

  async addHoldings(items: StockHolding[]): Promise<void> {
    if (USE_REMOTE_DB) {
      try {
        await fetch("/api/holdings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items),
        });
      } catch (err) {
        console.warn("[API CLIENT] Remote holdings save failed:", err);
      }
    }

    if (db.holdings) {
      await db.holdings.bulkAdd(items);
    }
  },

  async deleteHolding(id: number): Promise<void> {
    if (USE_REMOTE_DB) {
      try {
        await fetch(`/api/holdings?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("[API CLIENT] Remote holding delete failed:", err);
      }
    }

    if (db.holdings) {
      await db.holdings.delete(id);
    }
  },

  // ==========================
  // LIVE MARKET QUOTE SYNC
  // ==========================
  async syncLiveMarketPrices(): Promise<{ updatedCount: number; quotes: any[] }> {
    const res = await fetch("/api/quotes", { method: "POST" });
    const json = await res.json();
    if (json.success) {
      // Synchronize local Dexie cache with updated prices
      if (db.holdings && Array.isArray(json.quotes)) {
        for (const q of json.quotes) {
          const matching = await db.holdings.where("ticker").equals(q.ticker).toArray();
          for (const item of matching) {
            if (item.id) {
              await db.holdings.update(item.id, { currentPrice: q.price });
            }
          }
        }
      }
      return json;
    }
    throw new Error(json.error || "Price synchronization failed");
  },

  // ==========================
  // CARDS & INSTRUMENTS
  // ==========================
  async getCards(): Promise<CardProfile[]> {
    if (USE_REMOTE_DB) {
      try {
        const res = await fetch("/api/cards");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (db.cards) {
            await db.cards.clear();
            await db.cards.bulkAdd(json.data);
          }
          return json.data;
        }
      } catch (err) {
        console.warn("[API CLIENT] Remote cards fetch failed:", err);
      }
    }

    if (db.cards) {
      return db.cards.toArray();
    }
    return [];
  },

  async saveCard(card: CardProfile): Promise<void> {
    if (USE_REMOTE_DB) {
      try {
        await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        });
      } catch (err) {
        console.warn("[API CLIENT] Remote card save failed:", err);
      }
    }

    if (db.cards) {
      await db.cards.put(card);
    }
  },
};