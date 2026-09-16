-- ============================================================
-- Migration: add_story_and_mission_to_zones
-- หน้า Zone Info ออกแบบใหม่เป็น 3 การ์ด: เรื่องราว / ภารกิจ / รางวัล
-- description_th เดิมสั้นเกินไปสำหรับการ์ด "เรื่องราว" เต็มรูปแบบ
-- เพิ่ม story_title_th (หัวข้อการ์ดเรื่องราว) และ mission_th (เนื้อหาการ์ดภารกิจ)
-- description_th เดิมจะถูกใช้เป็น "เนื้อหา" ของการ์ดเรื่องราวต่อไป
-- ============================================================

alter table zones add column story_title_th text;
alter table zones add column mission_th text;
