-- Prices moved from placeholder dollars to naira. Re-price bookings made before
-- the switch (any price under ₦1,000 was a dollar amount).
UPDATE "bookings" SET "price" = CASE "service_id"
  WHEN 's1' THEN 15000
  WHEN 's6' THEN 25000
  WHEN 's3' THEN 12000
  WHEN 's5' THEN 35000
  WHEN 's2' THEN 25000
  WHEN 's9' THEN 30000
  WHEN 's4' THEN 15000
  WHEN 's7' THEN 30000
  WHEN 's8' THEN 18000
  ELSE "price"
END
WHERE "price" < 1000;
