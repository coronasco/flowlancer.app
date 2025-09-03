-- Add task_details column to invoices table
-- This will store the exact task details at invoice creation time

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS task_details JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.invoices.task_details IS 'JSON array containing task details (id, title, hoursWorked, hourlyRate, earnings) at invoice creation time';

-- Optional: Add index for better performance when querying task details
CREATE INDEX IF NOT EXISTS idx_invoices_task_details ON public.invoices USING GIN (task_details);
