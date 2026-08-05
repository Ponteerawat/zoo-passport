/*
  ZooState — ที่เก็บสถานะกลางของแอป (localStorage) ให้ทุกหน้าอ่าน/เขียนชุดเดียวกัน
  - stamps: ตราประทับที่ "ปลดล็อกแล้วจริงๆ" เท่านั้น (true ก็ต่อเมื่อเล่นเกมของโซนนั้นจบ)
  - points: แต้มสะสม เพิ่มขึ้นก็ต่อเมื่อเล่นเกมจบเท่านั้น (ไม่ใช่ค่าคงที่ที่ตั้งไว้ล่วงหน้า)
  - avatar: รูปโปรไฟล์ที่ผู้ใช้เลือกเอง (data URL) เก็บไว้ใช้ทุกหน้า
*/
(function (global) {
  const KEY = 'zooExplorerState';
  const ZONES = ['lion', 'elephant', 'giraffe', 'penguin', 'panda', 'monkey'];

  function defaultState() {
    const stamps = {};
    ZONES.forEach(z => { stamps[z] = false; });
    return { stamps, points: 0, avatar: null, history: [] };
  }

  function getState() {
    const base = defaultState();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      return {
        stamps: Object.assign(base.stamps, parsed.stamps || {}),
        points: typeof parsed.points === 'number' ? parsed.points : 0,
       avatar: parsed.avatar || null,
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    } catch (e) {
      return base;
    }
  }

  function saveState(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function getStampCount(state) {
    state = state || getState();
    return ZONES.filter(z => state.stamps[z]).length;
  }

  // เรียกตอนผู้เล่น "เล่นเกมของโซนนั้นจบและชนะ" เท่านั้น
  // -> ปลดล็อกตราประทับ (unlock ใน My Collection) + เพิ่มแต้ม
  // กันเพิ่มแต้ม/ปลดล็อกซ้ำ ถ้าโซนนั้นปลดล็อกไปแล้ว (เช่นโหลดหน้าซ้ำ)
  function completeZone(zoneId, pointsEarned) {
    const state = getState();
    const alreadyDone = !!state.stamps[zoneId];
    if (!alreadyDone && ZONES.indexOf(zoneId) !== -1) {
      state.stamps[zoneId] = true;
      state.points += (pointsEarned || 0);
      state.history.unshift({ zoneId, timestamp: Date.now(), pointsEarned: pointsEarned || 0 });
      saveState(state);
    }
    return { state, alreadyDone };
  }

  function setAvatar(dataUrl) {
    const state = getState();
    state.avatar = dataUrl;
    saveState(state);
    return state;
  }

 function getHistory() {
    const state = getState();
    return state.history || [];
  }

  global.ZooState = { ZONES, getState, saveState, getStampCount, completeZone, setAvatar, getHistory };
})(window);
