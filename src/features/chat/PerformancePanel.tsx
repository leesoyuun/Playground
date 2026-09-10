import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowDown, ArrowUp, Download, Play, Square } from 'lucide-react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { MessagePage } from './rfice/types';
import { ROOM_ID } from './mock/data';
import { useMockChat } from './mock/ChatProvider';

interface Sample {
  action: string;
  durationMs: number;
  loadedMessages: number;
  messageDOM: number;
  cachedEntries: number;
  apiRequests: { cursorId?: string; order: string; responseSize: number }[];
  totalDOM: number;
  frameSamples: number;
  frameP95Ms: number | null;
  maxFrameMs: number | null;
  framesOver50ms: number;
  longTasks: number | null;
  longestTaskMs: number | null;
  build: string;
  timestamp: string;
  mockMessages: number;
  configuredMessages: number;
  dataset: string;
  loadMode: string;
  viewport: { width: number; height: number; dpr: number };
  userAgent: string;
}
const listElement = () => document.querySelector<HTMLElement>('[data-testid="rfice-message-list"]');
function percentile(values: number[], fraction: number) { if (!values.length) return null; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.ceil(sorted.length * fraction) - 1]; }
export default function PerformancePanel() {
  const { server, actions } = useMockChat();
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [sample, setSample] = useState<Sample>();
  const [count, setCount] = useState(0);
  const cancel = useRef<() => void>();
  useEffect(() => {
    const id = setInterval(() => setCount(Number(listElement()?.dataset.loadedCount ?? 0)), 500);
    return () => { clearInterval(id); cancel.current?.(); };
  }, []);
  async function measure(action: string, update?: () => void, sweep = false, stream = false) {
    if (running) return;
    const element = listElement(); if (!element) return;
    setRunning(true);
    let stopped = false;
    let raf = 0;
    let streamTimer: ReturnType<typeof setInterval> | undefined;
    let started = 0;
    let last = 0;
    let endAt = 0;
    const frames: number[] = [];
    const tasks: number[] = [];
    const supportsLongTasks = PerformanceObserver.supportedEntryTypes.includes('longtask');
    const observer = supportsLongTasks ? new PerformanceObserver(entries => { for (const entry of entries.getEntries()) tasks.push(entry.duration); }) : undefined;
    function cleanup() { stopped = true; cancelAnimationFrame(raf); observer?.disconnect(); clearInterval(streamTimer); }
    cancel.current = cleanup;
    // Start after the panel's running state has painted, keeping setup out of the sample.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    if (stopped) return;
    observer?.observe({ type: 'longtask' });
    started = performance.now(); last = started; endAt = started + (stream ? 11000 : sweep ? 8000 : 1500);
    update?.();
    if (stream) {
      let received = 0;
      streamTimer = setInterval(() => {
        actions.receive(1); received++;
        if (received >= 100) clearInterval(streamTimer);
      }, 100);
    }
    function frame(now: number) {
      if (stopped) return;
      frames.push(now - last); last = now;
      if (sweep) {
        const progress = Math.min(1, (now - started) / 8000);
        // Four full-height traversals use RAF timestamps, so a blocked frame isn't hidden.
        const phase = (progress * 4) % 2;
        element!.scrollTop = (phase <= 1 ? 1 - phase : phase - 1) * (element!.scrollHeight - element!.clientHeight);
      }
      if (now < endAt) { raf = requestAnimationFrame(frame); return; }
      for (const entry of observer?.takeRecords() ?? []) tasks.push(entry.duration);
      const result: Sample = {
        action, durationMs: now - started,
        loadedMessages: Number(element!.dataset.loadedCount ?? 0),
        messageDOM: element!.querySelectorAll('[data-message-id]').length,
        cachedEntries: queryClient.getQueryData<InfiniteData<MessagePage>>(['useMessageList', ROOM_ID])?.pages.reduce((total, page) => total + page.content.length, 0) ?? 0,
        apiRequests: server.requests.map(request => ({ ...request })),
        totalDOM: element!.querySelectorAll('*').length,
        frameSamples: frames.length, frameP95Ms: percentile(frames, .95), maxFrameMs: frames.length ? Math.max(...frames) : null,
        framesOver50ms: frames.filter(value => value > 50).length,
        longTasks: supportsLongTasks ? tasks.length : null,
        longestTaskMs: supportsLongTasks ? Math.max(0, ...tasks) : null,
        build: import.meta.env.DEV ? 'development' : 'production', timestamp: new Date().toISOString(),
        mockMessages: server.messages.length, configuredMessages: server.count, dataset: server.kind, loadMode: 'paged',
        viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio }, userAgent: navigator.userAgent,
      };
      cleanup(); cancel.current = undefined; setSample(result); setRunning(false);
    }
    raf = requestAnimationFrame(frame);
  }
  function exportResult() {
    if (!sample) return;
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'rfice-chat-performance.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const ms = (value: number | null | undefined) => value == null ? '—' : `${value.toFixed(1)} ms`;
  return <aside className="perf-panel" aria-label="성능 측정">
    <h2><Activity size={17} /> 성능 측정 <span>{import.meta.env.DEV ? 'DEV' : 'PROD'}</span></h2>
    <div className="perf-count"><strong data-testid="loaded-count">{count.toLocaleString()}</strong><span>/ {server.messages.length.toLocaleString()}개 로드됨</span></div>
    <p>위로 스크롤하면 이전 대화를 40개씩 가져옵니다.<br />가상화 없음 · 로드한 메시지는 DOM에 누적</p>
    <p data-testid="mock-api-status">Mock API {server.requests.length}회 호출 · 최근 응답 {server.requests.at(-1)?.responseSize ?? 0}개</p>
    <div className="perf-buttons">
      <button disabled={running || !count} onClick={() => measure('100개 일괄 수신', () => actions.receive(100))}>메시지 100개 추가</button>
      <button disabled={running || !count} onClick={() => measure('10초 실시간 수신 (최대 100개)', undefined, false, true)}>10초 실시간 수신 · 초당 10개</button>
      <button disabled={running || !count} className="perf-primary" onClick={() => measure('8초 자동 스크롤', undefined, true)}><Play size={14} /> 8초 스크롤 측정</button>
      {running && <button onClick={() => { cancel.current?.(); cancel.current = undefined; setRunning(false); }}><Square size={13} /> 측정 중지</button>}
    </div>
    <div className="perf-jump"><button disabled={running} onClick={() => { const list = listElement(); if (list) list.scrollTop = 0; }}><ArrowUp size={14} /> 맨 위</button><button disabled={running} onClick={() => { const list = listElement(); if (list) list.scrollTop = list.scrollHeight; }}><ArrowDown size={14} /> 최신</button></div>
    <div className="perf-results" role="status"><strong>{running ? '측정 중… 탭을 그대로 유지해주세요.' : sample?.action ?? '동작을 선택하면 결과가 표시됩니다.'}</strong><dl><dt>프레임 간격 p95</dt><dd>{ms(sample?.frameP95Ms)}</dd><dt>최대 프레임 간격</dt><dd>{ms(sample?.maxFrameMs)}</dd><dt>50ms 초과 프레임</dt><dd>{sample?.framesOver50ms ?? '—'}</dd><dt>Long task 수</dt><dd>{sample ? sample.longTasks ?? '미지원' : '—'}</dd><dt>최장 Long task</dt><dd>{ms(sample?.longestTaskMs)}</dd><dt>메시지 DOM</dt><dd>{sample?.messageDOM.toLocaleString() ?? '—'}</dd><dt>캐시 메시지 항목</dt><dd>{sample?.cachedEntries.toLocaleString() ?? '—'}</dd><dt>목록 내부 DOM</dt><dd>{sample?.totalDOM.toLocaleString() ?? '—'}</dd></dl></div>
    <button className="perf-export" disabled={!sample || running} onClick={exportResult}><Download size={14} /> 결과 JSON 저장</button>
    <p className="perf-help">캐시 항목 수는 원본의 페이지별 중복 추가를 포함합니다. 실제 지연은 기기와 창 크기에 따라 달라집니다. 비교 측정은 production 빌드에서 같은 조건으로 실행해주세요. 프레임 간격은 requestAnimationFrame 기준이며 GPU FPS가 아닙니다.</p>
  </aside>;
}
