/* 엔딩 크레딧 — siena.film/films/taboo 의 prizes 단처럼 사진 위로 흰 글씨가 올라간다.
   우리는 내용이 길지 않으니 무한 루프 대신 스크롤에 맞춰 올라가고(피그마 Frame 118 → 123), 끝에서 흰 픽셀 밴드가 차오르며 Designers 로 넘어간다. */
(function () {
  const sec = document.getElementById('credits'); if (!sec) return;
  const roll = document.getElementById('credits-roll');
  const band = CE.PixelBand(document.getElementById('px-credits'));
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cs = v => Math.max(0, Math.min(1, v));
  const seg = (q, a, b) => cs((q - a) / (b - a));
  const FROM = 9.35, TO = -33.2 - 14;      // rem (프레임 118 top 187 → 프레임 123 top -664, 조금 더)
  function render(p) {
    const r = rem();
    const y = (FROM + (TO - FROM) * seg(p, 0, 0.92)) * r;
    roll.style.top = '0px';
    roll.style.transform = `translate(-50%, ${y.toFixed(1)}px)`;
  }
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=220%', pin: true, scrub: 0.5, onUpdate: s => render(s.progress), onRefresh: s => render(s.progress) });
  render(0);
  CE.bandAfter(sec, band, { endVh: 0.5 });   /* 바로 아래가 Designers 라 빈 단 없이 이어지므로, 더 일찍 다 찬다 */   // 핀이 풀린 뒤 크레딧이 올라가며 흰 밴드가 차오른다
})();
