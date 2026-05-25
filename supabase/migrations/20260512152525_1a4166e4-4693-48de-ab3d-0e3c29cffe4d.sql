DELETE FROM order_items WHERE product_id IN (SELECT id FROM products WHERE price = 0);
DELETE FROM products WHERE price = 0;