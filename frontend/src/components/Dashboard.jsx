import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Activity } from 'lucide-react';
import { getSdgColor } from '../utils/sdgColors';

const Dashboard = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/reports/analytics`);
        
        const formattedData = response.data.map(item => ({
          name: `SDG ${item.sdgCategory}`,
          sdgNumber: item.sdgCategory, // Store the raw number for the color map
          Total: item.count,
          Critical: item.criticalSeverityCount,
          High: item.highSeverityCount
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading) return <div className="text-center p-10 text-gray-600">Loading analytics...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center mb-6">
        <Activity className="text-blue-600 mr-3" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Civic Resilience & SDG Impact Analytics</h2>
      </div>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {/* The main Total bar now maps exactly to the UN SDG Hex palette */}
            <Bar dataKey="Total" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSdgColor(entry.sdgNumber)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;