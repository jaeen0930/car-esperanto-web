/* 3D 변환기 — 섹션에서는 멈춘 썸네일만 보이고, 누르면 전체 화면으로 열린다 (그때 처음 로드). ✕ 또는 ESC 로 닫는다. */
(function () {
  const open = document.getElementById('conv-open'), ov = document.getElementById('conv-overlay'), fr = document.getElementById('conv-frame'), close = document.getElementById('conv-close');
  if (!open || !ov) return;
  let iframe = null, lastY = 0;
  function show() {
    lastY = window.scrollY;
    if (!iframe) { iframe = document.createElement('iframe'); iframe.title = 'CAR ESPERANTO · 3D 변환기'; iframe.allow = 'fullscreen'; fr.appendChild(iframe); }
    if (!iframe.src || iframe.src === 'about:blank') iframe.src = 'converter/index.html';
    ov.classList.add('is-open'); ov.setAttribute('aria-hidden', 'false'); document.body.classList.add('conv-open'); CE.scrollStop && CE.scrollStop();
    close.focus();
  }
  function hide() {
    ov.classList.remove('is-open'); ov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('conv-open'); CE.scrollStart && CE.scrollStart();
    if (iframe) { iframe.src = 'about:blank'; }      // 닫으면 멈춘다 (다시 열면 새로 시작)
    CE.scrollTo(lastY, { immediate: true });
    open.focus();
  }
  open.addEventListener('click', show);
  // 미리보기: 섹션이 보일 때만 차가 도는 영상을 재생한다 (변환기 화면을 미리 렌더한 턴테이블)
  const turn = document.getElementById('conv-turn');
  if (turn && 'IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) turn.play().catch(() => {}); else turn.pause(); }), { threshold: 0.15 }).observe(turn);
  const btn = document.getElementById('conv-open-btn'); if (btn) btn.addEventListener('click', show);
  close.addEventListener('click', hide);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('is-open')) hide(); });
})();
