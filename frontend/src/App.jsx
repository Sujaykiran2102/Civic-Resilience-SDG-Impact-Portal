// frontend/src/App.jsx
import { useState } from 'react';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';

function App() {
  // State to trigger dashboard refreshes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to increment the trigger
  const handleReportSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          UNDP <span className="text-blue-600">Impact</span> Portal
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Crowdsourcing civic resilience and aligning local action with global goals.
        </p>
      </header>
      
      <main className="space-y-12">
        <ReportForm onReportSubmitted={handleReportSubmitted} />
        
        <Dashboard refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default App;