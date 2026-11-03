/* 공통: 네비 색(흰 단 → 검정, 검은 단 → 흰), CEP 도트 로고, 앵커, 사운드 토글 */
(function () {
  if (window.ScrollTrigger) ScrollTrigger.config({ ignoreMobileResize: true });

  // 로고 (6 × 8 칸 도트 글꼴로 CEP)
  const lg = document.getElementById('cep-logo'); if (lg) CE.fillSvg(lg, 'CEP', { fill: 0.98 });
  const lgv = document.getElementById('cep-logo-v'); if (lgv) CE.fillSvg(lgv, 'CEP', { fill: 0.92, rotate: 90 });

  // 네비 색: 네비 글자 높이에 걸린 섹션의 data-nav 를 따른다 (히어로는 hero.js 가 진행도에 따라 직접 바꾼다)
  const nav = document.getElementById('nav');
  const secs = [...document.querySelectorAll('[data-nav]')];
  const hero = document.getElementById('hero');
  function theme() {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const probe = (3.15 + 0.95) * rem;
    // 채원 단(iframe)이 화면 위쪽 절반까지 올라오면 우리 네비는 미리 숨긴다 — 그 위에 네비가 겹치지 않게
    const vh = window.innerHeight;
    const hideNow = secs.some(s => s.dataset.nav === 'hide' && (() => { const r = s.getBoundingClientRect(); return r.top < vh * 0.55 && r.bottom > probe; })());
    nav.classList.toggle('is-hidden', hideNow);
    if (hideNow) return;
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        if (s === hero) return;                       // 히어로 안에서는 hero.js 가 결정
        if (s.dataset.nav !== 'hide' && nav.dataset.theme !== s.dataset.nav) nav.dataset.theme = s.dataset.nav;
        return;
      }
    }
  }
  window.addEventListener('scroll', theme, { passive: true });
  window.addEventListener('resize', theme);
  theme();

  if (/noiframe/.test(location.search)) document.querySelectorAll('iframe').forEach(f => f.removeAttribute('src'));   // 테스트용

  // 앵커: 핀 때문에 위치가 바뀌므로 그때그때 계산
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1); const t = document.getElementById(id); if (!t) return;
    e.preventDefault();
    const y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }));

  // Sound OFF / ON (영상이 들어오면 여기서 음소거를 푼다)
  const sb = document.getElementById('sound-btn');
  if (sb) sb.addEventListener('click', () => {
    const on = sb.textContent.trim() === 'Sound OFF';
    sb.textContent = on ? 'Sound ON' : 'Sound OFF';
    document.querySelectorAll('video').forEach(v => { v.muted = !on; });
  });

  // 채원 단(iframe)이 맨 위·맨 아래에 닿은 채로 더 굴리면 바깥 페이지가 이어서 움직인다 (iframe 쪽에서 {ceScroll: dy} 를 보낸다)
  window.addEventListener('message', e => {
    const d = e.data; if (!d || typeof d !== 'object') return;
    if (Number.isFinite(d.ceScroll)) window.scrollBy({ top: d.ceScroll, behavior: 'instant' });
  });
  window.addEventListener('load', () => { ScrollTrigger && ScrollTrigger.refresh(); });
  document.fonts && document.fonts.ready.then(() => { ScrollTrigger && ScrollTrigger.refresh(); });
})();
