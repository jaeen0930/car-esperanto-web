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
  CE.scrollTo = (y, o) => lenis.scrollTo(y, Object.assign({ force: true }, o || {}));
  CE.scrollStop = () => lenis.stop();
  CE.scrollStart = () => lenis.start();
})();
