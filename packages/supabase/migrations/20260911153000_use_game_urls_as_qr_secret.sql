-- ============================================================
-- Migration: use_game_urls_as_qr_secret
-- แก้ต่อจาก 20260911150000 — พบว่า QR code จริงที่ deploy ใช้งานอยู่
-- เข้ารหัสเป็น "ลิงก์เกมที่ deploy แล้ว" (เช่น https://game-panda.vercel.app/)
-- ไม่ใช่แค่ animaltype เฉยๆ — เลยต้องตั้ง qr_secret ให้ตรงกับ URL จริงเป๊ะๆ
--
-- ที่มาของ URL: app/web/11-qr-scan/index.html (ZONE_GAME_URL map เดิม)
-- โซนที่ยังไม่มีเกม deploy จริง (เช่น penguin) คงค่าเดิมไว้ก่อน (animaltype)
-- ============================================================

update zones set qr_secret = 'https://game-lion.vercel.app/' where animaltype = 'lion';
update zones set qr_secret = 'https://game-elephant-ar.vercel.app/' where animaltype = 'elephant';
update zones set qr_secret = 'https://game-giraffe.vercel.app/' where animaltype = 'giraffe';
update zones set qr_secret = 'https://game-panda.vercel.app/' where animaltype = 'panda';
update zones set qr_secret = 'https://game-mokey-ar-cfit.vercel.app/' where animaltype = 'monkey';
-- penguin: ยังไม่มีลิงก์เกม deploy จริง คง qr_secret เดิม (animaltype) ไว้ก่อน
