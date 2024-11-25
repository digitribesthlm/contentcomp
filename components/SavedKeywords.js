import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ContentRecommendations from './ContentRecommendations';

export default function SavedKeywords() {
  const router = useRouter();
  const [savedKeywords, setSavedKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [contentRecommendations, setContentRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    console.log('SavedKeywords component mounted');
    fetchSavedKeywords();
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      console.log('Fetching domains...');
      const response = await fetch('/api/get-domains');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch domains');
      }
      const data = await response.json();
      console.log('Domains fetched:', data);
      setDomains(data.domains || []);
      if (data.domains?.length > 0) {
        setSelectedDomain(data.domains[0]);
      }
    } catch (err) {
      console.error('Error fetching domains:', err);
      setError('Failed to fetch domains: ' + err.message);
    }
  };

  const fetchSavedKeywords = async () => {
    try {
      console.log('Fetching saved keywords...');
      const response = await fetch('/api/get-saved-keywords');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch saved keywords');
      }
      const data = await response.json();
      console.log('API Response:', data);
      setSavedKeywords(data);
    } catch (err) {
      console.error('Error fetching keywords:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return 'N/A';
      
      if (dateValue.$date && dateValue.$date.$numberLong) {
        return new Date(parseInt(dateValue.$date.$numberLong)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      if (typeof dateValue === 'string') {
        return new Date(dateValue).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      return 'Invalid date';
    } catch (err) {
      console.error('Error formatting date:', err, dateValue);
      return 'Invalid date';
    }
  };

  const handleKeywordSelect = (keywordId) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keywordId)) {
        return prev.filter(id => id !== keywordId);
      } else {
        return [...prev, keywordId];
      }
    });
  };

  const handleAnalyzeContent = async () => {
    if (analyzing) return; // Prevent double-clicks

    try {
      setAnalyzing(true);
      setAnalysisData(null);
      setContentRecommendations(null);
      setActiveTab('recommendations');
      console.log('Analyzing content for keywords:', selectedKeywords);
      
      // Prepare selected keywords data
      const keywordsToAnalyze = savedKeywords.flatMap(entry =>
        entry.keywords.filter((keyword, idx) => {
          const keywordId = keyword.id?.$oid || `${entry._id}-${idx}`;
          return selectedKeywords.includes(keywordId);
        }).map(keyword => ({
          mainKeyword: keyword.keyword,
          sourceUrl: keyword.url || keyword.competitorDomain,
          type: keyword.isPrimary ? 'primary' : keyword.isSupporting ? 'supporting' : 'regular'
        }))
      );

      // First API call to analyze keywords
      const keywordResponse = await fetch('/api/analyze-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedKeywords: keywordsToAnalyze,
          targetDomain: selectedDomain,
          includeCompanyData: true
        }),
      });

      if (!keywordResponse.ok) {
        const errorData = await keywordResponse.json();
        throw new Error(errorData.message || 'Failed to analyze keywords');
      }

      const keywordAnalysis = await keywordResponse.json();
      setAnalysisData(keywordAnalysis);

      // Second API call to get content recommendations
      const contentResponse = await fetch('/api/analyze-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData: keywordAnalysis
        }),
      });

      if (!contentResponse.ok) {
        const errorData = await contentResponse.json();
        throw new Error(errorData.message || 'Failed to get content recommendations');
      }

      const recommendations = await contentResponse.json();
      console.log('Content recommendations:', recommendations);
      setContentRecommendations(recommendations);
    } catch (err) {
      console.error('Error analyzing content:', err);
      setError('Failed to analyze content: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Saved Keywords</h1>
      
      {/* Domain Selection Dropdown */}
      <div className="mb-6">
        <select 
          className="select select-bordered w-full max-w-xs"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          <option value="" disabled>Select target domain</option>
          {domains.map(domain => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>

      {!savedKeywords || savedKeywords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No saved keywords found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200">
                  <th className="w-16 px-4 py-3">Select</th>
                  <th className="px-4 py-3">Main Keyword</th>
                  <th className="px-4 py-3">Source URL</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Density</th>
                  <th className="px-4 py-3">Related Keywords</th>
                  <th className="px-4 py-3">Context</th>
                  <th className="px-4 py-3">Date Added</th>
                </tr>
              </thead>
              <tbody>
                {savedKeywords.flatMap((entry, entryIdx) => 
                  (entry.keywords || []).map((keyword, idx) => {
                    const keywordId = keyword.id?.$oid || `${entry._id}-${idx}`;
                    return (
                      <tr 
                        key={keywordId}
                        className="hover:bg-base-100"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedKeywords.includes(keywordId)}
                            onChange={() => handleKeywordSelect(keywordId)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {keyword.keyword}
                        </td>
                        <td className="px-4 py-3">
                          {keyword.url || keyword.competitorDomain || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${
                            keyword.isPrimary ? 'badge-primary' : 
                            keyword.isSupporting ? 'badge-secondary' : 
                            'badge-ghost'
                          }`}>
                            {keyword.isPrimary ? 'Primary' : 
                             keyword.isSupporting ? 'Supporting' : 
                             'Regular'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {keyword.density ? `${(keyword.density * 100).toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(entry.keywords || [])
                              .filter(k => k.id?.$oid !== keyword.id?.$oid)
                              .map((k, kIdx) => (
                                <span key={k.id?.$oid || `${entryIdx}-${idx}-${kIdx}`} className="badge badge-ghost badge-sm">
                                  {k.keyword}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {keyword.section && <div>Section: {keyword.section}</div>}
                            {keyword.context && <div>Context: {typeof keyword.context === 'string' ? keyword.context : JSON.stringify(keyword.context)}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatDate(keyword.addedAt || keyword.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Analyze Content Button */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                className={`btn btn-primary ${analyzing ? 'loading' : ''}`}
                onClick={handleAnalyzeContent}
                disabled={selectedKeywords.length === 0 || !selectedDomain || analyzing}
              >
                {analyzing ? 'Analyzing...' : `Analyse Content (${selectedKeywords.length} selected)`}
              </button>
            </div>

            {/* Analysis Results */}
            {(analysisData || contentRecommendations) && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-4">Analysis Results</h3>
                <div className="tabs tabs-boxed mb-4">
                  <button 
                    className={`tab ${activeTab === 'recommendations' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('recommendations')}
                  >
                    Content Recommendations
                  </button>
                  <button 
                    className={`tab ${activeTab === 'raw' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('raw')}
                  >
                    Raw Data
                  </button>
                </div>
                
                {/* Content Recommendations */}
                {activeTab === 'recommendations' && (
                  analyzing ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="loading loading-spinner loading-lg"></div>
                      <span className="ml-4">Generating recommendations...</span>
                    </div>
                  ) : contentRecommendations ? (
                    <ContentRecommendations recommendations={contentRecommendations} />
                  ) : null
                )}

                {/* Raw Data */}
                {activeTab === 'raw' && analysisData && (
                  <div className="bg-base-300 p-4 rounded">
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(analysisData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
