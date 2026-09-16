/**
 * Zoo Passport — shared game client (v2)
 * แทนที่ไฟล์ zoo-api-client.js เดิม (เขียนไว้เก่า endpoint ไม่ตรงกับ backend จริงแล้ว)
 *
 * ทำไมง่ายขึ้น: เกมนี้ถูก serve จาก public/games/{zone}/ ของแอป Next.js เอง
 * (same-origin กับตอน login) เลย "ใช้ token เดียวกับที่ล็อกอินในแอปได้เลย"
 * ไม่ต้องให้แต่ละเกม login LIFF ของตัวเองซ้ำอีกรอบ
 *
 * วิธีใช้ในแต่ละเกม (ใส่ก่อน game.js เสมอ):
 *   <script>
 *     window.ZOO_API_BASE_URL = "http://localhost:3003/api/v1"; // เปลี่ยนตอน deploy จริง
 *     window.ZOO_APP_BASE_URL = "http://localhost:3000";        // เปลี่ยนตอน deploy จริง
 *   </script>
 *   <script src="../_shared/zoo-passport-client.js"></script>
 *   <script src="js/game.js"></script>
 *
 * ในโค้ดเกม ตอนเริ่มเกม:
 *   const { sessionToken } = await ZooPassport.startMiniGame();
 * ตอนเล่นจบ (ไม่ว่าจะชนะหรือหมดเวลา):
 *   const result = await ZooPassport.submitMiniGame(sessionToken, finalScore);
 *   ZooPassport.goBackToApp(result); // พากลับเข้าแอป แสดงหน้ารับตรา/ผลลัพธ์ให้เอง
 */
(function (window) {
  const TOKEN_KEY = "zoo_token"; // ต้องตรงกับ src/lib/api.ts ฝั่งแอปหลักเป๊ะๆ
  const API_BASE = window.ZOO_API_BASE_URL || "http://localhost:3003/api/v1";
  const APP_BASE = window.ZOO_APP_BASE_URL || "http://localhost:3000";

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  function getZoneId() {
    const params = new URLSearchParams(window.location.search);
    const zoneId = params.get("zoneId");
    if (!zoneId) {
      throw new Error(
        "ไม่พบ zoneId ใน URL — เกมนี้ต้องเปิดผ่านการสแกน QR ในแอปเท่านั้น (ไม่ใช่เปิด index.html ตรงๆ)"
      );
    }
    return zoneId;
  }

  async function apiFetch(path, options) {
    options = options || {};
    const token = getToken();

    if (!token) {
      // ไม่มี session เลย แปลว่ายังไม่เคยล็อกอินในแอปหลัก พาไปล็อกอินก่อน
      window.location.href = APP_BASE + "/";
      throw new Error("ยังไม่ได้ล็อกอิน กำลังพาไปหน้าล็อกอิน...");
    }

    const res = await fetch(API_BASE + path, {
      ...options,
      headers: Object.assign(
        { "Content-Type": "application/json" },
        { Authorization: "Bearer " + token },
        options.headers || {}
      ),
    });

    const body = await res.json().catch(function () {
      return {};
    });

    if (!res.ok) {
      throw new Error(body.message || "Request to " + path + " failed (" + res.status + ")");
    }
    return body.data;
  }

  async function startMiniGame() {
    const zoneId = getZoneId();
    return apiFetch("/mini-games/" + zoneId + "/start", { method: "POST" });
  }

  async function submitMiniGame(sessionToken, score) {
    const zoneId = getZoneId();
    return apiFetch("/mini-games/" + zoneId + "/submit", {
      method: "POST",
      body: JSON.stringify({ sessionToken: sessionToken, score: score }),
    });
  }

  // เล่นจบแล้วพากลับเข้าแอปหลักเสมอ — ให้แอปเป็นคนโชว์หน้ารับตรา/ผลลัพธ์
  // (สวยงามและสม่ำเสมอกว่าให้แต่ละเกมทำหน้าผลลัพธ์เอง)
  function goBackToApp(submitResult) {
    const zoneId = getZoneId();
    if (submitResult && submitResult.stampUnlocked) {
      window.location.href = APP_BASE + "/passport/" + zoneId + "/stamp";
    } else {
      window.location.href = APP_BASE + "/passport/" + zoneId;
    }
  }

  window.ZooPassport = {
    getZoneId: getZoneId,
    startMiniGame: startMiniGame,
    submitMiniGame: submitMiniGame,
    goBackToApp: goBackToApp,
  };
})(window);
