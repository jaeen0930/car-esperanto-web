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

## 11-03 · 2차 피드백 반영
- 네비: 메뉴 사이 간격을 같게(flex, 오른쪽 6.4rem). 채원 단이 화면 위쪽 절반에 들어오면 네비를 숨긴다.
- 픽셀 전환(히어로 → 레벨 · Vision → CAR ESPERANTO · 크레딧 → Designers): 핀이 풀린 뒤 섹션이 올라가는 만큼 밴드가 차오르고(`CE.bandAfter`), 그 뒤에 다음 단 색의 빈 단(`.gapblk`)이 이어진다.
- 레벨: 지나간 줄은 왼쪽으로 빠지고, Level 5 다음에 Level 4 줄이 아래에서 한 번 더 올라와 커지며 Why Level 4.
- Everyone · Gap · Vision: sticky 로 겹쳐 쌓이고 다음 장면이 앞 장면을 덮는다(`js/std.js`). 사진은 아래에서 자라고 글은 줄 단위로.
- 3D 변환기: 섹션에는 썸네일(`assets/img/conv-thumb.jpg`)만, 누르면 전체 화면으로 열림(✕ · ESC, `js/converter.js`). 쿠페 뒤 엔진 뚜껑 메움(`capLid`), 마름모 · 도트 · 삼각 크기 키움, 카드에 '자리'(자동 / 차를 눌러 놓기).
- GUI: 사진은 멈추지 않고 흐르고 캡션만 sticky(아래 9.6rem). 04 · 05 · Vision 사진은 피그마 새 판으로 교체.
- 채원 단(V18): Pretendard · ABC Diatype, 배경 검정, 3D 장면(남색 → 검정 · 격자 어둡게 · 라벨 검정), 3D 단 끝에서 바깥 페이지로 스크롤이 이어짐, '직접 바꿔보세요' 띠는 `dotgrammar/index.html?embed=motion`(도트 그래머 변환기 v11 의 숨쉬기 모션 + 전체 격자).
- 방명록 버튼 → 키오스크 `https://car-esperanto-guestbook.netlify.app/kiosk.html?screen=both`.

## 11-03 저녁 · 3차
- 채원 단 그리드: 가운데 1248px 상자 → 다른 페이지와 같은 양옆 여백(6.4rem = 3.3333vw). 3D 장면 글 시작점도 같은 선.
- 3D 변환기: 재은이 준 새 판(`car-esperanto-web.html`, 11-3 · 가림막 · 영어 줄 · 레일 이름표 · 주문 문법 · 모델 압축)으로 교체하고, 쿠페 뚜껑 메움 · 도형 크기만 다시 얹음. 섹션 썸네일 새로, 닫기 버튼은 위 가운데 "✕ 닫기".
- 레벨: Level 5 는 왼쪽이 아니라 위로 올라가며 빠지고, 그 아래 Level 4 가 다시 올라와 커지며 Why Level 4.

## 11-04 4차 수정
- 픽셀 밴드: 칸 사이 회색 실선 · 남은 칸이 검은 줄처럼 남던 것 정리, 밴드가 화면 안에 온전히 있을 때 다 차도록 늦춤
- 레벨: Level 5 뒤 새 Level 4 줄 없앰 → 스택이 Level 4 로 되돌아간 뒤 그 줄이 커져 Why Level 4
- Everyone Speaks · Gap · Vision 사진 등장: 자라 오르기 → 조용히 떠오르기
- Vision: 사진 아래 흰 여백을 두고 검은 밴드는 그 여백에서 차오름
- 채원 단: 우리 네비를 투명 배경 글자로 유지, 단이 화면 맨 위에 맞기 전엔 안쪽이 스크롤되지 않게 맞춤
- 플레이그라운드: 띠 바깥 옅은 회색 격자 없앰
- 3D 변환기 단: 깔끔한 썸네일 + 흰 버튼 하나, 변환기 기본 대상 = 차량 · 기계
- 시나리오: 영상 대신 장면 이미지 8장(assets/img/scene-XX.jpg), 첫 화면 스틸 교체
- 엔딩 크레딧 배경 교체 (피그마 Frame 118/123)
