import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Asterisk, Search, LayoutGrid, List, X } from 'lucide-react';
import { experiments } from '../experiments';

const categories = ['전체', '인터페이스', '생산성'] as const;
const categoryFor = (id: string) => id === 'chat' ? '인터페이스' : '생산성';
const tags: Record<string, string[]> = { chat: ['Conversation', 'Interaction'], notes: ['Local storage', 'Editor'], timer: ['State', 'Interaction'] };

function Preview({ id }: { id: string }) {
  return <div className={`card-preview preview-${id}`} aria-hidden="true">
    <span className="preview-label">{id === 'chat' ? 'LET’S TALK' : id === 'notes' ? 'A LITTLE THOUGHT' : 'MAKE TIME'}</span>
    {id === 'chat' ? <div className="chat-art"><div className="art-message"><span className="art-avatar"><Asterisk size={18} /></span><span>작은 아이디어 하나 있어요.</span></div><div className="art-reply">좋아요, 일단 만들어볼까요? <span>↗</span></div><div className="art-typing"><i /><i /><i /></div></div>
      : id === 'notes' ? <div className="note-art"><span className="note-tape" /><span className="note-art-date">NOTE TO SELF — 001</span><strong>생각은 가볍게,<br />가능성은 무한하게.</strong><div className="note-art-check">✓ &nbsp; 일단 적어보기</div><span className="note-scribble">a work in progress ✳</span></div>
      : <div className="timer-art"><div className="timer-art-ring"><span>FOCUS SESSION</span><strong>05<span>:</span>00</strong><div className="timer-art-play">▶</div></div><span className="timer-art-caption">A SMALL MOMENT OF FOCUS</span></div>}
    <span className="preview-corner">{id === 'chat' ? 'Aa / 01' : id === 'notes' ? 'Aa / 02' : '00 / 03'}</span>
  </div>;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('전체');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const filtered = experiments.filter(item => (category === '전체' || categoryFor(item.id) === category) && `${item.title} ${item.english} ${item.description} ${tags[item.id]?.join(' ') ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <main className="home home-main">
      <section className="collection" aria-labelledby="collection-title">
        <div className="collection-heading"><h1 id="collection-title">실험 모음 <span>{String(experiments.length).padStart(2, '0')}</span></h1></div>
        <div className="collection-toolbar"><div className="category-tabs" role="group" aria-label="실험 분류">{categories.map(value => <button key={value} aria-pressed={category === value} className={category === value ? 'selected' : ''} onClick={() => setCategory(value)}>{value}{value === '전체' && <span>{experiments.length}</span>}</button>)}</div><div className="collection-controls"><div className="search-field"><Search size={16} /><input aria-label="실험 검색" placeholder="어떤 실험을 찾으세요?" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="검색 지우기" onClick={() => setQuery('')}><X size={14} /></button>}</div><div className="view-toggle" role="group" aria-label="보기 방식"><button aria-label="카드 보기" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={17} /></button><button aria-label="목록 보기" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={18} /></button></div></div></div>
        <nav className={`experiment-cards ${view === 'list' ? 'list-view' : ''}`} aria-label="실험 페이지">{filtered.map(({ id, title, english, description, icon: Icon }) => <Link to={`/${id}`} className="experiment-card" key={id}><Preview id={id} /><div className="card-content"><div className="card-meta"><span><Icon size={12} /> {categoryFor(id)}</span><span className="ready-label"><i /> 실행 가능</span></div><div className="card-title"><h2>{title}<span>{english}</span></h2><span className="card-arrow"><ArrowUpRight size={21} /></span></div><p>{description}</p><div className="card-bottom"><div className="card-tags">{tags[id]?.map(tag => <span key={tag}>{tag}</span>)}</div><span className="card-number">/{String(experiments.findIndex(item => item.id === id) + 1).padStart(2, '0')}</span></div></div></Link>)}</nav>
        {filtered.length === 0 && <div className="empty-state" role="status"><Search size={26} /><h3>일치하는 실험이 없어요.</h3><p>다른 검색어나 분류로 다시 찾아보세요.</p><button onClick={() => { setQuery(''); setCategory('전체'); }}>모든 실험 보기 <ArrowRight size={15} /></button></div>}
      </section>
    </main>;
}
