-- Add per-coupon point thresholds.
ALTER TABLE rewards
ADD COLUMN IF NOT EXISTS unlock_points INTEGER NOT NULL DEFAULT 0;

-- Existing Master Zoo Explorer coupon remains unlocked at 600 points.
UPDATE rewards
SET unlock_points = 600
WHERE animaltype = 'master_zoo_explorer';

-- Code Passion photo coupon unlocks at 3,000 points.
INSERT INTO rewards (
  animaltype,
  name_th,
  description_th,
  required_stamps,
  points_value,
  unlock_points
)
VALUES (
  'code_passion_photo',
  'ถ่ายรูปกับ Code Passion',
  'คูปองพิเศษสำหรับผู้ที่สะสมคะแนนครบ 3,000 คะแนน',
  0,
  0,
  3000
)
ON CONFLICT (animaltype) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  description_th = EXCLUDED.description_th,
  unlock_points = EXCLUDED.unlock_points;
