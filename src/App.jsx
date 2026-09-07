import { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { experiments } from './experiments';
import HomePage from './pages/HomePage';
import ExperimentLayout from './components/ExperimentLayout';
export default function App() {
  return <Suspense fallback={<div className="loading">실험실을 여는 중…</div>}><Routes>
    <Route path="/" element={<HomePage />} />
    {experiments.map(({ id, component: Component, ...experiment }) => <Route key={id} path={`/${id}`} element={<ExperimentLayout experiment={{ id, ...experiment }}><Component /></ExperimentLayout>} />)}
    <Route path="*" element={<div className="not-found"><h1>아직 없는 실험실이에요.</h1><Link to="/">놀이터로 돌아가기 →</Link></div>} />
  </Routes></Suspense>;
}
