-- Recreate views with explicit SECURITY INVOKER to ensure they use querying user's permissions
DROP VIEW IF EXISTS public.daily_revenue;
CREATE OR REPLACE VIEW public.daily_revenue 
WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue
FROM public.orders
WHERE status = 'delivered'
GROUP BY DATE(created_at)
ORDER BY date DESC;

DROP VIEW IF EXISTS public.product_sales_stats;
CREATE OR REPLACE VIEW public.product_sales_stats 
WITH (security_invoker = true) AS
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