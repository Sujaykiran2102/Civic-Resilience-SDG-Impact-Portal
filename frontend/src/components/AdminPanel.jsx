// frontend/src/components/AdminPanel.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, LogOut, CheckCircle, XCircle } from 'lucide-react';

const AdminPanel = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports`);
      setReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { username, password });
      const receivedToken = response.data.token;
      setToken(receivedToken);
      localStorage.setItem('adminToken', receivedToken);
      setError('');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/reports/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state to reflect change instantly
      setReports(reports.map(r => r._id === id ? { ...r, verificationStatus: newStatus } : r));
    } catch (err) {
      alert('Failed to update status. Token may be expired.');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-md border-t-4 border-gray-800">
        <div className="flex items-center justify-center mb-6 text-gray-800">
          <ShieldCheck size={32} className="mr-2" />
          <h2 className="text-2xl font-bold">Operator Login</h2>
        </div>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            required
            className="w-full p-3 border border-gray-300 rounded focus:ring-gray-800 focus:border-gray-800"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 border border-gray-300 rounded focus:ring-gray-800 focus:border-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-gray-800 text-white font-bold py-3 rounded hover:bg-gray-900 transition-colors">
            Secure Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center">
          <ShieldCheck className="text-green-600 mr-2" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Crisis Triage Operations</h2>
        </div>
        <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-800 font-semibold">
          <LogOut size={18} className="mr-1" /> Logout
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3">SDG / Severity</th>
              <th className="px-4 py-3">Translated Report</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-4">
                  <span className="block font-bold">SDG {report.sdgCategory}</span>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${
                    report.severityLevel === 'Critical' ? 'bg-red-600' : report.severityLevel === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {report.severityLevel}
                  </span>
                </td>
                <td className="px-4 py-4 max-w-xs truncate" title={report.translatedText}>
                  {report.translatedText}
                </td>
                <td className="px-4 py-4 font-semibold text-gray-700">
                  {report.verificationStatus}
                </td>
                <td className="px-4 py-4 flex space-x-2">
                  <button 
                    onClick={() => updateStatus(report._id, 'Resolved')}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    <CheckCircle size={16} className="mr-1" /> Resolve
                  </button>
                  <button 
                    onClick={() => updateStatus(report._id, 'Rejected')}
                    className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <XCircle size={16} className="mr-1" /> Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;