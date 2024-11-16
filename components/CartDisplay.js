import { useState } from 'react';

export default function CartDisplay({ keywords, onRemove, selectedDomain, masterKeywords }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSave = async () => {
    if (keywords.length === 0) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    setShowSuccessMessage(false);
    
    try {
      // Get competitor domains for each keyword
      const keywordsWithDomains = keywords.map(keyword => {
        const entry = masterKeywords.keywordTable?.get(keyword.toLowerCase());
        const competitorDomain = entry ? 
          Array.from(entry.usedByDomains)
            .find(domain => domain !== selectedDomain) || "Unknown Domain" 
          : "Unknown Domain";

        return {
          keyword,
          competitorDomain
        };
      });

      const response = await fetch('/api/save-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          keywords: keywordsWithDomains,
          domain: selectedDomain 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSaveStatus('success');
        setShowSuccessMessage(true);
        // Clear all keywords from the cart after successful save
        keywords.forEach(k => onRemove(k));
        // Keep success message visible for 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      } else {
        setSaveStatus('error');
        console.error('Failed to save:', data.error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving keywords:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed bottom-24 right-4 alert alert-success shadow-lg w-80 z-50">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Keywords saved successfully!</span>
          </div>
        </div>
      )}

      {/* Cart Icon with Count */}
      <button 
        className="btn btn-primary rounded-full relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {keywords.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {keywords.length}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-base-100 rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Selected Keywords</h3>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          {keywords.length === 0 ? (
            <p className="text-center text-gray-500 my-4">No keywords selected</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {keywords.map((keyword) => (
                  <div 
                    key={keyword}
                    className="flex justify-between items-center bg-base-200 p-2 rounded"
                  >
                    <span>{keyword}</span>
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={() => onRemove(keyword)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              {saveStatus === 'error' && (
                <div className="alert alert-error mb-2">
                  Failed to save keywords. Please try again.
                </div>
              )}

              <button 
                className={`btn btn-primary w-full ${isSaving ? 'loading' : ''}`}
                onClick={handleSave}
                disabled={isSaving || selectedDomain === 'all'}
              >
                {isSaving ? 'Saving...' : 'Save Keywords'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
