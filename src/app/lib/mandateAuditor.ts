export interface MandateCancellationDraft {
  subject: string;
  body: string;
  recipientEmail: string;
}

const BANK_GRIEVANCE_EMAILS: Record<string, string> = {
  HDFC: "grievance.redressalcc@hdfcbank.com",
  ICICI: "customer.care@icicibank.com",
  SBI: "customercare@sbicard.com",
  AXIS: "grievance.officer@axisbank.com",
  AMEX: "head-customerservicesindia@aexp.com",
  OTHER: "support@cardissuer.com",
};

/**
 * Generates an RBI-compliant e-mandate cancellation notice
 * Ref: RBI Circular RBI/2020-21/74 DPSS.CO.PD.No.750/02.14.003/2020-21
 */
export function generateRevocationNotice(
  merchant: string,
  bankName: string,
  amount: number,
  cardToken: string,
  transactionDate: string
): MandateCancellationDraft {
  const recipientEmail = BANK_GRIEVANCE_EMAILS[bankName] || BANK_GRIEVANCE_EMAILS.OTHER;
  const subject = `URGENT: Request for Revocation of E-Mandate / SI - ${merchant} (${bankName} Credit Card)`;
  
  const body = `To,
Nodal Grievance Redressal Officer,
${bankName} Credit Cards Division

Subject: Formal Instructions for Cancellation of Recurring E-Mandate / Standing Instruction under RBI Circular RBI/2020-21/74

Dear Sir/Madam,

I hold an active Credit Card with your institution (Account Reference / Token: ${cardToken}).

I am writing to formally revoke and terminate the recurring payment authorization / standing instruction (e-mandate) registered in favor of the following merchant:

• Merchant / Biller Name: ${merchant}
• Recurring Amount Debited: ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
• Last Identified Posting: ${transactionDate}

In accordance with the Reserve Bank of India Framework for Processing of E-Mandates for Recurring Transactions (RBI Circular DPSS.CO.PD.No.750/02.14.003/2020-21), cardholders retain an unconditional right to withdraw any standing instruction or e-mandate registered on their cards. 

Please ensure:
1. Immediate revocation of this mandate in your internal payment switch and card network router.
2. Rejection of any future recurring debit or presentment from this merchant against my card instrument.
3. Written confirmation of mandate cancellation via reply email within 48 banking hours.

Thank you.

Yours faithfully,
Cardholder`;

  return {
    subject,
    body,
    recipientEmail,
  };
}