-- Fix NULL values in chat_messages.read column
UPDATE chat_messages SET "read" = false WHERE "read" IS NULL;

-- Ensure the column is NOT NULL (if not already)
ALTER TABLE chat_messages ALTER COLUMN "read" SET NOT NULL;
ALTER TABLE chat_messages ALTER COLUMN "read" SET DEFAULT false;

