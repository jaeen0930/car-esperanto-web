/* Everyone Speaks · The Gap · Vision — 장면 전환.
   세 단이 sticky 로 겹쳐 쌓이고, 다음 장면이 아래에서 올라와 앞 장면을 덮는다. 덮이는 장면은 살짝 위로 밀리며 어두워진다.
   각 장면은 화면에 들어올 때 글은 줄 단위로, 사진은 아래에서 자라 올라온다 (.is-in).
   Vision 끝에서는 검은 픽셀 밴드가 차오르고(검은 빈 단), CAR ESPERANTO 로 넘어간다. */
(function () {
  const stds = [...document.querySelectorAll('.std')]; if (!stds.length) return;
  const cs = v => Math.max(0, Math.min(1, v));
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  // 글 줄 마스크 + 그림자 층
  stds.forEach(s => {
    s.querySelectorAll('.copy').forEach(c => { c.innerHTML = [...c.querySelectorAll('p')].map(p => `<p class="${p.className} line-mask"><span>${p.innerHTML}</span></p>`).join(''); });
    const sh = document.createElement('div'); sh.className = 'shade'; s.appendChild(sh);
    s._frame = s.querySelector('.frame'); s._shade = sh;
  });
  const vision = document.getElementById('vision');
  const band = vision && vision.querySelector('.pxband') ? CE.PixelBand(vision.querySelector('.pxband')) : null;
  if (band) CE.bandAfter(vision, band);

  // 등장 대상: std 세 단 + CAR ESPERANTO + 3D 변환기
  const reveal = [document.getElementById('lvintro'), ...stds, document.getElementById('ce'), document.getElementById('converter')].filter(Boolean);

  function tick() {
    const vh = window.innerHeight, r = rem();
    stds.forEach((s, i) => {
      const next = stds[i + 1];
      const cover = next ? cs((vh - next.getBoundingClientRect().top) / vh) : 0;   // 다음 장면이 덮은 비율
      s._frame.style.transform = `translateY(${(-50 - cover * 8).toFixed(2)}%) scale(${(1 - cover * 0.04).toFixed(4)})`;
      s._shade.style.opacity = (cover * 0.35).toFixed(3);
    });
    reveal.forEach(el => {
      const rc = el.getBoundingClientRect();
      el.classList.toggle('is-in', rc.top < vh * 0.45 && rc.bottom > vh * 0.2);
    });
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', tick);
  tick();
})();
