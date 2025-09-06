(async function () {
  // Helper: set text safely
  const $ = (id) => document.getElementById(id);

  // Load data
  let works = [], exhibitions = [];
  try {
    const [wRes, eRes] = await Promise.all([
      fetch('works.json', {cache:'no-store'}),
      fetch('exhibitions.json', {cache:'no-store'})
    ]);
    if (!wRes.ok || !eRes.ok) throw new Error('JSON not found');
    works = await wRes.json();
    exhibitions = await eRes.json();
  } catch (err) {
    document.querySelector('.wrap').innerHTML = '<p>Fehler beim Laden der Daten.</p>';
    console.error(err);
    return;
  }

  // Find work by id (case-insensitive)
  const params = new URLSearchParams(location.search);
  const wanted = (params.get('id') || '').toLowerCase();
  const werk = works.find(w => (w.id || '').toLowerCase() === wanted);
  if (!werk) {
    document.querySelector('.wrap').innerHTML = '<p>Kein gültiges Werk gefunden.</p>';
    return;
  }

  // Find exhibition containing this work
  const containing = exhibitions.filter(e => Array.isArray(e.works) && e.works.includes(werk.id));
  // Prefer current:true, else newest by start date
  let ex = containing.find(e => e.current === true);
  if (!ex) {
    ex = containing.slice().sort((a,b) => String(b.start).localeCompare(String(a.start)))[0];
  }

  const ort = ex?.venue || ex?.ort || 'Ausstellungsort';
  const ausstellung = ex?.title || ex?.titel || '—';
  let dat = '—';
  if (ex?.start && ex?.end) {
    const fmt = (s) => {
      try { const d = new Date(s); return d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'2-digit'}); }
      catch { return s; }
    };
    dat = `${fmt(ex.start)} – ${fmt(ex.end)}`;
  } else if (ex?.datum) {
    dat = ex.datum;
  }

  // Fill UI
  document.title = `${ort} – ${werk.werk}`;
  $('ort').textContent = ort;
  $('ausstellungDatum').textContent = `${ausstellung} · ${dat}`;
  $('werkSerie').textContent = `${werk.werk} – „${werk.serie}“`;

  // Media
  $('audio-link').href = werk.audio;
  $('audio-src').src = werk.audio;
  $('player').load();

  const pdfUrl = location.origin + '/' + werk.pdf;
  const viewerUrl = 'https://mozilla.github.io/pdf.js/web/viewer.html?file=' + encodeURIComponent(pdfUrl);
  $('pdfFrame').src = viewerUrl;
  $('pdfNewTab').href = '/' + werk.pdf;
  $('pdfTitle').textContent = 'PDF: ' + werk.werk;

  // Modal handlers
  const modal = $('pdfModal');
  $('pdf-link').addEventListener('click', () => {
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  });
  $('closePdf').addEventListener('click', () => {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow='';
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  });
})();
