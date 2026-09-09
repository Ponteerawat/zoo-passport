/*
  ZooAPI — ตัวกลางเรียก backend (ZOO Passport API) จากฝั่งหน้าเว็บ
  - เก็บ JWT accessToken ไว้ใน localStorage แยก key จาก ZooState
  - ทุกฟังก์ชันคืนค่าเป็น Promise ที่ resolve เป็น `data` ของ response
    (ถ้า success:false หรือ HTTP error จะ throw Error พร้อมข้อความจาก backend)
  - ปรับ BASE_URL ด้านล่างให้ตรงกับ backend จริงตอน deploy
*/
(function (global) {
  const BASE_URL = 'http://localhost:3003/api/v1';
  const TOKEN_KEY = 'zooAccessToken';

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }

  function setToken(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch (e) { /* ignore */ }
  }

  function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
  }

  /**
   * ยิง request ไป backend หนึ่งครั้ง
   * @param {string} path - เช่น '/zones', '/mini-games/xxx/start'
   * @param {object} [options]
   * @param {string} [options.method='GET']
   * @param {object} [options.body] - จะถูก JSON.stringify ให้อัตโนมัติ
   * @param {boolean} [options.auth=false] - true = แนบ Authorization header
   */
  async function request(path, options = {}) {
    const { method = 'GET', body, auth = false } = options;

    const headers = { 'Content-Type': 'application/json' };

    if (auth) {
      const token = getToken();
      if (!token) throw new Error('ยังไม่ได้ login — กรุณา login ก่อนใช้งานส่วนนี้');
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      throw new Error('เชื่อมต่อ server ไม่ได้ ตรวจสอบอินเทอร์เน็ต/สถานะ backend');
    }

    let json;
    try {
      json = await response.json();
    } catch (parseErr) {
      throw new Error(`Server ตอบกลับไม่ถูกต้อง (HTTP ${response.status})`);
    }

    if (!response.ok || json.success === false) {
      throw new Error(json.message || json.error || `เกิดข้อผิดพลาด (HTTP ${response.status})`);
    }

    return json.data;
  }

  // ---------------------------------------------------------------
  // AUTH — POST /auth/line-login
  // ---------------------------------------------------------------

  /**
   * แลก LINE idToken เป็น accessToken ของแอป แล้วเก็บ token ให้อัตโนมัติ
   * @param {string} idToken - จาก liff.getIDToken()
   * @returns {Promise<{accessToken:string, profile:object}>}
   */
  async function login(idToken) {
    const data = await request('/auth/line-login', {
      method: 'POST',
      body: { idToken },
    });
    setToken(data.accessToken);
    return data;
  }

  function logout() {
    clearToken();
  }

  function isLoggedIn() {
    return Boolean(getToken());
  }

  // ---------------------------------------------------------------
  // PROFILE — GET /profile
  // ---------------------------------------------------------------

  function getProfile() {
    return request('/profile', { auth: true });
  }

  // ---------------------------------------------------------------
  // ZONES — GET /zones, POST /zones/check-in
  // ---------------------------------------------------------------

  function getZones() {
    return request('/zones', { auth: true });
  }

  /**
   * @param {string} qrSecret - ค่าที่อ่านได้จากการสแกน QR หน้ากรง
   */
  function checkInZone(qrSecret) {
    return request('/zones/check-in', {
      method: 'POST',
      auth: true,
      body: { qrSecret },
    });
  }

  // ---------------------------------------------------------------
  // MINI-GAMES — POST /mini-games/:zoneId/start, /submit
  // ---------------------------------------------------------------

  function startMiniGame(zoneId) {
    return request(`/mini-games/${zoneId}/start`, {
      method: 'POST',
      auth: true,
    });
  }

  /**
   * @param {string} zoneId
   * @param {string} sessionToken - ได้จาก startMiniGame()
   * @param {number} score
   */
  function submitMiniGame(zoneId, sessionToken, score) {
    return request(`/mini-games/${zoneId}/submit`, {
      method: 'POST',
      auth: true,
      body: { sessionToken, score },
    });
  }

  // ---------------------------------------------------------------
  // REWARDS — GET /rewards, POST /rewards/:id/claim
  // ---------------------------------------------------------------

  function getRewards() {
    return request('/rewards', { auth: true });
  }

  function claimReward(rewardId) {
    return request(`/rewards/${rewardId}/claim`, {
      method: 'POST',
      auth: true,
    });
  }

  // ---------------------------------------------------------------
  // GAME HISTORY — GET /game-history
  // ---------------------------------------------------------------

  /**
   * @param {object} [query] - { page, limit, gameType, startDate, endDate }
   */
  function getGameHistory(query = {}) {
    const params = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString();
    const path = params ? `/game-history?${params}` : '/game-history';
    return request(path, { auth: true });
  }

  // ---------------------------------------------------------------
  // EXPORT
  // ---------------------------------------------------------------

  global.ZooAPI = {
    // auth
    login,
    logout,
    isLoggedIn,
    // profile
    getProfile,
    // zones
    getZones,
    checkInZone,
    // mini-games
    startMiniGame,
    submitMiniGame,
    // rewards
    getRewards,
    claimReward,
    // history
    getGameHistory,
  };
})(window);
