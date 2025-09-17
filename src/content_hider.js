// content_hider.js
(() => {
  // --- SETTINGS (read from chrome.storage) ---
  let blockShorts = true;
  let blockRecs = true;

  // --- SELECTORS ---
  const recSelectors = [
    '#related', // Sidebar related videos
    'ytd-watch-next-secondary-results-renderer', // Suggested videos below main
    'ytd-compact-autoplay-renderer', // Autoplay up next
    'ytp-endscreen-content', // Endscreen suggestions
    'ytd-rich-grid-renderer' // Home page video grid
  ];

  const shortsSelectors = [
    'a#endpoint[title="Shorts"]',
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'a[href^="/shorts"]',
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
    'ytd-guide-entry-renderer a[href^="/shorts"]',
    'ytd-rich-item-renderer a[href*="/shorts/"]'
  ];

  function setDisplayForSelectors(selectors, hide) {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = hide ? 'none' : '';
      });
    });
  }

  function apply() {
    // Recommendations
    setDisplayForSelectors(recSelectors, blockRecs);

    // Shorts (and optional redirect)
    setDisplayForSelectors(shortsSelectors, blockShorts);
    if (blockShorts && location.pathname.startsWith('/shorts')) {
      // Redirect away from Shorts if they are blocked
      window.location.href = 'https://www.youtube.com';
    }
  }

  async function loadSettings() {
    try {
      const data = await chrome.storage.local.get(['blockShorts', 'blockRecs']);
      blockShorts = data.blockShorts ?? true;
      blockRecs = data.blockRecs ?? true;
    } catch (_) {
      // If storage isn't available for some reason, fall back to defaults
      blockShorts = true;
      blockRecs = true;
    }
  }

  // Re-apply when storage changes (popup toggles)
  chrome.storage.onChanged?.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.blockShorts) blockShorts = !!changes.blockShorts.newValue;
    if (changes.blockRecs) blockRecs = !!changes.blockRecs.newValue;
    apply();
  });

  // YouTube is SPA-like; watch for DOM changes and URL changes
  let lastUrl = location.href;
  const mo = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // On navigation, re-apply current policy
      apply();
    } else {
      // On DOM updates, keep enforcing hides
      apply();
    }
  });

  function start() {
    // Observe the whole doc; YouTube updates lots of subtrees dynamically
    mo.observe(document.documentElement || document, { subtree: true, childList: true });
    apply();
  }

  // Initialize as early as possible
  (async () => {
    await loadSettings();
    start();
  })();
})();
