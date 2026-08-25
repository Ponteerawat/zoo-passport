/**
 * Zoo Passport API client — drop this file into every game folder
 * (e.g. game_ElephantAR_updated/js/zoo-api-client.js) and include it
 * BEFORE game.js in index.html:
 *
 *   <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
 *   <script src="js/zoo-api-client.js"></script>
 *   <script src="js/game.js"></script>
 *
 * Also set window.ZOO_API_BASE_URL and window.ZOO_LIFF_ID near the top of
 * index.html (or hardcode them below) before this script runs.
 *
 * Usage from a game's win handler, e.g. triggerWin() in game.js:
 *
 *   const session = await ZooAPI.startSession(GAME_NUMBER);
 *   // ... play the game using session.session.id ...
 *   const result = await ZooAPI.completeSession(session.session.id, finalScore);
 *   if (result.stampAwarded) showNewStampToast(result.stampAwarded);
 */
(function (window) {
  const API_BASE = window.ZOO_API_BASE_URL || 'https://api.your-zoo-domain.com/api';
  const TOKEN_KEY = 'zoo_passport_token';
  const PROFILE_KEY = 'zoo_passport_profile';

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveSession(token, profile) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      /* LINE in-app webviews sometimes block storage; fail silently,
         the caller just re-logs-in next time. */
    }
  }

  async function apiFetch(path, options = {}) {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request to ${path} failed (${res.status})`);
    }
    return res.json();
  }

  /**
   * Initializes LIFF and logs into the Zoo Passport backend.
   * Call this once on page load, before the player starts playing.
   */
  async function initAndLogin() {
    if (!window.liff) throw new Error('LIFF SDK not loaded — include liff/edge/2/sdk.js first');

    await liff.init({ liffId: window.ZOO_LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login(); // redirects; execution stops here for this pageview
      return null;
    }

    const idToken = liff.getIDToken();
    const { token, profile } = await apiFetch('/auth/line-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    saveSession(token, profile);
    return profile;
  }

  async function startSession(gameNumber) {
    return apiFetch('/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ gameNumber }),
    });
  }

  async function completeSession(sessionId, score, metadata) {
    return apiFetch(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ score, metadata }),
    });
  }

  async function abandonSession(sessionId) {
    return apiFetch(`/sessions/${sessionId}/abandon`, { method: 'POST' });
  }

  async function getPassport() {
    return apiFetch('/profile/passport');
  }

  window.ZooAPI = {
    initAndLogin,
    startSession,
    completeSession,
    abandonSession,
    getPassport,
  };
})(window);
