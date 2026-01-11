(function(){
  // Demo fallback (replace or extend with your real data)
  const demo = {
    rahul: [
      {text: "Yahovah tumhara palan kare aur tumhe shant rakhe.", ref: "Numbers 6:24"},
      {text: "Prabhu tum sab ka palan kare aur tumhe sukh de.", ref: "Psalm 20:4"},
      {text: "Prabhu tumpar dayalu ho aur tumhe ashish de.", ref: "Numbers 6:25"}
    ],
    default: [
      {text: "Prabhu tumhara sharan hai; us par bharosa rakho.", ref: "Psalm 37:5"},
      {text: "Uska prem sadaiv sthir rahega.", ref: "Lamentations 3:22"}
    ]
  };

  // use existing global object if present
  const versesByName = window.versesByName || demo;

  // cycle picker: no repeat until all seen (per-name)
  function pickInCycle(list, nameKey){
    const key = 'cycleIndex_' + nameKey;
    let idx = parseInt(localStorage.getItem(key), 10);
    if (isNaN(idx)) idx = 0;
    const item = list[idx % list.length];
    idx = (idx + 1) % list.length;
    localStorage.setItem(key, String(idx));
    return item;
  }

  // UI elements
  const nameInput = document.getElementById('nameInput');
  const btn = document.getElementById('getVerse');
  const card = document.getElementById('verseCard');
  const verseText = document.getElementById('verseText');
  const verseRef = document.getElementById('verseRef');
  const anotherBtn = document.getElementById('another');
  const shareBtn = document.getElementById('share');
  const amenBtn = document.getElementById('amen');
  const audioBtn = document.getElementById('toggleAudio');
  const ambient = document.getElementById('ambientAudio');

  function showVerseForName(nameRaw){
    const name = (nameRaw || '').trim().toLowerCase() || 'default';
    const list = versesByName[name] || versesByName.default || [];
    if (!list.length) {
      verseText.textContent = "Kshama karein — is naam ke liye abhi koi vachan uplabdh nahin.";
      verseRef.textContent = "";
      card.classList.remove('hidden');
      verseText.classList.add('visible');
      return;
    }
    const chosen = pickInCycle(list, name);
    verseText.classList.remove('visible');
    // small delay to allow fade-out/in
    setTimeout(()=>{
      verseText.textContent = chosen.text;
      verseRef.textContent = chosen.ref || '';
      card.classList.remove('hidden');
      // trigger fade-in
      setTimeout(()=>verseText.classList.add('visible'), 40);
    }, 220);
  }

  btn?.addEventListener('click', ()=> showVerseForName(nameInput.value));
  nameInput?.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') showVerseForName(nameInput.value); });
  anotherBtn?.addEventListener('click', ()=> showVerseForName(nameInput.value));
  shareBtn?.addEventListener('click', ()=>{
    const text = verseText.textContent + (verseRef.textContent ? ' — ' + verseRef.textContent : '');
    if (navigator.share) {
      navigator.share({ title: 'Bible Vachan', text }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(text).then(()=> alert('Vachan copied to clipboard'));
    }
  });
  amenBtn?.addEventListener('click', ()=> {
    alert('Amen 🙏\nAapka vachan aur prarthana bheja gaya.');
  });

  // Audio toggle
  audioBtn?.addEventListener('click', ()=>{
    if (!ambient) return;
    if (ambient.paused) {
      ambient.play().catch(()=>{ /* autoplay may be blocked; user must press again */ });
      audioBtn.textContent = '🔊';
    } else {
      ambient.pause();
      audioBtn.textContent = '🔈';
    }
  });

  // Optional: auto-focus input
  nameInput?.focus();

  // If the page previously had a name param in URL, load it:
  (function loadFromQuery(){
    const p = new URLSearchParams(location.search).get('name');
    if (p) {
      nameInput.value = p;
      showVerseForName(p);
    }
  })();
})();
