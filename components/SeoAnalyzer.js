// components/SeoAnalyzer.js
import { useState } from 'react';
import ResultDisplay from './ResultDisplay';
import LoadingSpinner from './LoadingSpinner';

export default function SeoAnalyzer() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSeo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SEO Analyzer</h1>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Enter website URL"
        />
        <button
          onClick={analyzeSeo}
          disabled={loading || !url}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      {loading && <LoadingSpinner />}
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {analysis && <ResultDisplay analysis={analysis} />}
    </div>
  );
}
