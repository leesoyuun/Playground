# Playground

PoC 예시를 모아 실행하는 실험 모음입니다. 새 기능은 `CLAUDE.md`에 따라 전용 브랜치에서 작업합니다.

## 채팅 성능 실험

`/chat`에서 rfice-zero의 메시지 렌더링 경로에 mock 메시지 2,000개를 누적해 스크롤과 입력 성능을 확인합니다. 실제 백엔드 없이 동작합니다. mock 서버에 2,000개를 보관하고, 처음에는 최신 40개만 가져옵니다. 위로 스크롤할 때마다 API를 호출해 이전 메시지 40개씩 누적합니다.

```bash
nvm use 22
npm ci
npm run dev -- --port 5179
```

기능 확인: http://localhost:5179/chat

성능 비교는 production 빌드로 실행합니다.

```bash
npm run build
npm run preview -- --port 5180
```

성능 확인: http://localhost:5180/chat

메시지 개수/구성을 선택하고, 스크롤 측정·100개 추가·실시간 수신을 실행한 뒤 결과 JSON을 저장할 수 있습니다. 초기화하면 동일한 mock 데이터로 돌아갑니다.

원본에서 유지한 코드와 대체한 서비스/입력창, 측정값의 범위는 [채팅 이식 문서](src/features/chat/PORTING.md)를 참고하세요. 원본 앱 전체의 부하와 동일한 수치로 해석하지 않습니다.

## 배포

GitHub Pages 주소: https://leesoyuun.github.io/Playground/

`main`에 push하면 GitHub Actions가 빌드하고 배포한다. Pages용 빌드는 `npm run build:pages`로 실행한다. 배포 환경은 HashRouter를 사용하므로 채팅 주소는 `/Playground/#/chat`이며 새로고침과 직접 접근을 지원한다. 로컬 개발은 기존 `/chat` 경로를 사용한다.

## 개발 환경

React + TypeScript + Vite를 사용한다. 소스는 `.tsx` / `.ts`로 작성하며 strict 타입 검사를 적용한다. `npm run typecheck`로 검사하고, 일반 빌드와 Pages 배포 빌드에서도 타입 검사를 실행한다.
