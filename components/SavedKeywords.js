import { useState, useEffect } from 'react';

export default function SavedKeywords() {
  const [savedKeywords, setSavedKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedKeywords();
  }, []);

  const fetchSavedKeywords = async () => {
    try {
      const response = await fetch('/api/get-saved-keywords');
      if (!response.ok) {
        throw new Error('Failed to fetch saved keywords');
      }
      const data = await response.json();
      setSavedKeywords(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching keywords:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    try {
      // Handle MongoDB date format
      if (dateValue && dateValue.$date && dateValue.$date.$numberLong) {
        return new Date(parseInt(dateValue.$date.$numberLong)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      // Handle ISO string format
      return new Date(dateValue).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
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
      
      {!savedKeywords || savedKeywords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No saved keywords found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {savedKeywords.map((entry) => (
            <div key={entry._id.$oid} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">
                    Domain: {entry.domain || 'No Domain'}
                  </h2>
                  <span className="text-sm text-gray-500">
                    Saved on {formatDate(entry.createdAt)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entry.keywords && entry.keywords.map((keyword) => (
                    <div 
                      key={keyword.id.$oid}
                      className="bg-base-200 p-4 rounded-lg"
                    >
                      <div className="font-medium mb-2">{keyword.keyword}</div>
                      <div className="text-sm text-gray-500">
                        Competitor: {keyword.competitorDomain}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Added: {formatDate(keyword.addedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
