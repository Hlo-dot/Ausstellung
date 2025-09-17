// Helpers
const $ = (sel, el=document)=>el.querySelector(sel);
const modal = $('#modal');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');
const closeBtn = $('#modalClose');

function openModal(title, contentNode){
  modalTitle.textContent = title;
  modalBody.innerHTML = '';
  modalBody.appendChild(contentNode);
  modal.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  // stop media
  modal.querySelectorAll('audio,iframe').forEach(el=>{
    if(el.tagName==='AUDIO'){ el.pause(); el.src=''; }
    if(el.tagName==='IFRAME'){ el.src='about:blank'; }
  });
  modal.classList.remove('open');
  document.body.style.overflow='';
}
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

// AUDIO
$('#btn-audio').addEventListener('click', () => {
  const src = $('#btn-audio').dataset.audio || window.CURRENT_AUDIO || ($('#audio-src')?.getAttribute('src') || '');
  const box = document.createElement('div');
  box.className='body-pad';
  const h = document.createElement('h3'); h.textContent='Audiobeschreibung';
  const p = document.createElement('p'); p.style.marginBottom='10px';
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.autoplay = true;
  audio.preload = 'auto';
  if(src) audio.src = src;
  box.append(h);
  box.append(audio);
  openModal('Audiobeschreibung', box);
});

// PDF via pdf.js viewer
$('#btn-pdf').addEventListener('click', () => {
  const pdfUrl = $('#btn-pdf').dataset.pdf || window.CURRENT_PDF || 'pdf/montan.pdf';
  const viewerUrl = 'https://mozilla.github.io/pdf.js/web/viewer.html?file=' + encodeURIComponent(pdfUrl);
  const frame = document.createElement('iframe');
  frame.className='viewer';
  frame.allowFullscreen = true;
  frame.src = viewerUrl;
  openModal('PDF', frame);
});

// VIDEO (YouTube)
$('#btn-video').addEventListener('click', () => {
  const ytId = $('#btn-video').dataset.videoId || window.CURRENT_VIDEO || '_Yg0ta6Lk9w';
  const wrapper = document.createElement('div');
  wrapper.className='video-box';
  const qs = 'autoplay=1&mute=0&playsinline=1&modestbranding=1&rel=0&controls=1';
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + ytId + '?' + qs;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  wrapper.appendChild(iframe);
  openModal('Meine Arbeitsweise', wrapper);
});

// ARTIST INFO
$('#btn-artist').addEventListener('click', () => {
  const box = document.createElement('div');
  box.className='body-pad';
  box.innerHTML = `<h3>Über den Künstler</h3>
  <p><strong>Ulf Obermann‑Löwenstein (Flu)</strong> arbeitet in Serien zwischen Struktur und Stille.
  Seine Arbeiten erforschen Material, Spur und Resonanzräume. Weitere Infos unter
  <a href="https://www.flu.ruhr" target="_blank" rel="noopener">flu.ruhr</a>.</p>`;
  openModal('Über den Künstler', box);
});

// ESC zum Schließen
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.classList.contains('open')) closeModal(); });
