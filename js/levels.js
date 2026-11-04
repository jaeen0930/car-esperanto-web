/* 자율주행 레벨 — paulkalkbrenner.net/journey 와 같은 방식.
   "Level 0 … Level 5" 가 아래로 갈수록 오른쪽으로 비껴 쌓이고(사이에 가는 줄), 스크롤하면 스택이 위로 밀리며 활성 레벨이 바뀐다.
   지나간 레벨은 왼쪽으로 쏙 빠져나간다. 설명(왼쪽 위)·사진(오른쪽 위)은 레벨이 바뀔 때 교체(사진은 아래에서 자라나고, 글은 줄 단위로 올라온다).
   5단계까지 간 뒤 더 내리면 스택이 거꾸로 한 칸 돌아가 왼쪽으로 빠졌던 Level 4 가 제자리로 돌아온다(새 줄을 만들지 않는다).
   그 Level 4 가 커지며 Why Level 4 가 된다. (11-04 재은: 레벨 5 뒤에 새 레벨 4 를 두지 말고, 이미 있던 레벨 4 로 돌아가서 커지게) */
(function () {
  const sec = document.getElementById('levels'); if (!sec) return;
  const stack = document.getElementById('lv-stack'), imgBox = document.getElementById('lv-img'), copy = document.getElementById('lv-copy'), why = document.getElementById('lv-why');
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cs = v => Math.max(0, Math.min(1, v));
  const seg = (q, a, b) => cs((q - a) / (b - a));
  const easeInOut = q => q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
  const easeOutCubic = q => 1 - Math.pow(1 - q, 3);

  const LEVELS = [
    { en: 'No Driving Automation', kr: ['사람이 운전의 모든 과정을 맡습니다.', '주변을 살피고 방향과 속도를 조절하는 모든 과정은 사람이 수행합니다.', '차량이 위험을 경고하거나 순간적인 제동을 돕더라도 운전은 사람이 책임집니다.'], img: 'lv0.jpg', w: 92.5 },
    { en: 'Driver Assistance', kr: ['차량이 운전의 일부를 돕습니다.', '차량은 조향 또는 속도 조절 중 하나를 지원합니다.', '운전자는 계속 주변을 살피며 나머지 운전을 직접 수행합니다.'], img: 'lv1.jpg', w: 92.5 },
    { en: 'Partial Driving Automation', kr: ['차량이 방향과 속도를 함께 조절합니다.', '차량은 조향과 가감속을 동시에 지원하지만, 운전자는 계속 주변 상황을 살피고 운전을 감독해야 합니다.'], img: 'lv2.jpg', w: 92.5 },
    { en: 'Conditional Driving Automation', kr: ['정해진 조건에서 차량이 운전을 맡고, 필요할 때 사람이 이어받습니다.', '운전 전환을 요청받거나 명백한 고장이 발생하면 운전자가 주행을 이어받아야 합니다.'], img: 'lv3.jpg', w: 92.5 },
    { en: 'High Driving Automation', kr: ['정해진 운행 조건 안에서는 차량이 운전과 위험 대응을 책임집니다.', '운전자가 운전을 이어받을 필요 없이 차량이 스스로 주행을 수행합니다.'], img: 'lv4.jpg', w: 92.5 },
    { en: 'Full Driving Automation', kr: ['사람이 운전할 수 있는 모든 조건에서 차량이 운전을 맡습니다.', '특정 운행 조건에 제한되지 않으며, 탑승자는 운전에 개입하거나 운전을 이어받을 필요가 없습니다.'], img: 'lv5.jpg', w: 92.5 },
  ];
  // 줄 순서: 0 1 2 3 4 5 (돌아갈 때는 같은 Level 4 줄을 다시 쓴다)
  const ORDER = [0, 1, 2, 3, 4, 5];
  const BACK = 4;             // 돌아가 커질 줄
  const N = ORDER.length;
  // 피그마 스택 자리 (rem): 활성 줄부터 아래로
  const X = [-11.8, -2.65, 6.6, 15.6, 25.0, 33.35];
  const Y = [58.18, 77.7, 97.6, 116.9, 136.3, 156.3];
  const LINE = [75.35, 94.97, 114.57, 134.17, 153.77, 173.37];
  const PITCH = 19.6;
  const BIG = { x: 3.79, y: 72.58, scale: 32.89 / 20 };
  const OUT_X = 150;          // 지나간 줄이 왼쪽으로 빠지는 거리 (rem)

  // 줄 만들기
  const rows = ORDER.map((lv, i) => {
    const row = document.createElement('div'); row.className = 'lv-row';
    row.innerHTML = `<p class="t-level">Level ${lv}</p><div class="line"></div>`;
    stack.appendChild(row);
    return { el: row, t: row.querySelector('.t-level'), line: row.querySelector('.line') };
  });
  // 사진·설명 준비 (사진은 아래에서 자라 올라오고, 나갈 때는 위로 줄어든다)
  const imgs = LEVELS.map(lv => { const im = new Image(); im.src = 'assets/img/' + lv.img; im.alt = ''; im.style.transform = 'scaleY(0)'; im.style.transition = 'transform .7s cubic-bezier(.2,.7,.2,1)'; imgBox.appendChild(im); return im; });

  let active = -1, activeLv = -1;
  function showLevel(i) {          // i = ORDER 인덱스
    if (i === active) return;
    const prevLv = activeLv; active = i; activeLv = ORDER[i];
    const lv = LEVELS[activeLv];
    copy.style.width = lv.w + 'rem';
    copy.classList.remove('is-in');
    copy.innerHTML = [`<span class="en">${lv.en}</span>`, ...lv.kr].map(s => `<p class="line-mask"><span>${s}</span></p>`).join('');
    void copy.offsetWidth; copy.classList.add('is-in');
    imgs.forEach((im, k) => {
      if (k === activeLv) {
        if (prevLv === k) return;
        im.style.transition = 'none'; im.style.transformOrigin = '50% 100%'; im.style.zIndex = 2; im.style.transform = 'scaleY(0) scale(1.08)';
        void im.offsetWidth; im.style.transition = 'transform .7s cubic-bezier(.2,.7,.2,1)'; im.style.transform = 'scaleY(1) scale(1)';
      }
      else if (k === prevLv) { im.style.transformOrigin = '50% 0%'; im.style.zIndex = 1; im.style.transform = 'scaleY(0) scale(1)'; }
      else { im.style.zIndex = 0; im.style.transform = 'scaleY(0)'; }
    });
  }

  function slot(s) {           // 실수 슬롯 → 위치 (0 = 활성 줄)
    if (s >= 5) return { x: X[5] + (s - 5) * 8.35, y: Y[5] + (s - 5) * PITCH, ly: LINE[5] + (s - 5) * PITCH };
    const a = Math.max(0, Math.floor(s)), b = Math.min(5, a + 1), f = s - a;
    return { x: X[a] + (X[b] - X[a]) * f, y: Y[a] + (Y[b] - Y[a]) * f, ly: LINE[a] + (LINE[b] - LINE[a]) * f };
  }

  const STEPS = (N - 1) + 1 + 1;   // 0→5 (5 단계) + 5→4 돌아가기 (1 단계) + Level 4 커짐 (1 단계)
  let whyShown = false;
  function render(p) {
    const r = rem();
    const t = p * STEPS;
    let act, grow = 0;
    const L = N - 1;
    if (t <= L) { const k = Math.floor(t), f = t - k; act = Math.min(L, k + easeInOut(f)); }   // 칸마다 잠깐 머물다 넘어간다
    else if (t <= L + 1) { act = L - (L - BACK) * easeInOut(t - L); }                              // 5 → 4 로 되돌아간다
    else { act = BACK; grow = easeInOut(cs(t - L - 1)); }
    const idx = Math.max(0, Math.min(N - 1, Math.round(act)));
    rows.forEach((row, i) => {
      const s = i - act;
      let x, y, ly, op = 1, sc = 1, lop = 1;
      if (s >= 0) { const pos = slot(s); x = pos.x; y = pos.y; ly = pos.ly; }
      else {                   // 지나간 줄: 왼쪽으로 쏙 빠진다
        const e = easeOutCubic(cs(-s));
        x = X[0] - OUT_X * e; y = Y[0] - 4 * e; ly = LINE[0] - 4 * e; op = 1 - cs(-s * 1.15); lop = 1 - cs(-s * 2.5);
      }
      if (grow > 0) {
        if (i === BACK) { x = x + (BIG.x - x) * grow; y = y + (BIG.y - y) * grow; sc = 1 + (BIG.scale - 1) * grow; lop = 1 - grow; }
        else { op = op * (1 - cs(grow * 2.2)); y = y + 12 * grow; lop = 1 - grow; }
      }
      row.el.classList.toggle('is-out', s <= -1);
      row.t.style.transform = `translate(${(x * r).toFixed(2)}px, ${(y * r).toFixed(2)}px) scale(${sc.toFixed(4)})`;
      row.t.style.transformOrigin = '0 0';
      row.t.style.opacity = op.toFixed(3);
      row.line.style.transform = `translateY(${(ly * r).toFixed(2)}px)`;
      row.line.style.opacity = (op * lop).toFixed(3);
      row.line.style.left = (s < 1.5 ? 6.4 : 10.9) + 'rem';   // 아래쪽 줄은 피그마처럼 살짝 오른쪽에서 시작
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
    trigger: sec, start: 'top top', end: '+=' + (STEPS * 100) + '%', pin: true, scrub: 0.7,
    onUpdate: self => render(self.progress), onRefresh: self => render(self.progress), invalidateOnRefresh: true
  });
  render(0);
})();
