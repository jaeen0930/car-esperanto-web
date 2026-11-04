/* Passenger Interaction — polestar.com/polestar-5 의 interior 단과 같은 방식.
   사진은 멈추지 않고 그대로 흘러가고(컷마다 서지 않는다), 캡션만 왼쪽 아래에 붙어 따라온다 (CSS sticky).
   캡션은 그 컷이 화면을 채우면 줄 단위로 올라온다. */
(function () {
  const blocks = [...document.querySelectorAll('#gui .gui')]; if (!blocks.length) return;
  blocks.forEach(b => {
    const cap = b.querySelector('.cap');
    cap.innerHTML = [...cap.querySelectorAll('p')].map(p => `<p class="${p.className} line-mask"><span>${p.innerHTML}</span></p>`).join('');
  });
  function render() {
    const vh = window.innerHeight;
    blocks.forEach(b => {
      const r = b.getBoundingClientRect();
      b.classList.toggle('is-in', r.top < vh * 0.55 && r.bottom > vh * 0.45);
    });
  }
  CE.onScroll(render);
  window.addEventListener('resize', render);
  window.addEventListener('load', render);
  render();
})();
