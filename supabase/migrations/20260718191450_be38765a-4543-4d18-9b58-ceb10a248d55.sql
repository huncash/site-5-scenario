-- Fresh dev: no real user data to preserve
DELETE FROM public.transactions;
DELETE FROM public.goals;

-- Vault metadata on profiles: salt (per-user) + verifier (encrypted known string
-- to detect wrong master password without storing the key)
ALTER TABLE public.profiles 
  ADD COLUMN vault_salt text,
  ADD COLUMN vault_verifier text;

-- Transactions: encrypt {amount, category, note} into a single AES-GCM blob.
-- Keep type + occurred_at plaintext for aggregation/charting without decrypt.
ALTER TABLE public.transactions
  DROP COLUMN amount,
  DROP COLUMN category,
  DROP COLUMN note,
  ADD COLUMN data_enc text NOT NULL;

-- Goals: encrypt {name, target_amount}. Keep is_active + deadline plaintext.
ALTER TABLE public.goals
  DROP COLUMN name,
  DROP COLUMN target_amount,
  ADD COLUMN data_enc text NOT NULL;