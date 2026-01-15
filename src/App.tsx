import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CareerHub from './components/CareerHub';
import Insights from './components/Insights';
import Readiness from './components/Readiness';
import SkillsReadiness from './components/SkillsReadiness';
import FuturePlanning from './components/FuturePlanning';
import AIAugmentation from './components/futurePlanning/AIAugmentation';
import ConversationalChat from './components/ConversationalChat';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path="/" element={<CareerHub />} />
        <Route path="/career-hub" element={<CareerHub />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/chat" element={<ConversationalChat />} />
        <Route path="/readiness" element={<Readiness />} />
        <Route path="/readiness/skills" element={<SkillsReadiness />} />
        <Route path="/readiness/future-planning" element={<FuturePlanning />} />
        <Route path="/readiness/future-planning/ai-augmentation" element={<AIAugmentation />} />
      </Routes>
    </div>
  );
}

export default App;
