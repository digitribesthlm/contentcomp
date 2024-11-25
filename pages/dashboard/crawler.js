import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AnalysisDisplay from '../../components/AnalysisDisplay';

export default function CrawlerPage() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

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

  const handleSave = async () => {
    if (!analysis) return;
    
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysis),
      });

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }

      setSaveStatus('saved');
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
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
              <div className="card bg-base-100 shadow-md p-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Page Summary</h3>
                <AnalysisDisplay analysis={analysis} />
              </div>
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className={`btn btn-primary ${saveStatus === 'saved' ? 'btn-success' : ''}`}
                >
                  {saveStatus === 'saving' && <span className="loading loading-spinner"></span>}
                  {saveStatus === 'saved' ? 'Saved!' : 'Save Analysis'}
                </button>
              </div>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Failed to save analysis</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
