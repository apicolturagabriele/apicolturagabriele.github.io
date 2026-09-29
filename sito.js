/* Apicoltura Di Giuseppe Gabriele · script comune a tutte le pagine */

/* I moduli non passano da email: compongono il messaggio e lo aprono su
   WhatsApp, già scritto, verso il numero di Gabriele. */
var WA_NUM = '393420000730';

(function(){
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, attrs, html){ var e = document.createElement(tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; return e; }
  function guard(img){ img.addEventListener('error', function(){ img.style.visibility = 'hidden'; }); }
  document.querySelectorAll('.stampa img').forEach(guard);

  /* ---------- tema ---------- */
  var tb = document.getElementById('tasto-tema');
  if (tb) tb.addEventListener('click', function(){
    var cur = root.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
  });

  /* ---------- menu su telefono ---------- */
  var ling = document.getElementById('linguette'), mb = document.getElementById('tasto-menu');
  if (mb) mb.addEventListener('click', function(){
    var open = ling.classList.toggle('aperto');
    mb.setAttribute('aria-expanded', String(open));
    mb.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });


  /* ---------- testata e indice che seguono lo scorrimento ---------- */
  var testata = document.querySelector('.testata');
  function misura(){ if (testata) root.style.setProperty('--h-testata', testata.offsetHeight + 'px'); }
  var eraScrollato = null;
  function suScroll(){
    if (!testata) return;
    var sc = window.scrollY > 24;
    if (sc !== eraScrollato) { eraScrollato = sc; testata.classList.toggle('scrollato', sc); setTimeout(misura, 220); misura(); }
  }
  window.addEventListener('scroll', suScroll, { passive:true });
  window.addEventListener('resize', misura);
  suScroll(); misura();
  if (mb) mb.addEventListener('click', function(){ setTimeout(misura, 0); });

  /* il menu evidenzia la sezione in cui ti trovi */
  var voci = ling ? Array.prototype.filter.call(ling.querySelectorAll('a'), function(a){ return a.getAttribute('href').charAt(0) === '#'; }) : [];
  var bersagli = voci.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); });
  function evidenzia(){
    var limite = (testata ? testata.offsetHeight : 0) + 90, scelto = -1;
    bersagli.forEach(function(t, i){ if (t && t.getBoundingClientRect().top <= limite) scelto = i; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) scelto = bersagli.length - 1;
    voci.forEach(function(a, i){ if (i === scelto) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  if (voci.length) {
    window.addEventListener('scroll', evidenzia, { passive:true });
    evidenzia();
    voci.forEach(function(a, i){ a.addEventListener('click', function(e){
      e.preventDefault();
      ling.classList.remove('aperto'); mb.setAttribute('aria-expanded','false'); mb.setAttribute('aria-label','Apri il menu');
      misura();
      var t = bersagli[i]; if (!t) return;
      requestAnimationFrame(function(){ t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', '#' + t.id); });
    }); });
  }

  /* ---------- video in sottofondo: parte solo quando è in vista ---------- */
  var bv = document.getElementById('banda-video');
  if (bv && 'IntersectionObserver' in window) {
    new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting) { var pr = bv.play(); if (pr && pr.catch) pr.catch(function(){}); } else bv.pause(); }); }, { threshold: .1 }).observe(bv);
  }

  /* ---------- calendario: apre il mese in corso ---------- */
  var mesi = document.querySelectorAll('.mese');
  if (mesi.length === 12) {
    var m = mesi[new Date().getMonth()];
    m.open = true;
    m.querySelector('h3').insertAdjacentHTML('beforeend', ' <span class="raccolto" style="background:var(--carta-2)">mese in corso</span>');
  }

  /* ---------- galleria con visore ---------- */
  var tavolo = document.getElementById('tavolo');
  if (tavolo && window.FOTO) {
    var PRIME = 12, altre = document.getElementById('altre-foto');
    FOTO.forEach(function(f, i){
      var n = (i < 9 ? '0' : '') + (i + 1);
      var b = el('button', { type:'button', 'aria-label':'Ingrandisci: ' + f });
      if (i >= PRIME) b.hidden = true;
      var fig = el('figure', { class:'stampa' });
      var img = el('img', { src:'img/galleria/' + n + '-t.webp', alt:f, loading:'lazy', width:560, height:700 });
      guard(img); fig.appendChild(img); fig.appendChild(el('figcaption', {}, f));
      b.appendChild(fig);
      b.addEventListener('click', function(){ apri(i); });
      tavolo.appendChild(b);
    });
    if (altre) altre.addEventListener('click', function(){ tavolo.querySelectorAll('button[hidden]').forEach(function(b){ b.hidden = false; }); altre.parentNode.hidden = true; });

    var vis = document.getElementById('visore'), vImg = vis.querySelector('img'), vCap = vis.querySelector('.didascalia'), cur = 0, last = null;
    function vai(i){
      cur = (i + FOTO.length) % FOTO.length;
      var n = (cur < 9 ? '0' : '') + (cur + 1);
      vImg.src = 'img/galleria/' + n + '.webp'; vImg.alt = FOTO[cur];
      vCap.textContent = FOTO[cur] + '  ·  ' + (cur + 1) + ' di ' + FOTO.length;
    }
    function apri(i){ last = document.activeElement; vai(i); vis.hidden = false; document.body.style.overflow = 'hidden'; vis.querySelector('.chiudi').focus(); }
    function chiudi(){ vis.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); }
    vis.querySelector('.prima').addEventListener('click', function(){ vai(cur - 1); });
    vis.querySelector('.dopo').addEventListener('click', function(){ vai(cur + 1); });
    vis.querySelector('.chiudi').addEventListener('click', chiudi);
    vis.addEventListener('click', function(e){ if (e.target === vis || e.target.classList.contains('scena')) chiudi(); });
    document.addEventListener('keydown', function(e){
      if (vis.hidden) return;
      if (vis.classList.contains('singola') && e.key !== 'Escape') return;
      if (e.key === 'Escape') chiudi();
      if (e.key === 'ArrowRight') vai(cur + 1);
      if (e.key === 'ArrowLeft') vai(cur - 1);
    });
    var x0 = null;
    vis.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, { passive:true });
    vis.addEventListener('touchend', function(e){ if (x0 === null || vis.classList.contains('singola')) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) vai(cur + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* ---------- immagini singole da ingrandire (es. la pergamena) ---------- */
  var visS = document.getElementById('visore');
  document.querySelectorAll('.ingrandisci').forEach(function(b){
    b.addEventListener('click', function(){
      if (!visS) return;
      var ultimo = document.activeElement, img = visS.querySelector('img');
      img.src = b.dataset.grande; img.alt = b.dataset.didascalia || '';
      visS.querySelector('.didascalia').textContent = b.dataset.didascalia || '';
      visS.classList.add('singola'); visS.classList.toggle('lungo', !!b.dataset.lungo); visS.querySelector('.scena').scrollTop = 0; visS.hidden = false; document.body.style.overflow = 'hidden';
      visS.querySelector('.chiudi').focus();
      var osserva = new MutationObserver(function(){ if (visS.hidden) { visS.classList.remove('singola'); visS.classList.remove('lungo'); osserva.disconnect(); if (ultimo) ultimo.focus(); } });
      osserva.observe(visS, { attributes:true, attributeFilter:['hidden'] });
    });
  });

  /* ---------- video: YouTube si carica solo al clic ---------- */
  var vbox = document.getElementById('elenco-video');
  if (vbox && window.VIDEO) VIDEO.forEach(function(v, i){
    var wrap = el('article', { class:'clip' });
    var fr = el('div', { class:'cornice' });
    var b = el('button', { type:'button', 'aria-label':'Guarda il video: ' + v[1] });
    var th = el('img', { src:'https://i.ytimg.com/vi/' + v[0] + '/hqdefault.jpg', alt:'', loading:'lazy', width:480, height:360 });
    th.addEventListener('error', function(){ th.style.visibility = 'hidden'; });
    b.appendChild(th);
    b.appendChild(el('span', { class:'play' }, '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z"/></svg>'));
    b.addEventListener('click', function(){
      var ifr = el('iframe', { src:'https://www.youtube-nocookie.com/embed/' + v[0] + '?autoplay=1&rel=0', title:v[1], allow:'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen:'' });
      fr.innerHTML = ''; fr.appendChild(ifr);
    });
    fr.appendChild(b); wrap.appendChild(fr); wrap.appendChild(el('p', {}, v[1]));
    if (i >= 4) wrap.hidden = true;
    vbox.appendChild(wrap);
  });
  var altriV = document.getElementById('altri-video');
  if (altriV && vbox) altriV.addEventListener('click', function(){ vbox.querySelectorAll('.clip[hidden]').forEach(function(c){ c.hidden = false; }); altriV.parentNode.hidden = true; });

  /* ---------- scelta pacchetto: preseleziona il modulo ---------- */
  var sel = document.getElementById('a-pacchetto');
  if (sel) document.querySelectorAll('[data-pacchetto]').forEach(function(b){
    b.addEventListener('click', function(){
      var p = b.dataset.pacchetto;
      Array.prototype.forEach.call(sel.options, function(o){ if (o.value.indexOf(p) === 0) sel.value = o.value; });
      setTimeout(function(){ document.getElementById('a-nome').focus({ preventScroll:true }); }, reduce ? 0 : 450);
    });
  });

  /* ---------- moduli -> WhatsApp ---------- */
  var ETICHETTE = { pacchetto:'Pacchetto', nome:'Nome', nome_certificato:'Nome sul certificato', email:'Email', telefono:'Telefono', motivo:'Motivo', messaggio:'Messaggio' };
  function waUrl(form){
    var d = new FormData(form), righe = ['*' + form.dataset.subject + '*', ''];
    d.forEach(function(v,k){ v = String(v).trim(); if (v && ETICHETTE[k]) righe.push(ETICHETTE[k] + ': ' + v); });
    righe.push('', '(inviato dal sito)');
    return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(righe.join('\n'));
  }
  document.querySelectorAll('form.modulo').forEach(function(form){
    var msg = form.querySelector('.esito');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      msg.hidden = false;
      if (!form.checkValidity()) { msg.textContent = 'Compila i campi obbligatori e accetta l\'informativa privacy.'; return; }
      if (form.querySelector('.nascosto').checked) return;
      var url = waUrl(form);
      window.open(url, '_blank', 'noopener');
      msg.innerHTML = 'Si apre WhatsApp con il messaggio già scritto: premi <b>Invia</b> per mandarlo a Gabriele. Se non si apre, <a href="' + url + '" target="_blank" rel="noopener">tocca qui</a>.';
    });
  });

  var anno = document.getElementById('anno');
  if (anno) anno.textContent = new Date().getFullYear();
})();
