# ZOO Explorer (Web App)

เกมสะสมตราประทับในสวนสัตว์ ผ่าน LINE LIFF — ผู้เล่นสแกน QR ประจำโซน เล่นมินิเกม
แล้วสะสมตราประทับให้ครบทุกโซนเพื่อแลกรางวัล

URLs:

- Web (dev): http://localhost:3000
- API (dev): http://localhost:3003/api/v1
- API docs: http://localhost:3003/api/v1/docs (Scalar) · /swagger

## What's Inside the Project?

Monorepo ที่รวม 3 ส่วนไว้ด้วยกัน — เว็บฝั่งผู้เล่น (Next.js), API (Elysia + Bun)
และ shared packages สำหรับคุยกับฐานข้อมูล ทั้งหมดรันด้วย **Bun** เป็นหลัก

## Project Structure

```
zoo-passpost/
├── app/
│   ├── api/                  # Elysia API (Bun runtime)
│   │   └── src/modules/      # แยกเป็น module ตาม domain
│   │       ├── auth-line/    # LINE login + ออก session token
│   │       ├── zones/        # โซนสัตว์ + เช็คอินด้วย QR
│   │       ├── mini-games/   # เริ่ม/ส่งผลมินิเกม
│   │       ├── game-histories/
│   │       ├── profiles/     # โปรไฟล์ + reset progress
│   │       ├── rewards/      # รางวัล + การรับรางวัล
│   │       ├── lib/          # auth guard, jwt, error handler
│   │       └── index.ts      # composition root + CORS + docs
│   ├── web/                  # เวอร์ชัน static เดิม (เก็บไว้อ้างอิงดีไซน์)
│   └── web-next/             # เว็บหลักที่ใช้งานจริง (Next.js 16)
│       ├── public/
│       │   ├── image/        # โลโก้, ไอคอน, พื้นหลัง
│       │   └── games/        # 6 มินิเกม (HTML/JS แยกอิสระ)
│       └── src/
│           ├── app/          # App Router — 1 โฟลเดอร์ = 1 หน้า
│           ├── components/   # UI ที่ใช้ซ้ำ
│           └── lib/          # api client, types, helpers
├── packages/
│   ├── database/             # Drizzle schema + client
│   └── supabase/             # Supabase admin client
└── prisma/schema.prisma      # ใช้ generate prismabox types
```

### Apps and Packages

- `api`: an [Elysia](https://elysiajs.com/) app — REST API prefix `/api/v1`
- `web-next`: [Next.js 16](https://nextjs.org/) (App Router + Turbopack) — เว็บที่ deploy จริง
- `web`: static HTML ชุดแรก เก็บไว้เป็น reference ไม่ได้ deploy
- `database`: [Drizzle ORM](https://orm.drizzle.team/) schema + connection pool
- `supabase`: Supabase service-role client (สร้าง auth user ตอน login ครั้งแรก)

## Tech Stack

| ส่วน | เทคโนโลยี |
| --- | --- |
| Runtime | Bun 1.3+ |
| API | Elysia + TypeBox |
| Web | Next.js 16 (App Router, Turbopack), React, Tailwind CSS |
| Database | Supabase Postgres + Drizzle ORM |
| Auth | LINE LIFF → JWT ของแอปเอง |
| มินิเกม | Vanilla JS + Canvas / Three.js / MediaPipe |

---

## Getting Started (เครื่องใหม่ตั้งแต่ศูนย์)

### 1. ติดตั้งเครื่องมือที่ต้องมีก่อน

| เครื่องมือ | เวอร์ชันที่ใช้อยู่ | หมายเหตุ |
| --- | --- | --- |
| [Bun](https://bun.sh/) | 1.3.14 | รันทั้ง API และ web |
| [Node.js](https://nodejs.org/) | 26.x | Next.js บางส่วนยังต้องใช้ |
| Git | ล่าสุด | |

ติดตั้ง Bun บน Windows (PowerShell):

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

macOS / Linux:

```bash
curl -fsSL https://bun.sh/install | bash
```

ตรวจว่าติดตั้งสำเร็จ:

```bash
bun --version
node --version
```

### 2. Clone โปรเจกต์

```bash
git clone <repo-url> zoo-passpost
cd zoo-passpost
git checkout feat/web-next
```

### 3. ติดตั้ง dependencies

โปรเจกต์นี้แยก dependency เป็น **2 ชุด** ต้องติดตั้งทั้งคู่:

```bash
# ชุดที่ 1 — root (API + packages) ใช้ bun.lock
bun install

# ชุดที่ 2 — เว็บ Next.js ใช้ package-lock.json ของตัวเอง
cd app/web-next
bun install
cd ../..
```

> **อย่าลบ `package-lock.json` ใน `app/web-next`** — เป็น lockfile จริงของฝั่งเว็บ
> ส่วน root ใช้ `bun.lock` การมี lockfile 2 ชนิดเป็นเรื่องปกติของโปรเจกต์นี้
> (`next.config.mjs` ตั้ง `turbopack.root` ไว้แล้วเพื่อไม่ให้ Turbopack สับสน)

### 4. ตั้งค่า Environment Variables

มี env **2 ไฟล์** คนละที่ คนละหน้าที่

#### 4.1 `/.env` (ฝั่ง API — คัดลอกจาก `.env.example`)

```bash
cp .env.example .env
```

| ตัวแปร | จำเป็น | คำอธิบาย |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | connection string ของ Supabase Postgres |
| `API_PORT` | – | พอร์ต API (ไม่ตั้ง = 3003) |
| `SUPABASE_URL` | ✅ | URL ของ Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service role key (ห้ามหลุดออกนอกเครื่อง) |
| `LINE_CHANNEL_ID` | ✅ | ใช้ verify ID token จาก LIFF |
| `JWT_SECRET` | ✅ | ใช้เซ็น session token ของแอปเอง |
| `CORS_ORIGINS` | prod เท่านั้น | โดเมน frontend คั่นด้วย `,` — **ไม่ตั้งแล้ว API จะไม่ยอมบูตบน production** |
| `ENABLE_API_DOCS` | – | ตั้ง `true` ถ้าอยากเปิด `/docs` บน production (default ปิด) |
| `USE_LINE_LOGIN_MOCK` | – | `true` = ข้าม LIFF ตอน dev |
| `USE_GAME_HISTORIES_MOCK` | – | `true` = ใช้ข้อมูลจำลองของ game history |

> ⚠️ **สำคัญมากเรื่อง `DATABASE_URL`**
> ต้องใช้ connection string แบบ **Pooler** (host ลงท้าย `...pooler.supabase.com`)
> ไม่ใช่ **Direct connection** เพราะ direct จะ resolve เป็น IPv6 อย่างเดียว
> ซึ่งเน็ตบ้าน/ออฟฟิศในไทยส่วนใหญ่ต่อไม่ได้ → query จะ timeout หรือ `ECONNREFUSED`
> หาได้จาก Supabase Dashboard → **Connect** → เลือกแบบ Session / Transaction pooler

#### 4.2 `/app/web-next/.env.local` (ฝั่งเว็บ)

| ตัวแปร | จำเป็น | คำอธิบาย |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | ✅ | origin ของ API เช่น `http://localhost:3003` — **prod ถ้าไม่ตั้ง build จะ fail ทันที** (ตั้งใจให้ fail เพื่อกันเว็บ deploy แล้วยิงไป localhost) |
| `NEXT_PUBLIC_LIFF_ID` | ✅ | LIFF ID จาก LINE Developers Console |
| `NEXT_PUBLIC_USE_LOGIN_MOCK` | – | `true` = โชว์ปุ่ม "ข้าม LIFF (Mock Login)" ตอน dev |

> ตัวแปรขึ้นต้น `NEXT_PUBLIC_` จะถูกฝังลง bundle ตอน build — **ห้ามใส่ความลับ**

### 5. เตรียมฐานข้อมูล

```bash
bun run db:push       # push schema ขึ้น DB (เหมาะกับตอน dev)
# หรือถ้าใช้ migration file
bun run db:generate   # สร้าง migration จาก schema
bun run db:migrate    # รัน migration
```

### 6. รันโปรเจกต์ (ต้องเปิด 2 เทอร์มินัล)

```bash
# เทอร์มินัลที่ 1 — API (root ของโปรเจกต์)
bun run dev
# → http://localhost:3003/api/v1

# เทอร์มินัลที่ 2 — เว็บ
cd app/web-next
bun run dev
# → http://localhost:3000 #deploy แล้วเปลี่ยน localhost เป็น url deploy จริงๆ
```

ตรวจว่าทุกอย่างพร้อม:

```bash
curl http://localhost:3003/api/v1/health     # ต้องได้ {"status":"ok"}
```

> ถ้า API ขึ้น `{"status":"ok"}` แต่หน้าเว็บยังโหลดข้อมูลไม่ขึ้น แปลว่า API ต่อ DB ไม่ได้
> (`/health` ไม่ได้แตะ DB) — ดูหัวข้อ Troubleshooting ด้านล่าง

---

## Scripts

รันจาก **root**:

| คำสั่ง | ทำอะไร |
| --- | --- |
| `bun run dev` | รัน API แบบ watch |
| `bun run db:push` | push schema ขึ้น DB ตรงๆ |
| `bun run db:generate` | สร้างไฟล์ migration จาก schema |
| `bun run db:migrate` | รัน migration |
| `bun run db:pull` | ดึง schema จาก DB กลับมาเป็นโค้ด |

รันจาก **`app/web-next`**:

| คำสั่ง | ทำอะไร |
| --- | --- |
| `bun run dev` | dev server (Turbopack) |
| `bun run build` | build production |
| `bun run start` | รันไฟล์ที่ build แล้ว |
| `bun run lint` | ตรวจ lint |

---

## หน้าเว็บทั้งหมด

| Route | หน้า |
| --- | --- |
| `/` | Login ด้วย LINE |
| `/welcome` | หน้าต้อนรับหลัง login |
| `/passport` | หน้าหลัก — ความคืบหน้า + รายชื่อโซน |
| `/passport/[zoneId]` | รายละเอียดโซน |
| `/passport/[zoneId]/stamp` | หน้าแสดงตราที่เพิ่งได้ |
| `/scan` | สแกน QR เช็คอินโซน |
| `/map` | แผนที่สวนสัตว์ |
| `/collection` | ตราที่สะสมแล้ว |
| `/rewards` | รางวัล |
| `/history` | ประวัติการเล่น |
| `/profile` | โปรไฟล์ |
| `/settings` | ตั้งค่า |
| `/how-to-play` | วิธีเล่น |

---

## มินิเกม

เกมทั้ง 6 เป็น **HTML/JS แยกอิสระ** วางไว้ใน `app/web-next/public/games/<zone>/`
ไม่ได้ผ่าน React — เปิดตรงๆ ที่ `/games/<zone>/index.html` แล้วคุยกับ API ผ่าน
`public/games/_shared/zoo-passport-client.js`

| โซน | โฟลเดอร์ | ลักษณะเกม |
| --- | --- | --- |
| สิงโต | `lion/` | จับคู่รอยเท้า (Three.js) |
| ช้าง | `elephant/` | Canvas 2D |
| ยีราฟ | `giraffe/` | ยืดคอเก็บใบไม้ (Three.js + glTF) |
| ลิง | `monkey/` | รับกล้วยด้วยการขยับหน้า (MediaPipe FaceMesh) |
| แพนด้า | `panda/` | เดินเก็บไผ่ (Canvas 2D) |
| เพนกวิน | `penguin/` | จับปลาด้วยท่าหยิบมือ (MediaPipe Hands) |

เวลาแก้เกม แก้ในโฟลเดอร์ของเกมนั้นได้เลย ไม่กระทบเว็บหลัก

---

## Build & Deploy

### ก่อน deploy ต้องมี

- [ ] `DATABASE_URL` ใช้ **pooler** ไม่ใช่ direct connection
- [ ] `CORS_ORIGINS` = โดเมนจริงของเว็บ (ไม่ตั้ง API จะไม่ยอมบูต)
- [ ] `NEXT_PUBLIC_API_URL` = โดเมนจริงของ API **ตั้งก่อน build**
- [ ] `NEXT_PUBLIC_LIFF_ID` ตรงกับ LIFF app ที่ตั้ง endpoint เป็นโดเมน production
- [ ] `NODE_ENV=production`

### ขั้นตอน

```bash
# เว็บ
cd app/web-next
bun run build
bun run start

# API
NODE_ENV=production bun run app/api/src/modules/index.ts
```

### หมายเหตุ production

- `/docs` และ `/swagger` **ปิดอัตโนมัติ** บน production เว้นแต่ตั้ง `ENABLE_API_DOCS=true`
- CORS บน production รับเฉพาะโดเมนใน `CORS_ORIGINS` (dev รับทุก origin)
- API client ฝั่งเว็บมี timeout 15 วินาที — ถ้า API ไม่ตอบจะขึ้นข้อความแทนที่จะค้างหมุน

---

## Troubleshooting

### หน้าเว็บขึ้น "โหลดข้อมูลไม่สำเร็จ" ทั้งที่ API ตอบ `{"status":"ok"}`

`/health` ไม่ได้แตะ DB เลย ดังนั้น 200 ไม่ได้แปลว่า DB ใช้ได้ ทดสอบ DB ตรงๆ:

```bash
bun -e "import {db} from '@repo/database'; import {sql} from 'drizzle-orm'; await db.execute(sql\`select 1\`); console.log('DB OK'); process.exit(0)"
```

ถ้าได้ `ECONNREFUSED <IPv6>:5432` → `DATABASE_URL` ยังเป็น direct connection
เปลี่ยนเป็น pooler ตามหัวข้อ 4.1

### เว็บที่ deploy แล้วโหลดข้อมูลไม่ขึ้น (แต่ localhost ปกติ)

เกือบทุกครั้งคือลืมตั้ง `NEXT_PUBLIC_API_URL` **ตอน build** เว็บเลยยิงไป
`localhost:3003` ของเครื่องผู้ใช้ ตั้ง env แล้ว **build ใหม่** (ตั้งทีหลังไม่มีผล
เพราะค่าถูกฝังลง bundle ตั้งแต่ตอน build)

### `bun run dev` ขึ้น `error: script "dev" exited with code 1`

มี dev server ค้างอยู่แล้ว ข้อความจะบอก PID มาให้:

```powershell
taskkill /PID <pid> /F
```

หรือเปิด `http://localhost:3000` ใช้ตัวเดิมได้เลย ไม่ต้องรันซ้ำ

### API ไม่ยอมบูตบน production

```
CORS_ORIGINS is required in production
```

ตั้งใจให้ fail — ใส่โดเมน frontend ลง `CORS_ORIGINS` (คั่นด้วย `,`) แล้วบูตใหม่

### PowerShell ลบโฟลเดอร์ `[zoneId]` ไม่ได้

วงเล็บเหลี่ยมเป็น **wildcard** ใน PowerShell ทั้ง `Remove-Item` และ `Test-Path`
จะไม่ match โฟลเดอร์จริง (แถม `Test-Path` คืน `False` หลอกด้วย) ต้องใช้ `-LiteralPath`:

```powershell
Remove-Item -LiteralPath "src\app\passport\[zoneId]\play" -Recurse -Force
```

### รูปภาพทำให้เว็บโหลดช้า

รูปที่ใช้ผ่าน CSS (`bg-[url(...)]`) **ไม่ผ่าน Next.js Image optimization**
ต้องบีบอัดเอง โปรเจกต์มี `sharp` ติดมากับ Next.js อยู่แล้ว:

```bash
cd app/web-next
node -e "require('sharp')('public/image/in.png').resize({width:960}).jpeg({quality:82,mozjpeg:true}).toFile('public/image/out.jpg')"
```
