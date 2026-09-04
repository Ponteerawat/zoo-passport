-- ============================================================
-- SEED DATA — Zoo Passport
-- Run this AFTER all 7 migrations are applied.
-- This is master/reference data (not user data) — insert once.
--
-- NOTE: game_type for Reptile Zone and exact codes for Giraffe/
-- Penguin/Elephant/Panda are my best guess based on what you've
-- built so far (game_ElephantAR, game_Panda, game_PenginAR,
-- a giraffe "neck adventure" game). Adjust game_type / config
-- to match your actual game logic before running this for real.
-- ============================================================

-- ------------------------------------------------------------
-- 1) ZONES (order matches the passport list in the screenshot)
-- ------------------------------------------------------------
INSERT INTO zones (animaltype, name_th, name_en, description_th, order_index) VALUES
    ('lion',     'โซนสิงโต',   'Lion Zone',     'สิงโตทำตราหล่นไว้ ช่วยจับคู่รอยเท้าให้ถูกต้อง!', 1),
    ('elephant', 'โซนช้าง',    'Elephant Zone', 'ช่วยป้อนอาหารให้ช้างกันเถอะ!',                 2),
    ('giraffe',  'โซนยีราฟ',   'Giraffe Zone',  'ยืดคอยีราฟไปหยิบใบไม้ให้ถึง!',                  3),
    ('penguin',  'โซนเพนกวิน', 'Penguin Zone',  'ช่วยเพนกวินจับปลาในทะเลน้ำแข็ง!',               4),
    ('reptile',  'โซนสัตว์เลื้อยคลาน', 'Reptile Zone', 'ภารกิจกับเหล่าสัตว์เลื้อยคลาน!',        5),
    ('panda',    'โซนแพนด้า',  'Panda Zone',    'พาแพนด้ากระโดดข้ามสิ่งกีดขวางไปกินไผ่!',       6);

-- ------------------------------------------------------------
-- 2) MINI_GAMES (1 game per zone)
-- ------------------------------------------------------------
INSERT INTO mini_games (zone_id, name, game_type, time_limit_seconds, pass_score, config)
SELECT
    id,
    'Lion Memory Match',
    'memory_match',
    30,
    100,
    '{"grid_rows": 3, "grid_cols": 2}'::jsonb
FROM zones WHERE animaltype = 'lion';

INSERT INTO mini_games (zone_id, name, game_type, time_limit_seconds, pass_score, config)
SELECT
    id,
    'Elephant AR Feeding',
    'ar_feeding',
    45,
    100,
    '{"food_targets": 10}'::jsonb
FROM zones WHERE animaltype = 'elephant';

INSERT INTO mini_games (zone_id, name, game_type, time_limit_seconds, pass_score, config)
SELECT
    id,
    'Giraffe Neck Adventure',
    'neck_adventure',
    40,
    100,
    '{"leaves_to_collect": 8}'::jsonb
FROM zones WHERE animaltype = 'giraffe';

INSERT INTO mini_games (zone_id, name, game_type, time_limit_seconds, pass_score, config)
SELECT
    id,
    'Penguin AR Catch',
    'ar_catching',
    30,
    100,
    '{"fish_targets": 10}'::jsonb
FROM zones WHERE animaltype = 'penguin';

INSERT INTO mini_games (zone_id, name, game_type, time_limit_seconds, pass_score, config)
SELECT
    id,
    'Reptile Challenge',
    'memory_match',
    30,
    100,
    '{"grid_rows": 4, "grid_cols": 2}'::jsonb
FROM zones WHERE animaltype = 'reptile';

INSERT INTO mini_games (zone_id, name, game_type, time_limit_seconds, pass_score, config)
SELECT
    id,
    'Panda Platformer',
    'platformer',
    60,
    100,
    '{"obstacles": 6}'::jsonb
FROM zones WHERE animaltype = 'panda';

-- ------------------------------------------------------------
-- 3) REWARDS
-- ------------------------------------------------------------
INSERT INTO rewards (animaltype, name_th, description_th, required_stamps, points_value)
VALUES
(   'master_zoo_explorer', 
    'Master Zoo Explorer',
    'คุณสะสมตราครบทุกโซนแล้ว! ยินดีด้วยกับตำแหน่ง Master Zoo Explorer', 
    6, 
    600);