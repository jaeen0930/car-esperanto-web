/* 픽셀 밴드 — paulkalkbrenner.net 의 pixelated-scroll-transition 과 같은 방식.
   섹션 아래쪽에 cols × rows 칸을 깔고, 진행도(0→1)에 따라 칸이 하나씩 켜진다.
   켜지는 순서 = 아래 줄부터 + 무작위 + 사인 흔들림 (레퍼런스의 priority 식) */
window.CE = window.CE || {};
CE.PixelBand = function (el) {
  const cols = +el.dataset.cols || 24, rows = +el.dataset.rows || 3;
  el.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  el.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  el.style.gridAutoFlow = 'row';
  const cells = [];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = document.createElement('i');
    el.appendChild(i);
    const pr = (rows - 1 - r) * 50 + rnd() * 300 + Math.sin(c * .3) * 30;   // 레퍼런스: (L-1-B)*50 + random*300 + sin(V*.3)*30
    cells.push({ el: i, pr });
  }
  cells.sort((a, b) => a.pr - b.pr);
  const n = cells.length;
  let last = -1;
  function set(p) {
    p = Math.max(0, Math.min(1, p));
    const k = Math.round(p * n);
    if (k === last) return; last = k;
    for (let i = 0; i < n; i++) cells[i].el.style.opacity = i < k ? 1 : 0;
  }
  set(0);
  return { set, el };
};

/* 섹션이 (핀이 풀린 뒤) 화면 위로 밀려 나갈 때 밴드가 차오른다.
   섹션 아랫변이 화면 아래에서 화면 높이의 span 만큼 올라오는 동안 0→1. 다 차면 다음 단의 빈 색(.gapblk)만 남는다. */
CE.bandAfter = function (section, band, opt) {
  const span = (opt && opt.span) || 0.7;
  function tick() {
    const vh = window.innerHeight, b = section.getBoundingClientRect().bottom;
    band.set((vh - b) / (vh * span));
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', tick);
  tick();
  return tick;
};
