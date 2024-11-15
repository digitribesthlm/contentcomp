import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

export default function CrawlerPage() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze URL');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-6">Website Crawler</h2>
          
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="form-control">
              <div className="input-group">
                <input
                  type="url"
                  placeholder="Enter website URL to analyze..."
                  className="input input-bordered w-full"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          </form>

          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {analysis && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
              <div className="bg-base-200 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 