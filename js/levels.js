/* 자율주행 레벨 — paulkalkbrenner.net/journey 와 같은 방식.
   "Level 0 … Level 5" 가 아래로 갈수록 오른쪽으로 비껴 쌓이고(사이에 가는 줄), 스크롤하면 스택이 위로 밀리며 활성 레벨이 바뀐다.
   설명(왼쪽 위)·사진(오른쪽 위)은 레벨이 바뀔 때 교체(사진은 아래에서 자라나고, 글은 줄 단위로 올라온다).
   5단계까지 간 뒤 더 내리면 4단계로 되돌아오고, 그 "Level 4" 가 커지며 Why Level 4 가 된다. */
(function () {
  const sec = document.getElementById('levels'); if (!sec) return;
  const stack = document.getElementById('lv-stack'), imgBox = document.getElementById('lv-img'), copy = document.getElementById('lv-copy'), why = document.getElementById('lv-why');
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cs = v => Math.max(0, Math.min(1, v));
  const seg = (q, a, b) => cs((q - a) / (b - a));
  const easeInOut = q => q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;

  const LEVELS = [
    { en: 'No Driving Automation', kr: ['사람이 운전의 모든 과정을 맡습니다.', '주변을 살피고, 방향과 속도를 조절하는 일을 모두 사람이 수행합니다.', '위험을 알리거나 순간적으로 제동을 돕는 기능이 있어도, 운전은 사람이 맡습니다.'], img: 'lv0.jpg', w: 58.14 },
    { en: 'Driver Assistance', kr: ['차가 운전의 일부를 돕습니다.', '차선을 따라가도록 방향을 잡거나, 앞차와의 간격에 맞춰 속도를 조절하는 일 중 하나를 차가 돕습니다.', '사람은 계속 주변을 살피며 나머지 운전을 맡습니다.'], img: 'lv1.jpg', w: 58.14 },
    { en: 'Partial Driving Automation', kr: ['차가 방향과 속도를 조절해도, 주변은 사람이 살핍니다.', '차가 차선을 따라가며 앞차와의 간격에 맞춰 속도를 함께 조절합니다.', '사람은 계속 도로와 차량의 작동 상태를 살피고, 필요할 때 직접 운전해야 합니다.'], img: 'lv2.jpg', w: 50.7 },
    { en: 'Conditional Driving Automation', kr: ['차가 운전하되, 사람이 이어받을 준비를 합니다.', '정해진 조건에서는 차가 주변을 살피며 운전합니다.', '운전을 넘겨받으라는 요청이 오거나 명백한 고장이 발생하면, 사람이 운전을 이어받아야 합니다.'], img: 'lv3.jpg', w: 58.14 },
    { en: 'High Driving Automation', kr: ['정해진 조건 안에서는, 운전을 차에 맡깁니다.', '정해진 지역·도로·날씨 등의 조건에서 차가 운전과 위험 대응을 맡습니다.', '사람이 운전을 이어받을 필요가 없어, 탑승자는 이동 중 다른 활동을 할 수 있습니다.'], img: 'lv4.jpg', w: 50.7 },
    { en: 'Full Driving Automation', kr: ['사람이 운전할 수 있는 모든 조건에서, 차가 운전을 맡습니다.', '특정 운행 조건에 한정되지 않고, 사람이 운전할 수 있는 모든 도로와 환경에서 차가 운전합니다.', '탑승자는 운전을 맡거나 이어받을 필요가 없습니다.'], img: 'lv5.jpg', w: 58.14 },
  ];
  // 피그마 스택 자리 (rem): 활성 줄부터 아래로
  const X = [-11.8, -2.65, 6.6, 15.6, 25.0, 33.35];
  const Y = [58.18, 77.7, 97.6, 116.9, 136.3, 156.3];
  const LINE = [75.35, 94.97, 114.57, 134.17, 153.77, 173.37];
  const PITCH = 19.6;
  const BIG = { x: 3.79, y: 72.58, scale: 32.89 / 20 };

  // 줄 만들기
  const rows = LEVELS.map((lv, i) => {
    const row = document.createElement('div'); row.className = 'lv-row';
    row.innerHTML = `<p class="t-level">Level ${i}</p><div class="line"></div>`;
    stack.appendChild(row);
    return { el: row, t: row.querySelector('.t-level'), line: row.querySelector('.line') };
  });
  // 사진·설명 준비
  const imgs = LEVELS.map(lv => { const im = new Image(); im.src = 'assets/img/' + lv.img; im.alt = ''; im.style.transform = 'scaleY(0)'; im.style.transition = 'transform .55s cubic-bezier(.2,.7,.2,1)'; imgBox.appendChild(im); return im; });

  let active = -1;
  function showLevel(i) {
    if (i === active) return;
    const prev = active; active = i;
    const lv = LEVELS[i];
    copy.style.width = lv.w + 'rem';
    copy.classList.remove('is-in');
    copy.innerHTML = [`<span class="en">${lv.en}</span>`, ...lv.kr].map(s => `<p class="line-mask"><span>${s}</span></p>`).join('');
    void copy.offsetWidth; copy.classList.add('is-in');
    imgs.forEach((im, k) => {
      if (k === i) { im.style.transformOrigin = '50% 100%'; im.style.zIndex = 2; im.style.transform = 'scaleY(1)'; }
      else if (k === prev) { im.style.transformOrigin = '50% 0%'; im.style.zIndex = 1; im.style.transform = 'scaleY(0)'; }
      else { im.style.zIndex = 0; im.style.transform = 'scaleY(0)'; }
    });
  }

  function slot(s) {           // 실수 슬롯 → 위치
    if (s <= 0) return { x: X[0] + s * 9.15, y: Y[0] + s * PITCH, ly: LINE[0] + s * PITCH };
    if (s >= 5) return { x: X[5] + (s - 5) * 8.35, y: Y[5] + (s - 5) * PITCH, ly: LINE[5] + (s - 5) * PITCH };
    const a = Math.floor(s), b = a + 1, f = s - a;
    return { x: X[a] + (X[b] - X[a]) * f, y: Y[a] + (Y[b] - Y[a]) * f, ly: LINE[a] + (LINE[b] - LINE[a]) * f };
  }

  const STEPS = 7;   // 0→5 (5), 5→4 (1), 4 커짐 (1)
  let whyShown = false;
  function render(p) {
    const r = rem();
    const t = p * STEPS;
    let act, grow = 0;
    if (t <= 5) act = t; else if (t <= 6) act = 5 - (t - 5); else { act = 4; grow = easeInOut(t - 6); }
    const idx = Math.max(0, Math.min(5, Math.round(act)));
    rows.forEach((row, i) => {
      const s = i - act;
      const pos = slot(s);
      let x = pos.x, y = pos.y, ly = pos.ly, op = s < 0 ? cs(1 + s) : 1, sc = 1, lop = 1;
      if (grow > 0) {
        if (i === 4) { x = pos.x + (BIG.x - pos.x) * grow; y = pos.y + (BIG.y - pos.y) * grow; sc = 1 + (BIG.scale - 1) * grow; lop = 1 - grow; }
        else { op = op * (1 - grow); y = pos.y + 12 * grow; lop = 1 - grow; }
      }
      row.el.style.transform = `translate(0px, 0px)`;
      row.t.style.transform = `translate(${(x * r).toFixed(2)}px, ${(y * r).toFixed(2)}px) scale(${sc.toFixed(4)})`;
      row.t.style.transformOrigin = '0 0';
      row.t.style.opacity = op.toFixed(3);
      row.line.style.transform = `translateY(${(ly * r).toFixed(2)}px)`;
      row.line.style.opacity = (op * lop).toFixed(3);
      row.line.style.left = (i - act < 1.5 ? 6.4 : 10.9) + 'rem';   // 아래쪽 줄은 피그마처럼 살짝 오른쪽에서 시작
    });
    if (grow < 0.3) { showLevel(idx); copy.style.opacity = 1; imgBox.style.opacity = 1; if (whyShown) { whyShown = false; why.classList.remove('is-in'); why.style.opacity = 0; } }
    else {
      copy.style.opacity = 1 - seg(grow, 0.3, 0.5); imgBox.style.opacity = 1 - seg(grow, 0.3, 0.5);
      if (!whyShown) { whyShown = true; why.innerHTML = why._src; void why.offsetWidth; why.classList.add('is-in'); }
      why.style.opacity = seg(grow, 0.45, 0.7);
    }
  }
  why._src = [...why.querySelectorAll('p')].map(p => `<p class="line-mask"><span>${p.innerHTML}</span></p>`).join('');

  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: '+=' + (STEPS * 90) + '%', pin: true, scrub: 0.6,
    onUpdate: self => render(self.progress), onRefresh: self => render(self.progress), invalidateOnRefresh: true
  });
  render(0);
})();
