(function () {
  const SOUND_KEY = "zoo_sound_enabled";
  const MUSIC_KEY = "zoo_music_enabled";

  function isSoundEnabled() {
    return localStorage.getItem(SOUND_KEY) !== "false";
  }

  function isMusicEnabled() {
    return localStorage.getItem(MUSIC_KEY) === "true";
  }

  window.ZooAudioSettings = {
    isSoundEnabled,
    isMusicEnabled,
    onChange(callback) {
      const sync = () => callback({ sound: isSoundEnabled(), music: isMusicEnabled() });
      window.addEventListener("storage", sync);
      window.addEventListener("zoo-settings-change", sync);
      return () => {
        window.removeEventListener("storage", sync);
        window.removeEventListener("zoo-settings-change", sync);
      };
    }
  };
})();
