/* 히어로: CAR ▭ ESPERANTO — 가운데 상자가 스크롤할수록 커져 화면을 다 덮고, 글자는 상자 양옆에 붙어 밀려 나간다.
   다 덮인 화면은 그대로 "From SDV to AIDV" 화면이 되고(이미지 30%), 마지막엔 흰 픽셀 밴드가 차오르며 레벨 단으로 넘어간다.
   (Claude outputs/car-esperanto-scroll.html v5 의 박자를 피그마 프레임 2087328928 → 2087328929 → 01·SDV→AIDV 에 맞춰 다시 씀) */
(function () {
  const hero = document.getElementById('hero'); if (!hero) return;
  const box = document.getElementById('hero-box'), clip = document.getElementById('hero-clip'), dim = document.getElementById('hero-dim');
  const car = hero.querySelector('.word--car'), esp = hero.querySelector('.word--esp');
  const foot = document.getElementById('hero-foot'), aidv = document.getElementById('aidv');
  const band = CE.PixelBand(document.getElementById('px-hero'));
  const nav = document.getElementById('nav');

  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cs = v => Math.max(0, Math.min(1, v));
  const seg = (q, a, b) => cs((q - a) / (b - a));
  const easeInOut = q => q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;

  // 피그마 값 (rem, 1920 기준)
  const B0 = { x: 54.35, y: 45.73, w: 19.45, h: 11.52 };     // 프레임 1 상자
  const CAR_W = 30.15, ESP_W = 94, GAP_CAR = 1.55, GAP_ESP = 2.2;

  let lastTheme = '';
  function render(q) {
    const r = rem();
    const a = easeInOut(seg(q, 0, 0.45));
    const W = 192, H = 108;
    // 다 덮인 상태는 프레임(16:9)이 아니라 화면(100vh) 전체 — 세로 비율이 다른 화면에서도 위아래가 비지 않게
    const VH = hero.clientHeight / r, offY = (VH - H) / 2;
    const w = B0.w + (W - B0.w) * a, h = B0.h + (VH - B0.h) * a;
    const cx0 = B0.x + B0.w / 2, cy0 = B0.y + B0.h / 2;
    const cx = cx0 + (W / 2 - cx0) * a, cy = cy0 + (H / 2 - cy0) * a;
    const x = cx - w / 2, y = cy - h / 2;
    box.style.transform = `translate(${(x * r).toFixed(2)}px, ${(y * r).toFixed(2)}px)`;
    box.style.width = (w * r).toFixed(2) + 'px'; box.style.height = (h * r).toFixed(2) + 'px';
    car.style.transform = `translateX(${((x - GAP_CAR - CAR_W) * r).toFixed(2)}px)`;
    esp.style.transform = `translateX(${((x + w + GAP_ESP) * r).toFixed(2)}px)`;
    // 상자 안 영상(지금은 이미지)은 천천히 움직인다
    const drift = cs(q / 0.8);
    clip.style.transform = `translate(${(-1.5 + 3 * drift).toFixed(2)}%, ${(0.8 - 1.6 * drift).toFixed(2)}%) scale(${(1.06 + 0.05 * drift).toFixed(3)})`;
    // 아래 줄 글씨는 덮이기 전에 사라진다
    foot.style.opacity = 1 - seg(q, 0.22, 0.4);
    // AIDV 화면으로
    dim.style.opacity = (0.7 * seg(q, 0.55, 0.74)).toFixed(3);
    aidv.style.opacity = seg(q, 0.62, 0.8).toFixed(3);
    const theme = q > 0.4 ? 'dark' : 'light';
    if (theme !== lastTheme) { lastTheme = theme; nav.dataset.theme = theme; hero.classList.toggle('is-covered', theme === 'dark'); }
  }

  const st = ScrollTrigger.create({
    trigger: hero, start: 'top top', end: '+=320%', pin: true, pinSpacing: true, scrub: 0.4,
    onUpdate: self => render(self.progress), onRefresh: self => render(self.progress), invalidateOnRefresh: true
  });
  render(0);
  hero._st = st;
  CE.bandAfter(hero, band, { span: 0.7 });   // 핀이 풀린 뒤 히어로가 올라가며 흰 밴드가 차오른다

  /* 자동 덮기 (v5): 아래로 조금 내리면 영상 화면(진행 0.5)까지 한 박자로 간다. 위로 살짝 올리면 처음으로. */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || /nocarry/.test(location.search);
  let carry = null, lastY = window.scrollY;
  const easeBeat = t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  function carryTo(qTarget, dir) {
    if (reduced) return;
    const y0 = window.scrollY, y1 = st.start + (st.end - st.start) * qTarget, t0 = performance.now(), DUR = 1300;
    carry = { dir };
    (function step(now) {
      if (!carry) return;
      const t = Math.min(1, (now - t0) / DUR);
      window.scrollTo(0, y0 + (y1 - y0) * easeBeat(t));
      if (t < 1) requestAnimationFrame(step); else carry = null;
    })(t0);
  }
  window.addEventListener('scroll', () => {
    const y = window.scrollY, down = y > lastY; lastY = y;
    if (carry) return;
    const q = (y - st.start) / (st.end - st.start);
    if (down && q > 0.03 && q < 0.5) carryTo(0.5, 1);
    else if (!down && q > 0.45 && q < 0.53) carryTo(0, -1);
  }, { passive: true });
  window.addEventListener('wheel', e => { if (carry && Math.sign(e.deltaY) !== carry.dir) carry = null; }, { passive: true });
  window.addEventListener('touchstart', () => { carry = null; }, { passive: true });
})();
