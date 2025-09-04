-- Contact Messages Table Schema for Supabase
-- Run this in Supabase SQL Editor

-- Create contact_messages table
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  admin_notes TEXT
);

-- Create index for better query performance
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for contact form submissions)
CREATE POLICY "Allow public contact form submissions" ON contact_messages
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated admin users to view all messages
CREATE POLICY "Allow admin users to view all contact messages" ON contact_messages
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.uid = auth.uid() 
    AND customers.admin = true
  )
);

-- Create policy to allow authenticated admin users to update messages
CREATE POLICY "Allow admin users to update contact messages" ON contact_messages
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.uid = auth.uid() 
    AND customers.admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.uid = auth.uid() 
    AND customers.admin = true
  )
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contact_messages_updated_at 
BEFORE UPDATE ON contact_messages 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - remove if not needed)
INSERT INTO contact_messages (first_name, last_name, email, subject, message) VALUES
('John', 'Doe', 'john.doe@example.com', 'general', 'Hello, I would like to know more about your pricing plans.'),
('Jane', 'Smith', 'jane.smith@example.com', 'support', 'I am having trouble accessing my dashboard. Can you help?'),
('Mike', 'Johnson', 'mike.johnson@example.com', 'feature', 'It would be great to have a mobile app for time tracking.');
