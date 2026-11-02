/* 푸터 모션 (car-esperanto-footer.html 11-2 판을 그대로 옮김): 글자는 카 에스페란토 도트 그래머(6 × 8 칸) 픽셀.
   클릭 → 흩어짐, 다시 클릭 → 떨어졌다가 글자로 모임, 커서가 점을 민다. 글자 위에 커서를 올리면 "CLICK". */
(function () {
  const canvas = document.getElementById('dots'); if (!canvas) return;
  const PX5 = CE.PX5;
  const TEXT = 'CAR ESPERANTO', HINT = 'CLICK';
  const CELL = { cols: 6, rows: 8 };
  const FILL = { oko: .95, rhomb: 1.14, circle: .8, tri: .96 };
  const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  function shapePath(p, kind, cx, cy, cs, f, up) {
    const h = cs / 2 * f;
    if (kind === 'circle') { p.moveTo(cx + h, cy); p.arc(cx, cy, h, 0, Math.PI * 2); }
    else if (kind === 'rhomb') { p.moveTo(cx, cy - h); p.lineTo(cx + h, cy); p.lineTo(cx, cy + h); p.lineTo(cx - h, cy); p.closePath(); }
    else if (kind === 'tri') { if (up) { p.moveTo(cx, cy - h); p.lineTo(cx + h, cy + h); p.lineTo(cx - h, cy + h); } else { p.moveTo(cx - h, cy - h); p.lineTo(cx + h, cy - h); p.lineTo(cx, cy + h); } p.closePath(); }
    else p.rect(cx - h, cy - h, h * 2, h * 2);
  }
  function lineCols(text) { return text.length * CELL.cols - 1; }
  function makeLayout(width, height) {
    const stacked = width < 760;
    const lines = stacked ? TEXT.split(' ') : [TEXT];
    const maxCols = Math.max(...lines.map(lineCols));
    const safeTop = height * 0.17;
    const availableHeight = Math.max(40, height - safeTop - 24);
    const gapRows = 1;
    const totalRows = CELL.rows * lines.length + gapRows * (lines.length - 1) - 1;
    const maxPitch = 1.55 * remPx();                       // 피그마 푸터: 글자 폭 ≈ 화면의 62%
    const pitch = Math.max(3, Math.min(maxPitch, Math.min((stacked ? width - 60 : width * .62) / maxCols, availableHeight / totalRows)));
    const blockH = totalRows * pitch;
    const top = Math.max(safeTop, (height - blockH) / 2 - height * .015);
    const points = [];
    lines.forEach((line, li) => {
      const left = (width - lineCols(line) * pitch) / 2;
      const y0 = top + li * (CELL.rows + gapRows) * pitch;
      [...line].forEach((ch, ci) => {
        const g = PX5[ch] || PX5['-'];
        const x0 = left + ci * CELL.cols * pitch;
        for (let j = 0; j < CELL.rows; j++) for (let i = 0; i < CELL.cols; i++) {
          const gi = ci * CELL.cols + i, gj = li * (CELL.rows + gapRows) + j;
          const on = j < 7 && i < 5 && g[j][i] === '#';
          const cx = x0 + (i + .5) * pitch, cy = y0 + (j + .5) * pitch;
          if (ch === ' ') continue;
          if (on) points.push({ x: cx, y: cy, up: (gi + gj) % 2 === 0 });
        }
      });
    });
    const bbox = { x0: Math.min(...points.map(p => p.x)) - pitch, y0: Math.min(...points.map(p => p.y)) - pitch, x1: Math.max(...points.map(p => p.x)) + pitch, y1: Math.max(...points.map(p => p.y)) + pitch };
    return { points, pitch, stacked, bbox };
  }
  function createParticles(points, random = Math.random) {
    return points.map((p, i) => ({ x: p.x, y: p.y, ax: p.x, ay: p.y, up: p.up, vx: 0, vy: 0, seed: random() * Math.PI * 2, shade: .55 + random() * .45, layer: random(), id: i }));
  }
  function nextActivation(mode) { return mode === 'rest' ? 'scatter' : mode === 'scatter' ? 'fall' : mode; }
  function scatterParticles(particles, width, height, random = Math.random) {
    for (const p of particles) {
      p.sx = width * (.06 + random() * .88);
      p.sy = height * (.27 + ((random() + random()) / 2) * .49);
      const a = random() * Math.PI * 2, v = 500 + random() * 700;
      p.vx += Math.cos(a) * v; p.vy += Math.sin(a) * v;
    }
  }
  function dropParticles(particles, random = Math.random) { for (const p of particles) { p.vx += (random() - .5) * 160; p.vy = random() * 80; } }
  function stepParticles(particles, dt, state) {
    const { width, height, mode, time, noise, pointer } = state;
    const radius = Math.min(130, Math.max(64, width * .085));
    const floor = height - 22;
    for (const p of particles) {
      let fx = 0, fy = 0;
      if (mode === 'fall') { fy = 3400; fx = Math.sin(time * 1.8 + p.seed) * 28; }
      else {
        const jitter = noise * (mode === 'gather' ? 0.35 : 1);
        const tx = (mode === 'scatter' ? p.sx : p.ax) + (Math.sin(time * 13 + p.seed) + Math.sin(time * 23 + p.seed * 3)) * .95 * jitter;
        const ty = (mode === 'scatter' ? p.sy : p.ay) + (Math.cos(time * 15 + p.seed * 2) + Math.sin(time * 19 + p.seed)) * .95 * jitter;
        const spring = mode === 'scatter' ? 34 : mode === 'gather' ? 26 : 70;
        fx = (tx - p.x) * spring; fy = (ty - p.y) * spring;
      }
      if (pointer.active) {
        let dx = p.x - pointer.x, dy = p.y - pointer.y;
        let distance = Math.hypot(dx, dy);
        if (distance < radius) {
          if (distance < .1) { dx = Math.cos(p.seed); dy = Math.sin(p.seed); distance = 1; }
          const force = (1 - distance / radius) ** 2 * (pointer.down ? 9000 : 4200);
          fx += dx / distance * force + (pointer.vx || 0) * Math.max(0, 1 - distance / radius) * 2.4;
          fy += dy / distance * force + (pointer.vy || 0) * Math.max(0, 1 - distance / radius) * 2.4;
        }
      }
      const damping = Math.exp(-(mode === 'fall' ? 1.0 : mode === 'gather' ? 8.5 : mode === 'scatter' ? 9 : 11) * dt);
      p.vx = (p.vx + fx * dt) * damping; p.vy = (p.vy + fy * dt) * damping;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (mode === 'fall') {
        const bed = floor - p.layer * (14 + 14 * (.5 + .5 * Math.sin(p.x * .018)));
        if (p.y > bed) { p.y = bed; p.vy = -Math.abs(p.vy) * .38; p.vx *= .92; }
        if (p.x < 5) { p.x = 5; p.vx = Math.abs(p.vx) * .5; }
        if (p.x > width - 5) { p.x = width - 5; p.vx = -Math.abs(p.vx) * .5; }
      }
    }
  }

  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const pointer = { active: false, down: false, x: -1000, y: -1000, vx: 0, vy: 0 };
  let width = 0, height = 0, particles = [], bbox = null, pitch = 5, shape = 'oko', mode = 'rest', modeTime = 0;
  let elapsed = 0, last = 0, accumulator = 0, raf = 0, press = null, hintA = 0, hover = false, tapped = false, running = false;
  const noise = .4;
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if ((w === width && h === height) || !w || !h) return;
    width = w; height = h;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const layout = makeLayout(width, height); pitch = layout.pitch; bbox = layout.bbox; particles = createParticles(layout.points);
    if (mode === 'scatter') scatterParticles(particles, width, height); else { mode = 'rest'; modeTime = 0; }
    draw();
  }
  function activate() {
    const next = nextActivation(mode);
    if (next === mode) return;
    mode = next; modeTime = 0; tapped = true;
    if (mode === 'scatter') scatterParticles(particles, width, height);
    else { dropParticles(particles); pointer.active = false; }
  }
  function updateHover() {
    if (!pointer.active || mode === 'fall' || mode === 'gather') { hover = false; return; }
    if (mode === 'rest' && bbox) { hover = pointer.x > bbox.x0 && pointer.x < bbox.x1 && pointer.y > bbox.y0 && pointer.y < bbox.y1; return; }
    const r = Math.max(28, pitch * 2.5); let near = false;
    for (const p of particles) { if (Math.abs(p.x - pointer.x) < r && Math.abs(p.y - pointer.y) < r) { near = true; break; } }
    hover = near;
  }
  function drawHint(alpha) {
    if (alpha <= .01) return;
    ctx.font = `500 ${Math.round(1.0 * remPx())}px "Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const spaced = [...HINT].join(String.fromCharCode(8202));
    const w = ctx.measureText(spaced).width, h = 12;
    let x0, y0;
    if (coarse.matches && !pointer.active) { x0 = (width - w) / 2; y0 = (bbox ? bbox.y1 : height * .7) + 18; }
    else { x0 = pointer.x + 16; y0 = pointer.y + 18; if (x0 + w > width - 12) x0 = pointer.x - w - 16; if (y0 + h > height - 12) y0 = pointer.y - 18; }
    ctx.globalAlpha = alpha * .9; ctx.fillStyle = '#ffffff'; ctx.fillText(spaced, x0, y0); ctx.globalAlpha = 1;
  }
  function draw() {
    ctx.fillStyle = '#080808'; ctx.fillRect(0, 0, width, height);
    const tick = Math.floor(elapsed * 8), j = reduced.matches ? 0 : noise;
    for (let batch = 0; batch < 4; batch++) {
      ctx.fillStyle = ['#d9dce0', '#e8eaed', '#f5f6f8', '#ffffff'][batch]; ctx.beginPath();
      for (const p of particles) {
        const flicker = j * Math.sin(p.seed * 7 + tick * 1.7) * .15;
        if (Math.min(3, Math.max(0, Math.floor((p.shade + flicker - .4) * 6))) !== batch) continue;
        const x = p.x + Math.sin(p.seed * 13 + tick * 2.3) * j * .75;
        const y = p.y + Math.cos(p.seed * 9 + tick * 1.9) * j * .75;
        shapePath(ctx, shape, x, y, pitch, FILL[shape], p.up);
      }
      ctx.fill();
    }
    drawHint(hintA);
  }
  function update(dt) {
    elapsed += dt; modeTime += dt;
    if (mode === 'fall' && modeTime > 0.9) { mode = 'gather'; modeTime = 0; }
    if (mode === 'gather' && modeTime > 1.9) { mode = 'rest'; modeTime = 0; }
    stepParticles(particles, dt, { width, height, mode, time: elapsed, noise: reduced.matches ? 0 : noise, pointer });
    pointer.vx *= .85; pointer.vy *= .85;
    updateHover();
    const hTarget = hover || (coarse.matches && !tapped && mode === 'rest') ? 1 : 0;
    hintA += (hTarget - hintA) * Math.min(1, dt * 10);
    canvas.classList.toggle('hot', hover);
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    accumulator += Math.min((now - last) / 1000, .05); last = now;
    while (accumulator >= 1 / 120) { update(1 / 120); accumulator -= 1 / 120; }
    draw();
  }
  function move(event) {
    const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left, y = event.clientY - rect.top;
    pointer.vx = pointer.active ? Math.max(-900, Math.min(900, (x - pointer.x) * 15)) : 0;
    pointer.vy = pointer.active ? Math.max(-900, Math.min(900, (y - pointer.y) * 15)) : 0;
    pointer.x = x; pointer.y = y; pointer.active = true;
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 9) press.dragged = true;
  }
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerdown', event => { if (event.button !== 0) return; move(event); pointer.down = true; press = { x: event.clientX, y: event.clientY, dragged: false }; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointerup', event => { const wasTap = press && !press.dragged; press = null; pointer.down = false; if (wasTap) activate(); if (event.pointerType !== 'mouse') pointer.active = false; });
  canvas.addEventListener('pointercancel', () => { press = null; pointer.down = false; pointer.active = false; });
  canvas.addEventListener('pointerleave', () => { if (!pointer.down) pointer.active = false; });
  window.addEventListener('blur', () => { press = null; pointer.active = false; pointer.down = false; });
  canvas.addEventListener('keydown', event => { if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) { event.preventDefault(); activate(); } });
  // 보일 때만 돌린다
  const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); } else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); } }); }, { threshold: 0.05 });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); last = 0; } else if (running) { last = 0; raf = requestAnimationFrame(frame); } });
  new ResizeObserver(resize).observe(canvas.parentElement); resize();
})();
