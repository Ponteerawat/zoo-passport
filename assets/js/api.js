(function (global) {
  const BASE_URL = 'http://localhost:3003/api/v1';
  const TOKEN_KEY = 'zooAccessToken';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {}

    if (!res.ok) {
      const message = (data && data.message) || `Request failed: ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  function lineLogin(idToken) {
    return apiRequest('/auth/line-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  function getProfile() {
    return apiRequest('/profile/');
  }

  function getGameHistory() {
    return apiRequest('/game-history/');
  }

  function getZones() {
    return apiRequest('/zones/');
  }

  function checkInZone(zoneId) {
    return apiRequest('/zones/check-in', {
      method: 'POST',
      body: JSON.stringify({ zoneId }),
    });
  }

  global.ZooAPI = {
    getToken, setToken, clearToken, apiRequest,
    lineLogin, getProfile, getGameHistory, getZones, checkInZone,
  };
})(window);