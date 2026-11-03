/* 3D 변환기 — 섹션에서는 멈춘 썸네일만 보이고, 누르면 전체 화면으로 열린다 (그때 처음 로드). ✕ 또는 ESC 로 닫는다. */
(function () {
  const open = document.getElementById('conv-open'), ov = document.getElementById('conv-overlay'), fr = document.getElementById('conv-frame'), close = document.getElementById('conv-close');
  if (!open || !ov) return;
  let iframe = null, lastY = 0;
  function show() {
    lastY = window.scrollY;
    if (!iframe) { iframe = document.createElement('iframe'); iframe.title = 'CAR ESPERANTO · 3D 변환기'; iframe.allow = 'fullscreen'; fr.appendChild(iframe); }
    if (!iframe.src || iframe.src === 'about:blank') iframe.src = 'converter/index.html';
    ov.classList.add('is-open'); ov.setAttribute('aria-hidden', 'false'); document.body.classList.add('conv-open');
    close.focus();
  }
  function hide() {
    ov.classList.remove('is-open'); ov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('conv-open');
    if (iframe) { iframe.src = 'about:blank'; }      // 닫으면 멈춘다 (다시 열면 새로 시작)
    window.scrollTo(0, lastY);
    open.focus();
  }
  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('is-open')) hide(); });
})();
