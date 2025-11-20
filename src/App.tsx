import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CareerHub from './components/CareerHub';
import Insights from './components/Insights';
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
      </Routes>
    </div>
  );
}

export default App;
