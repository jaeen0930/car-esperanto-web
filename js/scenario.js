/* 시나리오 — Play 를 누르면 스크롤이 아니라 화면 전환(픽셀 디졸브)으로 뷰어가 열린다.
   뷰어 안에서는 휠 · 방향키 · 아래 썸네일로 8개 장면을 오가고, 08 에서 더 내리면 뷰어가 닫히며 엔딩 크레딧으로 간다.
   영상은 아직 없으므로 더미(assets/video/scene-XX.mp4, 없으면 스틸) 를 넣어 둔다. */
(function () {
  const SCENES = [
    { n: '01', title: '01. 생일 소식 공유', mode: '차량 ↔ 탑승자 | Notice Mode', body: '차량 AI는 연동된 일정을 통해 릴리의 생일을 확인하고 축하 인사를 건넵니다. 이어 생일 소식을 주변에 공유할지 묻고, 릴리의 동의를 받아 노티스 모드를 활성화합니다. 창문의 근적외선 패턴에는 생일 소식만 표시되며, 이름이나 나이 등의 개인정보는 전달하지 않습니다.', th: '9bc1c.jpg' },
    { n: '02', title: '02. 기계에 주문 전달', mode: '차량 ↔ 기계 | Conversation Mode', body: '여행 중 드라이브스루를 발견한 가족이 원하는 음료를 고릅니다. 차량 AI는 메뉴와 사이즈, 수량을 정리하고 탑승자에게 주문 내역을 확인받습니다. 확인된 주문은 차체의 카 에스페란토 언어로 표현되며, 주문 기계가 이를 읽고 접수 결과를 차량에 응답합니다.', th: 'b683e.jpg' },
    { n: '03', title: '03. 노티스 열람·축하', mode: '차량 ↔ 차량 | Notice & Conversation Mode', body: '신호를 기다리던 옆 차량의 탑승자가 주변 차량의 노티스를 확인합니다. 차량 카메라는 창문의 근적외선 패턴을 읽고, 공개된 생일 소식을 탑승자에게 보여줍니다. 탑승자가 축하 메시지를 보내기로 선택하면 차량이 이를 전달하고, 릴리의 차량은 감사 인사로 응답합니다.', th: '09002.jpg' },
    { n: '04', title: '04. 급정거 이유·사과', mode: '차량 ↔ 차량 | Message Card', body: '고양이가 갑자기 도로에 뛰어들어 앞차가 급정거하자, 뒤따르던 차량의 탑승자는 놀라 불편함을 표현합니다. 차량 AI는 감정이 섞인 발화를 상황을 확인하는 질문으로 정리해 전달합니다. 앞차는 급정거한 이유와 사과를 전하고, 차량 AI는 상대의 응답을 탑승자가 이해할 수 있도록 안내합니다.', th: 'f9ae6.jpg' },
    { n: '05', title: '05. 통과 순서 조율', mode: '차량 ↔ 차량 | Conversation Mode', body: '좁은 골목에서 마주한 두 차량이 각자의 위치와 상황을 전달합니다. 차량은 상대의 이동 의도를 확인하고 양보 의사를 교환하며 통과 순서를 조율합니다. 상대 차량이 비켜서고 실제 이동할 공간이 확보되면 차례대로 이동합니다.', th: '0118a.jpg' },
    { n: '06', title: '06. 보행자에게 양보', mode: '차량 ↔ 보행자 | Visible Layer', body: '해변 입구에서 보행자를 만난 차량은 먼저 지나가도록 양보합니다. 차량은 자신의 의도를 보행자가 바라보는 차체 표면에 읽을 수 있는 문장으로 표시합니다. 보행자가 메시지를 이해하고 안전하게 지나간 뒤 차량은 이동을 이어갑니다.', th: '962f4.jpg' },
    { n: '07', title: '07. 출차 의도 확인', mode: '차량 ↔ 차량 | Contextual Guidance', body: '혼잡한 해변 주차장에서 차량 AI는 주변 차량의 출차 의도를 확인합니다. 곧 출차할 차량과 필요한 정보를 주고받고, 공간이 확보될 때까지 기다립니다. 탑승자에게는 기다리는 이유와 진행 상황만 짧게 안내하며, 별도의 판단이나 개입을 요구하지 않습니다.', th: '5dd31.jpg' },
    { n: '08', title: '08. 여정의 마무리', mode: 'A Birthday by the Sea | Ending', body: '여행길에서 만난 차량과 사람, 기계는 저마다 다른 상황에서 의도를 전하고 응답했습니다. 필요한 순간마다 이어진 소통 끝에 가족은 바다에 도착합니다. 도로 위의 복잡한 대화는 뒤로 물러나고, 함께 보내는 생일의 순간이 남습니다.', th: 'fafcd.jpg', bodyTop: 71.2 },
  ];
  const viewer = document.getElementById('viewer'), frame = document.getElementById('viewer-frame'), playBtn = document.getElementById('play-btn'), closeBtn = document.getElementById('viewer-close');
  if (!viewer || !playBtn) return;

  /* 픽셀 디졸브 (24 × 14 칸, 무작위 순서로 덮었다가 걷는다) */
  const dz = document.getElementById('dissolve');
  const cells = [];
  for (let i = 0; i < 24 * 14; i++) { const c = document.createElement('i'); dz.appendChild(c); cells.push(c); }
  const order = cells.map((c, i) => ({ c, k: Math.random() + Math.sin(i * .37) * .2 })).sort((a, b) => a.k - b.k).map(o => o.c);
  function dissolve(mid) {
    return new Promise(res => {
      const n = order.length, T = 520;
      let t0 = performance.now();
      (function cover(now) {
        const p = Math.min(1, (now - t0) / T), k = Math.round(p * n);
        for (let i = 0; i < n; i++) order[i].style.opacity = i < k ? 1 : 0;
        if (p < 1) return requestAnimationFrame(cover);
        mid && mid();
        t0 = performance.now();
        (function clear(now2) {
          const q = Math.min(1, (now2 - t0) / T), k2 = Math.round(q * n);
          for (let i = 0; i < n; i++) order[n - 1 - i].style.opacity = i < k2 ? 0 : 1;
          if (q < 1) requestAnimationFrame(clear); else res();
        })(t0);
      })(t0);
    });
  }
  CE.dissolve = dissolve;

  /* 장면 DOM */
  const strip = document.createElement('div'); strip.className = 'strip';
  SCENES.forEach((s, i) => {
    const it = document.createElement('div'); it.className = 'it'; it.dataset.i = i;
    it.innerHTML = `<div class="th"><img src="assets/img/${s.th}" alt=""></div><p class="lb">${s.n}/08</p>`;
    it.addEventListener('click', () => go(i)); strip.appendChild(it);
  });
  const scenes = SCENES.map((s, i) => {
    const el = document.createElement('div'); el.className = 'scene';
    el.innerHTML = `
      <p class="num">${s.n}/08</p>
      <div class="vid">
        <img src="assets/img/9bc1c.jpg" alt="" style="top:-9.36%;height:115.75%">
        <video preload="none" muted loop playsinline poster="" data-src="assets/video/scene-${s.n}.mp4"></video>
        <span class="dummy">SCENE ${s.n} · DUMMY VIDEO</span>
      </div>
      <div class="vt t-body-b"><p>${s.title}</p><p>&#8203;</p><p>${s.mode}</p></div>
      <p class="vb t-body-r" style="${s.bodyTop ? 'top:' + s.bodyTop + 'rem' : ''}">${s.body}</p>`;
    frame.appendChild(el);
    return el;
  });
  frame.appendChild(strip);
  // 썸네일 줄은 공통이라 각 장면 밖(프레임 직속)에 두고, 활성 장면에 맞춰 왼쪽으로 민다 (피그마: 한 장면마다 -255px @3840 = 12.75rem… 실제론 아이템 11rem + 간격 14.5rem = 25.5rem 씩)
  let cur = 0, busy = false, wheelAcc = 0, wheelT = 0;
  function go(i, silent) {
    if (i < 0) return;
    if (i >= SCENES.length) return finish();
    cur = i;
    scenes.forEach((el, k) => {
      const on = k === i; el.classList.toggle('is-active', on);
      const v = el.querySelector('video');
      if (on) { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.addEventListener('error', () => { v.remove(); }, { once: true }); } v.play && v.play().catch(() => {}); }
      else { try { v.pause(); } catch (e) {} }
    });
    strip.style.transform = `translateX(${-i * 25.5}rem)`;
    [...strip.children].forEach((it, k) => it.classList.toggle('is-past', k < i));
  }
  function open() {
    if (busy) return; busy = true;
    const y = window.scrollY;
    dissolve(() => {
      viewer.classList.add('is-open'); viewer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; document.getElementById('nav').classList.add('is-hidden');
      go(0);
    }).then(() => { busy = false; });
    viewer._returnY = y;
  }
  function close(toCredits) {
    if (busy) return; busy = true;
    dissolve(() => {
      viewer.classList.remove('is-open'); viewer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; document.getElementById('nav').classList.remove('is-hidden');
      scenes.forEach(el => { const v = el.querySelector('video'); try { v.pause(); } catch (e) {} });
      if (toCredits) { const c = document.getElementById('credits'); window.scrollTo(0, c.getBoundingClientRect().top + window.scrollY); }
      else window.scrollTo(0, viewer._returnY || 0);
    }).then(() => { busy = false; });
  }
  function finish() { close(true); }

  playBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close(false));
  viewer.addEventListener('wheel', e => {
    e.preventDefault();
    const now = performance.now();
    if (now - wheelT > 900) wheelAcc = 0;
    wheelAcc += e.deltaY; wheelT = now;
    if (Math.abs(wheelAcc) > 120 && !busy) {
      const d = Math.sign(wheelAcc); wheelAcc = 0;
      if (d > 0) { if (cur === SCENES.length - 1) finish(); else go(cur + 1); }
      else if (cur > 0) go(cur - 1); else close(false);
      busy = true; setTimeout(() => { busy = false; }, 650);
    }
  }, { passive: false });
  window.addEventListener('keydown', e => {
    if (!viewer.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); cur === SCENES.length - 1 ? finish() : go(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); if (cur > 0) go(cur - 1); }
    else if (e.key === 'Escape') close(false);
  });
  let ty = null;
  viewer.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
  viewer.addEventListener('touchend', e => { if (ty == null) return; const dy = ty - e.changedTouches[0].clientY; ty = null; if (Math.abs(dy) < 40) return; dy > 0 ? (cur === SCENES.length - 1 ? finish() : go(cur + 1)) : (cur > 0 ? go(cur - 1) : close(false)); });
})();
