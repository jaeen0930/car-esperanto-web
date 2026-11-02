/* Passenger Interaction — polestar.com/polestar-5 의 interior 단과 같은 방식.
   화면 하나가 sticky 로 붙어 있고, 캡션은 왼쪽 아래에 고정. 긴 컷(03·04·05)은 그 안에서 사진이 위로 흐른다.
   다음 컷은 아래에서 올라와 앞 컷을 덮는다. */
(function () {
  const blocks = [...document.querySelectorAll('#gui .gui')]; if (!blocks.length) return;
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cs = v => Math.max(0, Math.min(1, v));
  const items = blocks.map((b, i) => ({ b, track: b.querySelector('.gui-track'), cap: b.querySelector('.cap'), tall: b.querySelector('.gui-track.tall'), dist: 0, top: 0, last: i === blocks.length - 1 }));

  items.forEach(it => {
    // 캡션 줄 마스크
    it.cap.innerHTML = [...it.cap.querySelectorAll('p')].map(p => `<p class="${p.className} line-mask"><span>${p.innerHTML}</span></p>`).join('');
  });

  function layout() {
    const vh = window.innerHeight, r = rem();
    items.forEach(it => {
      const trackH = it.tall ? parseFloat(it.tall.dataset.scrollH) * r : 0;
      it.dist = it.tall ? Math.max(0, trackH - vh) : 0;
      it.b.style.height = (vh + it.dist + (it.last ? 0 : vh)) + 'px';
    });
    items.forEach(it => { it.top = it.b.getBoundingClientRect().top + window.scrollY; });
    render();
  }
  function render() {
    const y = window.scrollY, vh = window.innerHeight;
    items.forEach(it => {
      if (it.dist) {
        const p = cs((y - it.top) / it.dist);
        it.track.style.transform = `translateY(${(-it.dist * p).toFixed(1)}px)`;
      }
      const inView = y > it.top - vh * 0.6 && y < it.top + it.b.offsetHeight;
      it.b.classList.toggle('is-in', inView);
    });
  }
  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  layout();
  if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', layout);
})();
