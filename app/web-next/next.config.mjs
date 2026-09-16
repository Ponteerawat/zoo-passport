/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // กำหนด workspace root ให้ชัดเจน กัน Turbopack สับสนกับ bun.lock ที่ root
  // ของ monorepo (ฝั่ง app/api ใช้ bun.lock, web-next นี้ใช้ package-lock.json แยกของตัวเอง)
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
