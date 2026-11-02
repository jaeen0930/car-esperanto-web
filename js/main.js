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
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        if (s === hero) return;                       // 히어로 안에서는 hero.js 가 결정
        nav.classList.toggle('is-hidden', s.dataset.nav === 'hide');   // iframe 단(채원 · 3D)은 자기 헤더가 있어 우리 네비를 숨긴다
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

  // iframe 안에서의 스크롤은 그 안에서만 (끝에 닿으면 브라우저가 자연스럽게 바깥으로 넘긴다)
  window.addEventListener('load', () => { ScrollTrigger && ScrollTrigger.refresh(); });
  document.fonts && document.fonts.ready.then(() => { ScrollTrigger && ScrollTrigger.refresh(); });
})();
