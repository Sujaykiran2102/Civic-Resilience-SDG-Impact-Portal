// frontend/src/App.jsx
import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import CrisisMap from './components/CrisisMap';
import AdminPanel from './components/AdminPanel';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReportSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <Link to="/" className="text-4xl font-extrabold text-gray-900 tracking-tight hover:text-blue-600 transition-colors">
            UNDP <span className="text-blue-600">Impact</span> Portal
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Crowdsourcing civic resilience and aligning local action with global goals.
          </p>
        </div>
        <Link to="/admin" className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-md">
          Operator Access
        </Link>
      </header>
      
      <Routes>
        {/* Public Route: The Submission Form, Map, and Analytics */}
        <Route path="/" element={
          <main className="space-y-12 max-w-6xl mx-auto">
            <ReportForm onReportSubmitted={handleReportSubmitted} />
            <CrisisMap refreshTrigger={refreshTrigger} />
            <Dashboard refreshTrigger={refreshTrigger} />
          </main>
        } />
        
        {/* Private Route: The JWT Protected Admin Dashboard */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default App;