import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, FlaskConical } from 'lucide-react';
import { experiments } from '../experiments';
export default function ExperimentLayout({ experiment, children }) {
  return <div className="lab"><header className="lab-header"><Link to="/" className="back-link"><ArrowLeft size={16} /> 놀이터</Link><span className="lab-breadcrumb">/ <strong>{experiment.english}</strong></span><nav aria-label="다른 실험">{experiments.map(({ id, title }) => <NavLink to={`/${id}`} key={id}>{title}</NavLink>)}</nav></header><main className="lab-main"><div className="lab-title"><div><div className="lab-eyebrow"><FlaskConical size={13} /> EXPERIMENT / {experiment.id.toUpperCase()}</div><h1>{experiment.title} 실험실<span>IN PROGRESS</span></h1><p>{experiment.description}</p></div><Link to="/" className="text-link">다른 실험 둘러보기 <ArrowUpRight size={14} /></Link></div>{children}</main><footer className="lab-footer">작게 만들고, 자유롭게 바꾸고, 마음껏 실험하세요.<span>PLAYGROUND / VOL. 01</span></footer></div>;
}
