-- ============================================================
-- Migration: udate_zone (เติม qr_secret ให้ penguin ที่ยังว่างอยู่)
-- ============================================================

update zones set qr_secret = 'PENGUIN-ZOO-001' where animaltype = 'penguin';
