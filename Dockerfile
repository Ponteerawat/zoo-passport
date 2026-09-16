# Dockerfile — zoo-passpost API (Elysia + Bun)
# Build context ต้องเป็น "root" ของ repo (ไม่ใช่ app/api) เพราะโค้ดฝั่ง API
# import แพ็กเกจภายในจาก packages/database และ packages/supabase ที่อยู่ระดับ root
# วิธีรัน (ทดสอบในเครื่อง): docker build -t zoo-api . && docker run -p 3003:3003 --env-file .env zoo-api

FROM oven/bun:1 AS base
WORKDIR /app

# --- ติดตั้ง dependencies ก่อน แยก layer เพื่อให้ cache ได้เวลาแก้แค่โค้ด ---
FROM base AS deps
COPY package.json bun.lock ./
# ไม่ใช้ --production เพราะ packages/database ยังต้องใช้ "dotenv" (อยู่ใน devDependencies)
# ตอน runtime — ถ้าจะลดขนาด image ในอนาคต ให้ย้าย dotenv ไปไว้ที่ dependencies ก่อนแล้วค่อยเติม --production
RUN bun install --frozen-lockfile

# --- คัดลอกซอร์สที่ API ต้องใช้จริงเท่านั้น (ไม่เอา app/web ไปด้วย) ---
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY tsconfig.json ./
COPY app/api ./app/api
COPY packages ./packages
COPY prisma ./prisma

# API_PORT ตั้งผ่าน env ตอน deploy ได้ (ดูใน app/api/src/modules/index.ts)
# ค่า default ในโค้ดคือ 3003 — ปรับ EXPOSE ให้ตรงถ้าเปลี่ยนค่า
EXPOSE 3003

CMD ["bun", "run", "app/api/src/modules/index.ts"]
