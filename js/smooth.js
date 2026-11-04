/* (11-04) 부드러운 마우스 스크롤 — Lenis. 휠 입력을 받아 목표 위치까지 매끄럽게 따라간다.
   GSAP ScrollTrigger 와 같은 시계(ticker)로 돌려 핀 · 스크럽이 어긋나지 않게 한다.
   다른 스크립트는 CE.scrollTo(y, opt) 로 움직인다 (Lenis 가 없으면 기본 스크롤). */
window.CE = window.CE || {};
(function () {
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.Lenis || reduced || /nosmooth/.test(location.search)) {
    CE.scrollTo = (y, o) => window.scrollTo({ top: y, behavior: o && o.immediate ? 'instant' : 'smooth' });
    CE.scrollStop = CE.scrollStart = () => {};
    return;
  }
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, anchors: false });
  CE.lenis = lenis;
  if (window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  // 메뉴 링크처럼 코드가 길게 움직일 때는 CE.autoScrolling = true (채원 단에서 멈춰 세우지 않게)
  CE.scrollTo = (y, o) => {
    o = Object.assign({ force: true }, o || {});
    if (o.immediate && !o.keepSnap) { CE.autoScrolling = true; clearTimeout(CE._autoT); CE._autoT = setTimeout(() => { CE.autoScrolling = false; }, 200); }   // 코드로 순간이동할 때도 채원 단에 붙잡히지 않게
    else if (!o.immediate) { CE.autoScrolling = true; clearTimeout(CE._autoT); CE._autoT = setTimeout(() => { CE.autoScrolling = false; }, ((o.duration || 1.2) + 0.4) * 1000); }
    lenis.scrollTo(y, o);
  };
  // 사람이 휠 · 터치로 끼어들면 자동 이동 표시를 바로 끈다
  ['wheel', 'touchstart'].forEach(t => window.addEventListener(t, () => { CE.autoScrolling = false; }, { passive: true }));
  CE.scrollStop = () => lenis.stop();
  CE.scrollStart = () => lenis.start();
})();
