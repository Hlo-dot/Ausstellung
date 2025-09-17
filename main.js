
(function(){
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const openInNew = document.getElementById('openInNew');
  const closeBtn = document.getElementById('closeModal');

  function openModal(title, bodyEl, externalHref){
    // Clean up existing
    while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
    modalTitle.textContent = title || '';
    if (externalHref){ openInNew.href = externalHref; openInNew.hidden = false; }
    else { openInNew.hidden = true; }

    modalBody.appendChild(bodyEl);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeModal(){
    // stop media
    const v = modalBody.querySelector('video');
    if (v){ v.pause(); v.src=''; }
    const a = modalBody.querySelector('audio');
    if (a){ a.pause(); a.src=''; }
    const y = modalBody.querySelector('iframe');
    if (y){ y.src='about:blank'; }

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    // cleanup
    while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
  }
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });

  // AUDIO
  document.getElementById('btn-audio').addEventListener('click', function(){
    const src = this.dataset.audio || window.CURRENT_AUDIO;
    const wrap = document.createElement('div');
    wrap.className = 'media-wrap';
    const audio = document.createElement('audio');
    audio.setAttribute('controls','');
    audio.setAttribute('preload','auto');
    audio.src = src || '';
    wrap.appendChild(audio);
    openModal('Audiobeschreibung', wrap, src || undefined);
    // iOS: play nach Gesten-Click
    try { audio.load(); audio.play().catch(()=>{}); } catch(e){}
  });

  // PDF
  document.getElementById('btn-pdf').addEventListener('click', function(){
    const pdf = this.dataset.pdf || window.CURRENT_PDF;
    const wrap = document.createElement('div');
    wrap.style.height = '100%';
    const iframe = document.createElement('iframe');
    // Versuch 1: Direkt in iframe anzeigen
    iframe.src = pdf + '#toolbar=0&navpanes=0&view=FitH';
    iframe.className = 'pdf-frame';
    wrap.appendChild(iframe);

    // Fallback-Link unten
    const fb = document.createElement('div');
    fb.className = 'pdf-fallback';
    fb.innerHTML = '<p>Wenn das PDF hier nicht erscheint, öffne es <a href="'+pdf+'" target="_blank" rel="noopener">in einem neuen Tab</a>.</p>';
    wrap.appendChild(fb);

    openModal('PDF', wrap, pdf || undefined);
  });

  // VIDEO (YouTube)
  document.getElementById('btn-video').addEventListener('click', function(){
    const vid = this.dataset.videoId || window.CURRENT_VIDEO;
    const wrap = document.createElement('div');
    wrap.className = 'media-wrap';
    const iframe = document.createElement('iframe');
    const src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1&playsinline=1&rel=0&modestbranding=1';
    iframe.src = src;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    wrap.appendChild(iframe);
    openModal('Meine Arbeitsweise', wrap, 'https://youtu.be/'+vid);
  });

  // KÜNSTLER INFO
  document.getElementById('btn-artist').addEventListener('click', function(){
    const box = document.createElement('div');
    box.style.padding = '16px';
    box.innerHTML = '<h3>Über den Künstler</h3><p><strong>Ulf Obermann‑Löwenstein (Flu)</strong> arbeitet in Serien zwischen Struktur und Stille. Seine Arbeiten erforschen Material, Spur und Resonanzräume. Mehr auf <a href="https://www.flu.ruhr" target="_blank" rel="noopener">flu.ruhr</a>.</p>';
    openModal('Über den Künstler', box);
  });

  // Kleine Helfer: Demo-Werte akzeptieren
  // Damit es sofort testbar ist, setzen wir ggf. Standardquellen
  const btnAudio = document.getElementById('btn-audio');
  const btnPdf   = document.getElementById('btn-pdf');
  const btnVideo = document.getElementById('btn-video');
  if (!btnAudio.dataset.audio && window.CURRENT_AUDIO) btnAudio.dataset.audio = window.CURRENT_AUDIO;
  if (!btnPdf.dataset.pdf && window.CURRENT_PDF) btnPdf.dataset.pdf = window.CURRENT_PDF;
  if (!btnVideo.dataset.videoId && window.CURRENT_VIDEO) btnVideo.dataset.videoId = window.CURRENT_VIDEO;
})();
