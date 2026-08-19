// frontend/src/components/ReportForm.jsx
import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, MapPin, Send } from 'lucide-react';


const ReportForm = ({ onReportSubmitted }) => {
  const [formData, setFormData] = useState({ originalText: '', address: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Processing report via AI triage...' });

    try {
      const payload = {
        originalText: formData.originalText,
        address: formData.address
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/reports`, payload);
            
      setStatus({ type: 'success', message: 'Report submitted successfully. Thank you for keeping the community safe.' });
      setFormData({ originalText: '', address: '' }); 
      
      if (onReportSubmitted) {
        onReportSubmitted();
      }

    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to submit report. Ensure the backend is running.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-8 border-t-4 border-blue-600">
      <div className="flex items-center mb-6">
        <AlertTriangle className="text-blue-600 mr-3" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Report a Civic Crisis</h2>
      </div>

      {status.message && (
        <div className={`p-4 mb-6 rounded-md ${
          status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe the situation in your own words (Any language)
          </label>
          <textarea
            required
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g., A large water pipe burst on Main Street, flooding the road..."
            value={formData.originalText}
            onChange={(e) => setFormData({...formData, originalText: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MapPin size={16} className="mr-1 text-gray-500" /> Location Details
          </label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g., Near Central Metro Station"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center disabled:opacity-70"
        >
          {isSubmitting ? 'Processing...' : (
            <>
              Submit Report <Send size={18} className="ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;