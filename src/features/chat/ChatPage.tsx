import { useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { Hash, RotateCcw, Users } from 'lucide-react';
import { MockChatProvider } from './mock/ChatProvider';
import type { DatasetKind } from './rfice/types';
import { theme } from './rfice/primitives';
import MessageList from './rfice/MessageList';
import PerformancePanel from './PerformancePanel';
import MessageComposer from './MessageComposer';
import './chat.css';
export default function ChatPage() {
  const [count, setCount] = useState(2000);
  const [kind, setKind] = useState<DatasetKind>('mixed');
  const [generation, setGeneration] = useState(0);
  return <div className="rfice-lab">
    <div className="rf-test-options"><label>Mock 메시지<select aria-label="Mock 메시지 수" value={count} onChange={event => setCount(Number(event.target.value))}><option value={40}>40개</option><option value={500}>500개</option><option value={2000}>2,000개</option><option value={5000}>5,000개</option></select></label><label>메시지 구성<select aria-label="메시지 구성" value={kind} onChange={event => setKind(event.target.value as DatasetKind)}><option value="mixed">혼합 · 이미지 / 서식 / 답장</option><option value="text">텍스트만</option></select></label><button aria-label="대화 초기화" onClick={() => setGeneration(value => value + 1)}><RotateCcw size={15} /> 초기화</button></div>
    <ThemeProvider theme={theme}><MockChatProvider key={`${count}-${kind}-${generation}`} count={count} kind={kind}>
      <div className="rf-workspace"><section className="rf-chat" aria-label="rfice 채팅 성능 테스트"><header className="rf-chat-header"><Hash size={23} /><div><h2>프로젝트 라운지</h2><p>rfice 메시지 목록 · mock 데이터</p></div><span><Users size={15} /> 5</span></header><MessageList roomID="rfice-performance-room" variant="fullSize" isMyRoom={false} /><MessageComposer /></section><PerformancePanel /></div>
    </MockChatProvider></ThemeProvider>
    <details className="rf-scope"><summary>이식 범위와 측정 조건</summary><p>rfice-zero의 full-size 메시지 경로를 이식했습니다. Message의 JSON 파싱·memo 비교, 리치텍스트 렌더러, 40개 페이지 누적, 비가상화 목록, 날짜/작성자 그룹 판정 및 스크롤 감지를 유지합니다. 처음에는 최신 40개만 요청하고, 위로 스크롤하면 커서 기반 mock API를 호출해 이전 메시지를 최대 40개씩 추가합니다. 전체 데이터는 mock 서버에만 보관합니다.</p><p>서버·사용자·첨부 파일은 로컬 mock입니다. 채팅 항목의 서비스 연동 및 일부 UI, 디자인 시스템, 입력창은 어댑터로 대체했습니다. Quill 입력·통화·투표·게임·실서버·전체 rfice 앱의 부하는 포함하지 않으므로 원본 앱 전체의 성능 수치와 동일하지 않습니다.</p><p>측정 중에는 탭과 창 크기를 유지하세요. 개발 모드는 StrictMode와 개발 코드의 영향을 받습니다. production 비교: <code>npm run build &amp;&amp; npm run preview -- --port 5180</code></p></details>
  </div>;
}
