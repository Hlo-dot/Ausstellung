// --- Helpers ---
const $ = (sel) => document.querySelector(sel);
const qs = new URLSearchParams(location.search);
const workId = qs.get('id');

// UI elements
const modal = $('#modal');
const modalTitle = $('#modalTitle');
const modalBody  = $('#modalBody');
const closeBtn   = $('#modalClose');

// Load works.json and render header texts
async function init() {
  try {
    const res = await fetch('works.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('works.json nicht erreichbar');
    const works = await res.json();

    const work = works.find(w => w.id === workId);
    if (!work) {
      $('.wrap').innerHTML = `<p><strong>Kein gültiges Werk gefunden.</strong><br>Parameter: <code>${workId ?? '(leer)'}</code></p>`;
      return;
    }

    // Header – für deine „alte“ Logik gibt es keine Ausstellungsdaten hier.
    // Wir zeigen deshalb generische Texte + Werk/Serie.
    $('#ort').textContent = 'Ausstellungsort';
    $('#ausstellungDatum').textContent = 'Titel · Datum';
    $('#werkSerie').textContent = `${work.werk} – ein Werk aus der Werkserie „${work.serie}“`;

    // Buttons
    bindButtons(work);

  } catch (e) {
    console.error(e);
    $('.wrap').innerHTML = `<p><strong>Fehler beim Laden der Daten.</strong></p>`;
  }
}

function bindButtons(work) {
  // AUDIO (Modal mit <audio>)
  $('#btn-audio').addEventListener('click', () => {
    modalTitle.textContent = 'Audiobeschreibung';
    modalBody.innerHTML = `
      <div class="audio-wrap">
        <audio id="theAudio" controls preload="metadata">
          <source src="${work.audio}" type="audio/mpeg">
        </audio>
      </div>`;
    openModal();

    // Nach Einfügen sicher laden (Safari)
    const a = $('#theAudio');
    a.addEventListener('canplay', () => { /* bereit */ }, { once:true });
    a.load();
    // Autoplay ist auf iOS ohne Interaktion gesperrt – Play bleibt beim Nutzer.
  });

  // PDF (Modal mit <embed> als stabiler Fallback)
  $('#btn-pdf').addEventListener('click', () => {
    modalTitle.textContent = 'PDF';
    // Unterstützt iOS/Safari zuverlässig:
    modalBody.innerHTML = `<embed src="${work.pdf}" type="application/pdf" />`;
    openModal();
  });

  // Meine Arbeitsweise (YouTube im Modal)
  $('#btn-approach').addEventListener('click', () => {
    modalTitle.textContent = 'Meine Arbeitsweise';
    // Falls du lieber ein festes Video willst, ersetze die ID hier:
    const ytId = '_Yg0ta6Lk9w';
    modalBody.innerHTML = `
      <iframe class="video-frame"
        src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&playsinline=1"
        title="Meine Arbeitsweise" allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen></iframe>`;
    openModal();
  });

  // Info Künstler (Modal mit Text)
  $('#btn-artist').addEventListener('click', () => {
    modalTitle.textContent = 'Über den Künstler';
    modalBody.innerHTML = `
      <div style="padding:10px; text-align:left; line-height:1.5">
        <p><strong>Ulf Obermann-Löwenstein (Flu)</strong> arbeitet in Serien zwischen Struktur und Stille. 
        Seine Arbeiten erforschen Material, Spur und Resonanzräume. Weitere Infos unter
        <a href="https://www.flu.ruhr" target="_blank" rel="noopener">flu.ruhr</a>.</p>
      </div>`;
    openModal();
  });
}

// Modal helpers
function openModal() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  modalBody.innerHTML = ''; // aufräumen (Video/Audio stoppen)
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

init();
