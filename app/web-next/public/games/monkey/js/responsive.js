// ==========================================
// โหมดเต็มจอ & การจัดการ Responsive เพิ่มเติม
// ==========================================
// โมดูลนี้แยกจาก game.js โดยเจตนา: ทำหน้าที่เดียวคือควบคุมโหมดเต็มจอ
// และคอยยิง event 'resize' เมื่อ viewport เปลี่ยน (เช่น หมุนจอ, แถบ URL
// ของเบราว์เซอร์มือถือยุบ/ขยาย) เพื่อให้ game.js ปรับขนาด canvas ตาม
// resizeCanvas() ที่ผูกกับ window 'resize' อยู่แล้วโดยไม่ต้องแก้โค้ดเกม

(function () {
  const container = document.getElementById('game-container');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  if (!container) return;

  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement ||
      null
    );
  }

  function requestFullscreen(el) {
    const fn =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    if (fn) return fn.call(el);
    return Promise.reject(new Error('Fullscreen API not supported'));
  }

  function exitFullscreen() {
    const fn =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;
    if (fn) return fn.call(document);
    return Promise.reject(new Error('Fullscreen API not supported'));
  }

  function toggleFullscreen() {
    if (!getFullscreenElement()) {
      requestFullscreen(container).catch(() => {
        // บางเบราว์เซอร์ (เช่น iOS Safari) ไม่รองรับ Fullscreen API เต็มรูปแบบ
        // ในกรณีนี้ยังใช้โหมด "จำลองเต็มจอ" ผ่าน CSS class แทนได้
        container.classList.toggle('fullscreen-mode');
        window.dispatchEvent(new Event('resize'));
      });
    } else {
      exitFullscreen().catch(() => {});
    }
  }

  function onFullscreenChange() {
    const isFs = !!getFullscreenElement();
    container.classList.toggle('fullscreen-mode', isFs);
    if (btnFullscreen) {
      btnFullscreen.textContent = isFs ? '⤢' : '⛶';
      btnFullscreen.title = isFs ? 'ออกจากเต็มจอ' : 'เต็มจอ';
    }
    // ให้เวลาเบราว์เซอร์ปรับ layout ก่อนคำนวณขนาด canvas ใหม่
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleFullscreen);
  }

  ['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'].forEach((evt) =>
    document.addEventListener(evt, onFullscreenChange)
  );

  // มือถือหลายรุ่น: แถบ URL ย่อ/ขยายไม่ยิง 'resize' เสมอไป ใช้ visualViewport ช่วย
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  // การหมุนจอบนมือถือ/แท็บเล็ต — หน่วงเล็กน้อยให้ viewport อัปเดตค่าก่อน
  window.addEventListener('orientationchange', () => {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  });
})();
