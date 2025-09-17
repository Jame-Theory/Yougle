// hello.js
const shortsSel = document.getElementById('shorts');
const recsSel = document.getElementById('recs');

async function load() {
  const { blockShorts = true, blockRecs = true } = await chrome.storage.local.get(['blockShorts', 'blockRecs']);
  shortsSel.value = blockShorts ? 'block' : 'allow';
  recsSel.value = blockRecs ? 'block' : 'allow';
}

function save() {
  const blockShorts = shortsSel.value === 'block';
  const blockRecs = recsSel.value === 'block';
  chrome.storage.local.set({ blockShorts, blockRecs });
}

shortsSel.addEventListener('change', save);
recsSel.addEventListener('change', save);

load();
