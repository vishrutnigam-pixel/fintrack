export interface AIAuditResult {
  executiveSummary: string;
  identifiedLeaks: {
    merchant: string;
    monthlyLeak: number;
    annualWaste: number;
    recommendedAction: string;
  }[];
  optimizationTips: string[];
}

export interface AINormalizedTransaction {
  merchant: string;
  category: string;
  isRecurring: boolean;
  notes: string;
}

/**
 * Runs a forensic audit on multi-card transactions via Gemini Flash.
 * Client-Side BYOK model ensures zero intermediary telemetry.
 */
export async function runGeminiFinancialAudit(
  apiKey: string,
  transactions: any[]
): Promise<AIAuditResult> {
  const prompt = `
You are an institutional credit card forensic auditor inspecting personal multi-card statements across Indian banks (HDFC, ICICI, SBI, Axis, Amex).
Analyze this structured ledger dataset:
${JSON.stringify(transactions, null, 2)}

Enforce and return a STRICT JSON object matching this structure:
{
  "executiveSummary": "2-3 crisp sentences diagnosing overall financial health, subscription leaks, or lifestyle creep.",
  "identifiedLeaks": [
    {
      "merchant": "Merchant Name",
      "monthlyLeak": 0.0,
      "annualWaste": 0.0,
      "recommendedAction": "Actionable recommendation such as revoking e-mandate or switching tiers"
    }
  ],
  "optimizationTips": [
    "Tip 1 regarding RBI e-mandate revocation or card reward optimization",
    "Tip 2",
    "Tip 3"
  ]
}
Return VALID JSON ONLY. Do not wrap in markdown or backticks.
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    throw new Error(errData?.error?.message || `AI Gateway Error: ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const sanitized = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(sanitized);
}

/**
 * Generates an assertive, legally binding RBI grievance tailored to specific dispute circumstances.
 */
export async function generateAIEnhancedRevocation(
  apiKey: string,
  merchant: string,
  bankName: string,
  amount: number,
  cardToken: string,
  disputeReason: string
): Promise<string> {
  const prompt = `
Generate a formal, legally assertive Grievance & Mandate Cancellation Notice under RBI Circular RBI/2020-21/74 DPSS.CO.PD.No.750/02.14.003/2020-21.
Details:
- Issuing Bank: ${bankName}
- Card Identifier: ${cardToken}
- Merchant / Biller: ${merchant}
- Unauthorized / Surging Amount: INR ${amount}
- Specific Dispute Context: ${disputeReason}

Cite statutory RBI mandates requiring the bank to unconditionally terminate this standing instruction within 48 banking hours. Return the email body text only.
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to tailor AI revocation notice.");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}