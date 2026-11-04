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
    // (11-04) CEP 로고는 첫 화면에서만 — 아래로 내려가면 숨겨서 뒤로 지나가는 내용과 겹치지 않게 (피그마도 첫 화면 다음부터 로고 없음)
    const hs = CE.heroST, logoOff = hs ? hs.start + (hs.end - hs.start) * 0.6 : window.innerHeight * 0.5;   // AIDV 화면이 나타나는 지점부터
    nav.classList.toggle('no-logo', window.scrollY > logoOff);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const probe = (3.15 + 0.95) * rem;
    // (11-04) 채원 단 위에서도 우리 네비를 그대로 둔다 — 배경 없이 글자만. data-nav="hide" 단이 생기면 숨긴다.
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
  CE.onScroll(theme);
  window.addEventListener('resize', theme);
  theme();

  if (/noiframe/.test(location.search)) document.querySelectorAll('iframe').forEach(f => f.removeAttribute('src'));   // 테스트용

  // 앵커: 핀 때문에 위치가 바뀌므로 그때그때 계산
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1); const t = document.getElementById(id); if (!t) return;
    e.preventDefault();
    const y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY;
    CE.scrollTo(y, { duration: 1.4 });
  }));

  // Sound OFF / ON (영상이 들어오면 여기서 음소거를 푼다)
  const sb = document.getElementById('sound-btn');
  if (sb) sb.addEventListener('click', () => {
    const on = sb.textContent.trim() === 'Sound OFF';
    sb.textContent = on ? 'Sound ON' : 'Sound OFF';
    document.querySelectorAll('video').forEach(v => { v.muted = !on; });
  });

  // 채원 단(iframe): 단이 화면 맨 위에 딱 맞은 뒤에만 안쪽이 스크롤된다.
  //  - 위에서 내려오다 단 윗변이 화면 윗변을 지나치면 그 자리에 맞춰 세운다(위에 앞 단이 걸친 채 안쪽만 굴러가지 않게).
  //  - 안쪽 맨 끝/맨 위에서 더 굴리면 iframe 이 {ceScroll: dy} 를 보내고, 바깥 페이지가 이어서 움직인다.
  const cw = document.getElementById('chaewon');
  if (cw) {
    let lastTop = cw.getBoundingClientRect().top, leaving = 0, snapping = false;
    const align = () => { snapping = true; CE.scrollTo(Math.round(cw.getBoundingClientRect().top + window.scrollY), { immediate: true, keepSnap: true }); requestAnimationFrame(() => { snapping = false; }); };
    function cwTick() {
      const top = cw.getBoundingClientRect().top;
      if (!snapping && !leaving) {
        // (11-04) 빠르게 굴려도 건너뛰지 않게 지나친 거리와 상관없이 맞춘다 (메뉴 링크로 이동 중일 때만 예외)
        if (!CE.autoScrolling && lastTop > 0 && top < 0) align();          // 내려오며 지나침 → 맞춤
        else if (!CE.autoScrolling && lastTop < 0 && top > 0) align();     // 올라오며 지나침 → 맞춤
      }
      const now = cw.getBoundingClientRect().top;
      if (leaving && Math.abs(now) > window.innerHeight * 0.25) leaving = 0;
      cw.classList.toggle('is-live', Math.abs(now) < 2);
      lastTop = now;
    }
    window.addEventListener('scroll', cwTick, { passive: true });
    // (11-04 TV 렉) 화면에서 멀리 떨어져 있으면 iframe 을 그리지 않는다(display:none → 안쪽 3D · 띠 애니메이션이 멈춘다). 가까워지면 다시 보인다.
    // (11-04 저녁) 미리 불러 둔다 — 화면에 닿은 뒤에야 6MB 를 받기 시작하면 한동안 검은 화면만 보였다.
    //   페이지가 다 뜬 뒤 바로 src 를 넣고, 다 불러온 다음부터만 멀리 있을 때 숨긴다(숨김 범위도 넉넉히 ±3화면).
    const cwFrame = cw.querySelector('iframe');
    let cwLoaded = false;
    if (cwFrame) {
      cwFrame.addEventListener('load', () => { if (cwFrame.getAttribute('src')) cwLoaded = true; });
      const startLoad = () => { if (!cwFrame.getAttribute('src') && cwFrame.dataset.src && !/noiframe/.test(location.search)) cwFrame.setAttribute('src', cwFrame.dataset.src); };
      if (document.readyState === 'complete') setTimeout(startLoad, 300); else window.addEventListener('load', () => setTimeout(startLoad, 300));
    }
    CE.onScroll(() => {
      if (!cwFrame || !cwLoaded) return;
      const r = cw.getBoundingClientRect(), vh = window.innerHeight, near = r.bottom > -vh * 3 && r.top < vh * 4;
      if (cwFrame.style.display !== (near ? '' : 'none')) cwFrame.style.display = near ? '' : 'none';
    });
    window.addEventListener('resize', cwTick);
    cwTick();
    window.addEventListener('message', e => {
      const d = e.data; if (!d || typeof d !== 'object') return;
      if (Number.isFinite(d.ceScroll)) { leaving = Math.sign(d.ceScroll); CE.lenis ? CE.lenis.scrollTo(CE.lenis.targetScroll + d.ceScroll, { force: true }) : window.scrollBy({ top: d.ceScroll, behavior: 'instant' }); }
    });
  }
  window.addEventListener('load', () => { ScrollTrigger && ScrollTrigger.refresh(); });
  document.fonts && document.fonts.ready.then(() => { ScrollTrigger && ScrollTrigger.refresh(); });
})();
