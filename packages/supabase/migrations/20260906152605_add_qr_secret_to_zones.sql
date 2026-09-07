alter table zones add column if not exists qr_secret text;

-- backfill: ให้ zone เก่าที่มีอยู่แล้วมี secret ใช้งานได้ทันที
update zones set qr_secret = gen_random_uuid()::text where qr_secret is null;

alter table zones alter column qr_secret set not null;

create unique index if not exists uq_zones_qr_secret on zones(qr_secret);