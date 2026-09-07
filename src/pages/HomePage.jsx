import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Asterisk, Layers, Pause, Play, X, MoveUpRight } from 'lucide-react';
import { experiments } from '../experiments';
export default function HomePage() {
  const [paused, setPaused] = useState(false);
  const [list, setList] = useState(false);
  return <main className={`home ${paused ? 'paused' : ''}`}>
    <div className="photo-background" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/playground.png)` }} /><div className="photo-shade" />
    <header className="home-header"><Link className="wordmark" to="/"><Asterisk size={30} strokeWidth={2.4} /> playground<span className="version">VOL. 01</span></Link><button className="glass-button" onClick={() => setList(!list)} aria-expanded={list}><Layers size={15} /> 모든 실험 <span className="count">{experiments.length.toString().padStart(2, '0')}</span></button></header>
    <section className="home-heading"><div className="eyebrow"><span className="green-dot" /> A PLACE FOR SMALL EXPERIMENTS</div><h1>일단, 놀아볼까요<span>?</span></h1><p>떠다니는 아이디어를 클릭하고, 나만의 기능을 실험해보세요.</p></section>
    <nav className="floating-experiments" aria-label="실험 페이지">
      {experiments.map(({ id, title, english, icon: Icon, color, position }, index) => <Link className={`experiment-orbit orbit-${id}`} to={`/${id}`} key={id} style={{ ...position, '--delay': `${index * -1.7}s` }}><span className={`floating-icon ${color}`}><Icon size={39} strokeWidth={1.7} /><span className="icon-arrow"><ArrowUpRight size={13} /></span></span><span className="floating-label">{title}<ArrowUpRight size={12} /></span><span className="floating-english">{english}</span></Link>)}
    </nav>
    <div className="scene-sticker"><span>TRY SOMETHING<br />JUST BECAUSE.</span><Asterisk size={25} /></div>
    {list && <aside className="experiment-list"><div className="list-heading">실험 둘러보기<button aria-label="목록 닫기" onClick={() => setList(false)}><X size={17} /></button></div>{experiments.map(({ id, title, description, icon: Icon, color }) => <Link to={`/${id}`} key={id}><span className={`mini-icon ${color}`}><Icon size={20} /></span><span><strong>{title}</strong><small>{description}</small></span><MoveUpRight size={16} /></Link>)}</aside>}
    <footer className="home-footer"><div><span className="footer-dot" /> NO RULES. JUST CURIOSITY.<small>완성하기 전, 마음껏 시도하는 공간.</small></div><div className="footer-controls"><span>아이콘을 눌러 실험실로 이동하세요</span><button className="glass-button pause-button" onClick={() => setPaused(!paused)} aria-label={paused ? '아이콘 움직임 재생' : '아이콘 움직임 멈추기'} title={paused ? '움직임 재생' : '움직임 멈추기'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></div></footer>
  </main>;
}
