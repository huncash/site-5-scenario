import { z } from "zod";

export const TxnTypeSchema = z.enum(["income", "expense", "saving"]);
export type TxnType = z.infer<typeof TxnTypeSchema>;

export const TxnHistoryEntrySchema = z.object({
  at: z.string(),
  from: TxnTypeSchema,
  to: TxnTypeSchema,
});
export type TxnHistoryEntry = z.infer<typeof TxnHistoryEntrySchema>;

export const TransactionSchema = z.object({
  id: z.string().min(1),
  type: TxnTypeSchema,
  occurred_at: z.string().min(1),
  amount: z.number(),
  category: z.string().min(1),
  note: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  party: z.string().nullable().optional(),
  history: z.array(TxnHistoryEntrySchema).optional(),
  bucket_id: z.string().nullable().optional(),
  vat_rate: z.number().nullable().optional(),
  property_id: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(),
  invoice_status: z.enum(["unpaid", "pending", "paid"]).nullable().optional(),
  due_date: z.string().nullable().optional(),
  workspace: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

