# CAR ESPERANTO · 전시 웹사이트

2026 Mobility UX · 디그리 5조 (정재은 × 김채원). 피그마 `✳︎ AIDV` 파일 Page 29 「웹사이트 만들기」를 그대로 옮긴 정적 사이트.

## 폴더

```
index.html          한 페이지 전체 (히어로 → … → 푸터)
css/site.css        모든 스타일. 피그마 값(3840 기준) ÷ 20 = rem  (1rem = 10px @1920)
js/
  pixelfont.js      카 에스페란토 도트 글꼴(5×7) · CEP 로고 SVG
  pixelband.js      픽셀 밴드 전환 (Kalkbrenner 식)
  hero.js           CAR ▭ ESPERANTO 상자 확대 → AIDV
  levels.js         자율주행 레벨 journey (0→5→4→Why Level 4)
  gui.js            Passenger Interaction 고정 캡션 (Polestar 식)
  scenario.js       Play → 픽셀 디졸브 → 시나리오 뷰어 8장면
  credits.js        엔딩 크레딧 롤 (siena 식, 스크롤 연동)
  footer.js         푸터 도트 모션 (클릭 흩어짐)
  main.js           네비 색 전환 · 앵커 · 사운드
  vendor/           gsap · ScrollTrigger
assets/img/         피그마에서 받은 이미지·SVG
assets/fonts/       PretendardVariable · ABCDiatypeVariable-Trial
assets/video/       더미 영상 (scene-01~08.mp4, hero.mp4) → 진짜 영상으로 교체
chaewon/index.html  채원 섹션 (CarEsperanto_V18_1) — iframe
converter/index.html 통합 3D 변환기 — iframe
```

## 자주 고치는 것

- **글 수정**: `index.html` 안에서 바로 고치면 된다. 레벨 설명은 `js/levels.js` 의 `LEVELS`, 시나리오 글은 `js/scenario.js` 의 `SCENES`.
- **영상 넣기**: `assets/video/scene-01.mp4 … scene-08.mp4` 를 같은 이름으로 바꿔 넣으면 끝. 히어로는 `index.html` 의 `#hero-box` 안 `<img class="clip">` 를 `<video class="clip" src="assets/video/hero.mp4" autoplay muted loop playsinline>` 로 바꾼다.
- **게스트북 링크**: `index.html` 의 `#guestbook-link`.
- **채원 섹션·3D 변환기 교체**: `chaewon/index.html`, `converter/index.html` 파일만 바꿔 넣는다.

## 로컬에서 보기

```
cd 웹사이트
python3 -m http.server 8000
# → http://localhost:8000
```
(파일을 더블클릭으로 열면 iframe·폰트가 막힐 수 있으니 서버로 연다.)

## 배포 (Netlify ← GitHub)

1. 이 폴더가 GitHub 저장소 `car-esperanto-web` 의 루트.
2. Netlify → Add new site → Import from Git → 이 저장소 선택. Build command 없음, Publish directory `.`
3. 이후엔 파일을 고치고 `git push` 만 하면 1분 안에 반영된다.
4. 도메인 `cep.ai.kr`: Netlify Site → Domain management → Add domain → 안내대로 DNS 에 CNAME 추가.
