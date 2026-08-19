import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { Map as MapIcon } from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CrisisMap = ({ refreshTrigger }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/reports`);
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };
    fetchReports();
  }, [refreshTrigger]);

  // Center the map on Chennai
  const centerPosition = [13.0827, 80.2707];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center mb-6">
        <MapIcon className="text-blue-600 mr-3" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Live Crisis Map</h2>
      </div>
      
      <div className="h-96 w-full rounded-md overflow-hidden border border-gray-200">
        <MapContainer center={centerPosition} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((report) => (
            <Marker 
              key={report._id} 
              position={[report.location.coordinates[1], report.location.coordinates[0]]}
            >
              <Popup>
                <div className="p-1">
                  <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full mb-2">
                    SDG {report.sdgCategory}
                  </span>
                  <p className="text-sm font-semibold mb-1">Severity: {report.severityLevel}</p>
                  <p className="text-xs text-gray-600">{report.translatedText}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CrisisMap;