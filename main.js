// --- Konfiguration ---
const GLOBAL_VIDEO_ID = "_Yg0ta6Lk9w"; // YouTube-ID zentral
// Autoplay mit SOUND (kein mute=1). Browser können Autoplay mit Ton blockieren -> dann erscheint Play-Button im Player.
const GLOBAL_VIDEO_EMBED = (id=GLOBAL_VIDEO_ID) => 
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

// Utility: open/close modal
function openModal(id){ const m=document.getElementById(id); if(!m) return; m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeModal(id){ const m=document.getElementById(id); if(!m) return; m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

// Elements
const pdfModal = document.getElementById('pdfModal');
const pdfFrame = document.getElementById('pdfFrame');
const pdfLoader = document.getElementById('pdfLoader');
const pdfNewTab = document.getElementById('pdfNewTab');
const pdfLinkBtn = document.getElementById('pdf-link');
const closePdfBtn = document.getElementById('closePdf');

const audioModal = document.getElementById('audioModal');
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
const audioLink = document.getElementById('audio-link');
const closeAudioBtn = document.getElementById('closeAudio');

const videoModal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');
const videoBtn = document.getElementById('video-link');
const closeVideoBtn = document.getElementById('closeVideo');

const artistModal = document.getElementById('artistModal');
const artistBtn = document.getElementById('artist-link');
const closeArtistBtn = document.getElementById('closeArtist');

// Helper: werk aus window.WERKE oder works.json
async function getCurrentWerk(){
  const id = new URLSearchParams(location.search).get('id');
  const fromWindow = (window.WERKE||[]).find(w => String(w.id) === String(id));
  if (fromWindow) return fromWindow;
  try {
    const res = await fetch('works.json', {cache:'no-store'});
    const list = await res.json();
    return (list||[]).find(w => String(w.id) === String(id)) || null;
  } catch(e){ return null; }
}

// PDF open
function openPdf(url, title){
  document.getElementById('pdfTitle').textContent = title ? `PDF: ${title}` : 'PDF';
  pdfLoader.classList.remove('hidden');
  const full = location.origin + '/' + url.replace(/^\//,'');
  const viewer = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(full)}`;
  pdfFrame.src = viewer;
  pdfNewTab.href = url.startsWith('/') ? url : `/${url}`;
  openModal('pdfModal');
}
pdfFrame.addEventListener('load', ()=> pdfLoader.classList.add('hidden'));
closePdfBtn.addEventListener('click', ()=>{ pdfFrame.src='about:blank'; closeModal('pdfModal'); });
pdfModal.addEventListener('click', (e)=>{ if(e.target===pdfModal){ pdfFrame.src='about:blank'; closeModal('pdfModal'); }});

// AUDIO open
function openAudio(url){
  audioSource.src = url.startsWith('/') ? url : `/${url}`;
  audioPlayer.load();
  audioPlayer.play().catch(()=>{});
  openModal('audioModal');
}
closeAudioBtn.addEventListener('click', ()=>{ audioPlayer.pause(); audioPlayer.currentTime=0; audioSource.src=''; closeModal('audioModal'); });
audioModal.addEventListener('click', (e)=>{ if(e.target===audioModal){ audioPlayer.pause(); audioPlayer.currentTime=0; audioSource.src=''; closeModal('audioModal'); }});

// VIDEO open (autoplay with sound)
function openVideo(id=GLOBAL_VIDEO_ID){
  videoFrame.src = GLOBAL_VIDEO_EMBED(id);
  openModal('videoModal');
}
closeVideoBtn.addEventListener('click', ()=>{ videoFrame.src='about:blank'; closeModal('videoModal'); });
videoModal.addEventListener('click', (e)=>{ if(e.target===videoModal){ videoFrame.src='about:blank'; closeModal('videoModal'); }});

// ARTIST modal (statischer Text)
function openArtist(){ openModal('artistModal'); }
closeArtistBtn.addEventListener('click', ()=> closeModal('artistModal'));
artistModal.addEventListener('click', (e)=>{ if(e.target===artistModal) closeModal('artistModal'); });

// Wire buttons + populate from werk
(async function init(){
  const w = await getCurrentWerk();
  if (w){
    document.title = `${w.ort || ''} – ${w.werk || ''}`.trim();
    const ortEl = document.getElementById('ort');
    const datEl = document.getElementById('ausstellungDatum');
    const wsEl = document.getElementById('werkSerie');
    if (ortEl) ortEl.textContent = w.ort || '';
    if (datEl) datEl.textContent = `${w.ausstellung || ''} · ${w.datum || ''}`.replace(/^ · /,'').trim();
    if (wsEl) wsEl.textContent = `${w.werk || ''} – ein Werk aus der Werkserie „${w.serie || ''}“`;

    // Audio Button -> Modal
    if (w.audio){
      document.getElementById('audio-link').addEventListener('click', (e)=>{
        e.preventDefault();
        openAudio(w.audio);
      });
    } else {
      document.getElementById('audio-link').style.display='none';
    }
    // PDF Button
    if (w.pdf){
      pdfLinkBtn.addEventListener('click', ()=> openPdf(w.pdf, w.werk || 'PDF'));
    } else {
      pdfLinkBtn.style.display='none';
    }
  }
  // Global
  videoBtn?.addEventListener('click', ()=> openVideo());
  artistBtn?.addEventListener('click', ()=> openArtist());

  // ESC schließt aktives Modal
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){
      ['pdfModal','audioModal','videoModal','artistModal'].forEach(id=>{
        const el=document.getElementById(id);
        if(el && el.classList.contains('open')){
          if(id==='pdfModal') pdfFrame.src='about:blank';
          if(id==='audioModal'){ audioPlayer.pause(); audioPlayer.currentTime=0; audioSource.src=''; }
          if(id==='videoModal') videoFrame.src='about:blank';
          closeModal(id);
        }
      });
    }
  });
})();