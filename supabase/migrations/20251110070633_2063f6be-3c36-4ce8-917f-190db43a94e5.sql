-- Add is_deleted column to products table for soft delete
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- Update products RLS policy to exclude deleted products from public view
DROP POLICY IF EXISTS "Anyone can view available products" ON public.products;
CREATE POLICY "Anyone can view available products" 
ON public.products 
FOR SELECT 
USING (is_deleted = false);

-- Add cancellation tracking to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES auth.users(id);

-- Create views for analytics
CREATE OR REPLACE VIEW public.daily_revenue AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue
FROM public.orders
WHERE status = 'delivered'
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW public.product_sales_stats AS
SELECT 
  p.id,
  p.name,
  p.image_url,
  p.price,
  COUNT(oi.id) as total_orders,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.subtotal) as total_revenue
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'delivered' OR o.status IS NULL
GROUP BY p.id, p.name, p.image_url, p.price
ORDER BY total_revenue DESC NULLS LAST;

-- Grant select on views to authenticated users
GRANT SELECT ON public.daily_revenue TO authenticated;
GRANT SELECT ON public.product_sales_stats TO authenticated;