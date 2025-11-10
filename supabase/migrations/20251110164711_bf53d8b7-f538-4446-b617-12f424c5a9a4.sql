-- Create table for OTP verifications
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL, -- 'signup' or 'reset_password'
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for requesting OTP)
CREATE POLICY "Anyone can request OTP"
ON public.otp_verifications
FOR INSERT
WITH CHECK (true);

-- Create policy to allow users to verify their own OTP
CREATE POLICY "Anyone can verify OTP"
ON public.otp_verifications
FOR SELECT
USING (true);

-- Create policy to allow update for verification
CREATE POLICY "Anyone can update OTP verification status"
ON public.otp_verifications
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_otp_email_purpose ON public.otp_verifications(email, purpose, expires_at);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.otp_verifications
  WHERE expires_at < now() OR (verified = true AND created_at < now() - INTERVAL '1 hour');
END;
$$;