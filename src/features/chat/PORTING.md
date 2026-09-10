# rfice 메시지 누적 성능 실험

## 기준 소스

- 로컬 `rfice-zero`, 커밋 `06d5222a2d3d8bd4d742db685fcf59757ecb6fd6`.
- full-size 채팅의 일반 리치텍스트 메시지 경로를 대상으로 한다.
- 파일별 원본 경로와 SHA-256은 `rfice/provenance.json`에 기록했다. 원본의 저작권 고지를 유지했다.
- `*.source.txt`는 변경 범위 비교용 원본이며 앱 번들에 포함하지 않는다.

## 유지한 처리

| 원본 | Playground |
| --- | --- |
| Common/MessageList/private/components/Message | `rfice/Message.tsx`: 원본 JSON.parse, memo 비교 함수, mount/scroll effects, 조건부 렌더링. import/type만 연결 변경 |
| Chat/ChatRenderer | `rfice/ChatRenderer.tsx`: formatRichText, 파일 분류/필터, RenderItem 반복, 중첩 파일 렌더 경로 유지. 디자인 컴포넌트와 파일 서비스는 어댑터 |
| RenderItem, Text, Section, List, BlockQuote, CodeBlock | 원본 JSX/파싱/스타일 코드 사용. Section의 css prop을 style로 연결 |
| Each, Maybe, Choice | 원본 사용. Each.useArray의 Children.toArray 비용도 유지 |
| checkIsMessageGroup | 원본 판정 유지. Utility.getDayDiff의 **숫자 분 차이**도 그대로 구현. 잘못되어 보이더라도 기준 버전에서 최적화하지 않는다 |
| useHasScroll, useScrollButtonState, useIntersectionObserver | 원본 훅 사용. ref/type만 변경 |
| useMessageList | React Query 4 infinite pages → flatMap → filter → ID record → 목록 렌더 시 Object.values.sort. 40개 커서 로딩 유지 |
| useMessageListHandler.messageSent | Immer produce 내부에서 **모든 페이지**에 새 메시지를 추가하는 원본 non-thread 처리 유지. 이후 ID record에서 중복 제거 |
| Common/MessageList | 원본 컴포넌트 전체 사용. import/type, mock hook 연결, 측정용 data 속성만 변경. 전체 DOM 누적, 매 렌더 정렬, 500ms debounce, scrollHeight 보정, 마지막 행 observer, 새 메시지/하단 이동, ResizeObserver 유지 |

원본 로컬 레포에 실제 설치된 React 18.3.1, React DOM 18.3.1, Emotion React 11.11.1 / styled 11.14.1, React Query 4.42.0, html-react-parser 5.2.10, lodash-es 4.17.21, marked 11.2.0, Zustand 5.0.9, Immer 9.0.21을 고정했다. Playground의 다른 실험도 React 18에서 검증한다.

## 어댑터와 차이

전체 rfice 앱을 그대로 실행하는 환경은 아니다. 목록 부하를 비교할 수 있도록 렌더링 경로를 분리했으며 다음 비용은 원본과 다르다.

- REST/STOMP, 인증, 재접속, 번역, 읽음 서버 요청 → 메모리 mock 및 Query cache 갱신. 인위적인 네트워크 지연 없음.
- 사용자 정보 → 5명짜리 Zustand mock. ChatItem의 사용자/로컬 메시지 구독과 편집 이벤트 구독은 유지.
- ChatItem / 내부 Message → 원본의 memo/forwardRef와 일반 메시지 구성(사용자, 답장, 렌더러, hover actions, 반응)을 연결하는 로컬 어댑터. 전체 원본 서비스 hooks 및 팝오버 시스템의 비용까지 같지는 않음.
- 디자인 시스템 → Emotion 기반 레이아웃/타이포 어댑터. 원본 full-size 행의 패딩·들여쓰기·메시지 중첩 구조를 유지하지만 스타일 전체가 같지는 않음.
- 이미지·파일·링크 카드 → 로컬 SVG 및 mock 파일 정보. 원본 미디어 뷰어, 다운로드, 이미지 리사이즈 서버, 실제 파일 디코딩 비용 제외.
- 입력창 → textarea. Quill 입력 처리, 에디터 확장, 업로드 비용 제외.
- 통화/투표/게임/스레드/검색 이동/투명 채팅 분기 제외. mock은 일반 richtext 메시지로 구성.
- 이전 페이지 보정·effect 타이밍은 원본 그대로다. mock에서 검색/재접속/서버 읽음 이벤트는 발생시키지 않으며 해당 서비스 어댑터는 기본 상태를 반환한다.
- React Query reconnect refetch는 mock에서 비활성화.
- 최초 Query cache는 비어 있다. 비동기 `MockChatServer.fetchMessages(cursor, signal)` 호출마다 최대 40개를 복제해 응답한다. 다음 커서가 없으면 추가 요청하지 않는다. 전체 데이터 prefill이나 일괄 로드 경로는 없다.

**결과는 이 이식 환경의 측정값이며 원본 앱 전체의 절대 성능과 동일하다고 해석하지 않는다.** 이 브랜치를 개선 전 기준으로 두고 가상화 등의 개선을 별도 브랜치에서 비교할 수 있다.

## 데이터와 실행

`/chat`의 mock 서버는 기본 2,000개의 혼합 메시지를 보관하고, 화면은 최신 40개로 시작한다. 위로 스크롤하면 커서 기반 mock API를 호출해 이전 메시지를 40개씩 추가한다. 난수를 쓰지 않으므로 새로고침/초기화 후 같은 데이터가 생성된다. 서버 데이터 개수(40 / 500 / 2,000 / 5,000개)와 텍스트 / 혼합 구성을 선택할 수 있다. 혼합 데이터는 멘션, 서식, 여러 줄, 목록, 코드, 인용, 답장, 반응, 이미지/파일을 포함한다. 원본 서비스로 요청하지 않는다.

```bash
nvm use 22
npm ci
npm run build
npm run preview -- --port 5180
```

http://localhost:5180/chat 에서 같은 브라우저·뷰포트·기기 조건으로 비교한다. `npm run dev`는 기능 확인용이며 StrictMode/HMR/dev 경고가 성능에 영향을 준다.

1. 처음 표시되는 최신 40개에서 위로 스크롤하여 80 → 120 → … → 2,000개까지 누적하며 스크롤과 입력을 확인. 마지막 페이지는 남은 개수만 반환한다.
2. `8초 스크롤 측정`: 왕복 자동 스크롤 동안 프레임 간격과 long tasks 기록.
3. `메시지 100개 추가`: 한 번에 100개 캐시 갱신. 동기 burst이므로 100회의 별도 화면 갱신을 의미하지 않는다.
4. `10초 실시간 수신`: 100ms 간격으로 한 개씩, 최대 100개 수신. 브라우저가 지연되면 실제 수신량이 적을 수 있으며 실제 DOM/캐시 수를 보고한다.
5. 패널의 Mock API 호출 횟수와 최근 응답 개수로 페이지 요청을 확인. 초기화하면 다시 최신 40개부터 시작한다.
6. `결과 JSON 저장`: 측정값과 데이터 구성/빌드/viewport/userAgent 저장.

새로 수신/전송한 mock 메시지는 원본 STOMP payload처럼 clientMessageId를 포함하므로 record 변환 시 기존 로컬 메시지 검색 경로도 실행된다. 세션 교체 시 이전 Query cache는 정리한다.

새 메시지 100개를 받은 50페이지 상태에서는 DOM이 2,100개여도 캐시 항목은 7,000개가 된다. 이것은 원본의 모든 페이지에 추가하는 처리에 따른 결과이며, 중복 제거는 record 변환 단계에서 일어난다.

## 측정값

- 프레임 간격 p95 / 최대 / 50ms 초과: requestAnimationFrame timestamp 차이. 실제 GPU FPS 또는 정확한 dropped-frame 수가 아님.
- Long task: PerformanceObserver 지원 브라우저에서 측정. 미지원은 0이 아닌 `null`/미지원 표시.
- 메시지 DOM, 목록 내부 DOM, 캐시 항목 수: 실제 실행 상태를 조회. JSON에 mock API의 커서·응답 개수·요청 순서를 함께 저장.
- 제어 패널 상태 업데이트와 DOM 개수 조회는 스크롤 측정 루프 밖에서 수행. 패널의 500ms count polling은 목록을 다시 렌더하지 않음.
- 1,500ms 구간은 일괄 수신 버튼 클릭 이후를 측정. 자동 스크롤은 8초, 실시간 수신은 11초 관측. 초기 페이지 mount/render 시간은 별도 지표로 제공하지 않음.
- 성능 숫자에 고정 pass/fail 기준을 두지 않는다. 테스트는 초기 40 DOM, 40 → 80 → 120 페이지 누적, API 50회로 2,000개 순회 및 마지막 페이지 처리, 중복 캐시, scroll anchor, 입력/답장/수정/삭제, mock 요청, 측정/다운로드 동작을 검증한다.
