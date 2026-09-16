-- ============================================================
-- Migration: set_predictable_qr_secrets
-- ปัญหาเดิม: 20260906152605_add_qr_secret_to_zones.sql backfill
-- qr_secret เป็น gen_random_uuid() แบบสุ่มล้วนๆ ที่ไม่มีใครรู้ค่า
-- ทำให้สร้าง QR code จริงมาแมตช์ไม่ได้เลย (ทุกครั้งจะเป็น "Invalid QR code")
--
-- แก้โดยตั้ง qr_secret = animaltype ตรงๆ (lion, elephant, giraffe, ...)
-- ค่านี้ตรงกับที่ frontend ใช้อยู่แล้วทุกจุด (zone-icons.ts เป็นต้น)
-- ทำให้สร้าง QR code ทดสอบง่าย แค่เข้ารหัสข้อความ "lion" เปล่าๆ
-- ============================================================

update zones set qr_secret = animaltype;
