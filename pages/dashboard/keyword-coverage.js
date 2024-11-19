import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import KeywordCoverageTable from '../../components/KeywordCoverageTable';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function KeywordCoveragePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');

  // Fetch available domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch('/api/get-domains');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch domains');
        }
        const { domains: fetchedDomains } = await response.json();
        setDomains(fetchedDomains);
        if (fetchedDomains.length > 0 && !selectedDomain) {
          setSelectedDomain(fetchedDomains[0]);
        }
      } catch (err) {
        setError('Failed to load domains: ' + err.message);
      }
    };

    fetchDomains();
  }, []);

  // Fetch coverage data when domain is selected
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDomain) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/keyword-coverage?domain=${selectedDomain}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDomain]);

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  if (!domains.length && !error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
              Select Domain
            </label>
            <select
              id="domain"
              value={selectedDomain}
              onChange={handleDomainChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={domains.length === 0}
            >
              {domains.length === 0 ? (
                <option>No domains available</option>
              ) : (
                domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : data ? (
              <KeywordCoverageTable data={data} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
