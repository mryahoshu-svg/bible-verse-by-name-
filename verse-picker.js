/* verse-picker.js
   - Adds bilingual verses
   - Supports cycles per name (cycle-per-name)
   - Handles autoplay overlay when audio is blocked
   - Attempts to play ambient audio and falls back to showing overlay
*/

// Minimal bilingual verse dataset. Expand as needed.
const VERSES = {
  "Jesus": [
    { en: "For God so loved the world, that he gave his only Son... (John 3:16)", alt: "Porque de tal manera amó Dios al mundo, que dio a su Hijo unigénito... (Juan 3:16)" },
    { en: "I am the way, and the truth, and the life... (John 14:6)", alt: "Yo soy el camino, la verdad y la vida... (Juan 14:6)" }
  ],
  "Mary": [
    { en: "Blessed are you among women... (Luke 1:42)", alt: "Bendita tú entre las mujeres... (Lucas 1:42)" },
    { en: "My soul magnifies the Lord... (Luke 1:46)", alt: "Mi alma engrandece al Señor... (Lucas 1:46)" }
  ],
  "David": [
    { en: "The LORD is my shepherd; I shall not want... (Psalm 23:1)", alt: "Jehová es mi pastor; nada me faltará... (Salmo 23:1)" }
  ]
};

// State
let currentName = null;
let currentIndex = 0; // index within name's verse array
let currentCycle = 0; // cycles shown for currentIndex
const nameSelect = document.getElementById('name-select');
const verseEn = document.getElementById('verse-en');
const verseAlt = document.getElementById('verse-alt');
const cyclesInput = document.getElementById('cycles');
const nextBtn = document.getElementById('next-btn');
const ambientAudio = document.getElementById('ambient-audio');
const overlay = document.getElementById('autoplay-overlay');
const enableAudioBtn = document.getElementById('enable-audio');

// Populate name selector
function populateNames(){
  const names = Object.keys(VERSES);
  names.forEach((n) => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = n;
    nameSelect.appendChild(opt);
  });
  if(names.length) {
    nameSelect.value = names[0];
    selectName(names[0]);
  }
}

function selectName(name){
  if(!VERSES[name] || VERSES[name].length === 0) return;
  currentName = name;
  currentIndex = 0;
  currentCycle = 0;
  renderCurrent();
}

function renderCurrent(){
  if(!currentName) return;
  const verses = VERSES[currentName];
  const v = verses[currentIndex];
  verseEn.textContent = v.en;
  verseAlt.textContent = v.alt;
}

function nextVerse(){
  const cyclesPerName = Math.max(1, parseInt(cyclesInput.value, 10) || 1);
  const verses = VERSES[currentName];
  // Increase cycle count first
  currentCycle++;
  if(currentCycle >= cyclesPerName){
    // advance to next verse
    currentCycle = 0;
    currentIndex = (currentIndex + 1) % verses.length;
  }
  renderCurrent();
}

// Autoplay handling: try to play ambient audio. If blocked, show overlay.
function tryPlayAmbient(){
  if(!ambientAudio) return;
  // Attempt to play; many browsers block autoplay with sound
  const playPromise = ambientAudio.play();
  if(playPromise !== undefined){
    playPromise.then(() => {
      // playing
      overlay.classList.add('hidden');
    }).catch((err) => {
      // autoplay blocked or other error - surface overlay
      console.warn('Autoplay blocked or failed:', err && err.message);
      overlay.classList.remove('hidden');
    });
  }
}

// Overlay click to enable audio
enableAudioBtn && enableAudioBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  if(ambientAudio){
    // try to unmute and play, some browsers require user gesture
    ambientAudio.muted = false;
    ambientAudio.play().catch(err => console.warn('Play failed after user gesture:', err));
  }
});

// Events
nameSelect.addEventListener('change', (e) => selectName(e.target.value));
nextBtn.addEventListener('click', () => nextVerse());

// Initialize
populateNames();
// Start ambient audio attempt after DOM is ready
window.addEventListener('load', () => {
  // set muted true initially to give browsers a chance to autoplay; unmute on user gesture
  if(ambientAudio){
    ambientAudio.muted = true;
    tryPlayAmbient();
  }
});

// Accessibility: allow pressing space/enter on overlay's button (native) already handled
