import { useState, useMemo } from 'react';
import KeywordVennDiagram from './KeywordVennDiagram';
import KeywordComparison from './KeywordComparison';

export default function KeywordAnalysis({ data }) {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [keywordFilter, setKeywordFilter] = useState('all');
  const [comparisonDomains, setComparisonDomains] = useState([]);

  // Get available domains
  const domains = useMemo(() => {
    if (!data?.pages) return [];
    return ['all', ...new Set(data.pages.map(page => page.website_info.domain))];
  }, [data]);

  // Create master keyword table
  const masterKeywords = useMemo(() => {
    if (!data?.pages || !selectedDomain || selectedDomain === 'all') return new Map();

    const keywordTable = new Map();
    
    // Get list of competitor domains
    const competitorDomains = new Set(
      data.pages
        .map(p => p.website_info.domain)
        .filter(d => d !== selectedDomain)
    );

    // First pass: Collect all keywords and their domain usage
    data.pages.forEach(page => {
      const domain = page.website_info.domain;
      
      // Helper function to add keyword
      const addKeyword = (keyword, density, isPrimary, isSupporting) => {
        const lowerKey = keyword.toLowerCase();
        if (!keywordTable.has(lowerKey)) {
          keywordTable.set(lowerKey, {
            keyword,
            usedByDomains: new Set(),
            usageDetails: new Map()
          });
        }

        const entry = keywordTable.get(lowerKey);
        entry.usedByDomains.add(domain);
        entry.usageDetails.set(domain, {
          density: density || 0,
          isPrimary: isPrimary || false,
          isSupporting: isSupporting || false
        });
      };

      // Add all keywords from this domain
      page.content_analysis?.primary_keywords?.forEach(k => 
        addKeyword(k, 0, true, false)
      );
      page.content_analysis?.supporting_keywords?.forEach(k => 
        addKeyword(k, 0, false, true)
      );
      Object.entries(page.seo_metrics?.keyword_density || {}).forEach(([k, d]) => 
        addKeyword(k, d, false, false)
      );
    });

    return { keywordTable, competitorDomains };
  }, [data, selectedDomain]);

  // Calculate categorized keywords
  const categorizeKeywords = useMemo(() => {
    const categories = {
      all: [],
      shared: [],
      missing: [],
      untapped: [],
      unique: []
    };

    if (!masterKeywords.keywordTable) return categories;

    const { keywordTable, competitorDomains } = masterKeywords;

    keywordTable.forEach((entry, lowerKey) => {
      const keyword = entry.keyword;
      const usedBySelected = entry.usedByDomains.has(selectedDomain);
      const competitorsUsingKeyword = [...entry.usedByDomains].filter(d => competitorDomains.has(d));

      // All keywords
      categories.all.push(keyword);

      if (usedBySelected) {
        if (competitorsUsingKeyword.length > 0) {
          // Used by both selected domain and at least one competitor
          categories.shared.push(keyword);
        } else {
          // Only used by selected domain
          categories.unique.push(keyword);
        }
      } else {
        // For untapped, any competitor usage is enough
        if (competitorsUsingKeyword.length > 0) {
          categories.untapped.push(keyword);
          
          // For missing, check if number of competitors using it equals total competitors
          if (competitorsUsingKeyword.length === competitorDomains.size) {
            categories.missing.push(keyword);
          }
        }
      }
    });

    return categories;
  }, [masterKeywords, selectedDomain]);

  // Calculate filtered keywords with domain usage
  const filteredKeywords = useMemo(() => {
    if (!data?.pages || !selectedDomain || selectedDomain === 'all') return [];

    const keywords = categorizeKeywords[keywordFilter] || categorizeKeywords.all || [];
    return keywords.map(keyword => {
      const entry = masterKeywords.keywordTable.get(keyword.toLowerCase());
      const domainUsage = new Map();

      entry.usageDetails.forEach((usage, domain) => {
        switch (keywordFilter) {
          case 'untapped':
          case 'missing':
            // Only show competitor domains
            if (domain !== selectedDomain) {
              domainUsage.set(domain, {
                domain,
                density: usage.density,
                isPrimary: usage.isPrimary,
                isSupporting: usage.isSupporting
              });
            }
            break;
          case 'unique':
            // Only show selected domain
            if (domain === selectedDomain) {
              domainUsage.set(domain, {
                domain,
                density: usage.density,
                isPrimary: usage.isPrimary,
                isSupporting: usage.isSupporting
              });
            }
            break;
          default:
            // Show all domains
            domainUsage.set(domain, {
              domain,
              density: usage.density,
              isPrimary: usage.isPrimary,
              isSupporting: usage.isSupporting
            });
        }
      });

      return { keyword, domainUsage };
    });
  }, [data, selectedDomain, keywordFilter, categorizeKeywords, masterKeywords]);

  const handleComparisonToggle = (domain) => {
    setComparisonDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  return (
    <div>
      <div className="mb-6">
        <select 
          className="select select-bordered w-full max-w-xs mb-4"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          {domains.map(domain => (
            <option key={domain} value={domain}>
              {domain === 'all' ? 'Select Domain' : domain}
            </option>
          ))}
        </select>

        {selectedDomain !== 'all' && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="tooltip" data-tip="Shows all keywords from all domains">
              <button 
                className={`btn btn-sm ${keywordFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setKeywordFilter('all')}
              >
                All ({categorizeKeywords.all?.length || 0})
              </button>
            </div>
            
            <div className="tooltip" data-tip="Keywords that both you and competitors are using">
              <button 
                className={`btn btn-sm ${keywordFilter === 'shared' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setKeywordFilter('shared')}
              >
                Shared ({categorizeKeywords.shared?.length || 0})
              </button>
            </div>
            
            <div className="tooltip" data-tip="Keywords that all competitors use but you don't">
              <button 
                className={`btn btn-sm ${keywordFilter === 'missing' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setKeywordFilter('missing')}
              >
                Missing ({categorizeKeywords.missing?.length || 0})
              </button>
            </div>
            
            <div className="tooltip" data-tip="Keywords used by competitors but not by you">
              <button 
                className={`btn btn-sm ${keywordFilter === 'untapped' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setKeywordFilter('untapped')}
              >
                Untapped ({categorizeKeywords.untapped?.length || 0})
              </button>
            </div>
            
            <div className="tooltip" data-tip="Keywords only your domain uses">
              <button 
                className={`btn btn-sm ${keywordFilter === 'unique' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setKeywordFilter('unique')}
              >
                Unique ({categorizeKeywords.unique?.length || 0})
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedDomain !== 'all' && (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Used By</th>
                <th>Usage Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map(({ keyword, domainUsage }) => (
                <tr key={keyword}>
                  <td className="font-medium">
                    {keyword}
                  </td>
                  <td>{domainUsage.size} domains</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(domainUsage.values()).map(({ domain, density, isPrimary, isSupporting }) => (
                        <div 
                          key={domain}
                          className={`badge badge-sm ${
                            domain === selectedDomain
                              ? 'badge-primary'
                              : 'badge-ghost'
                          }`}
                        >
                          {domain}
                          {density > 0 && ` (${(density * 100).toFixed(1)}%)`}
                          {isPrimary && ' Primary'}
                          {isSupporting && ' Supporting'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    {!domainUsage.has(selectedDomain) && (
                      <button className="btn btn-xs btn-primary">
                        Add to Keywords
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDomain !== 'all' && (
        <>
          <KeywordVennDiagram 
            data={data}
            selectedDomain={selectedDomain}
            comparisonDomains={comparisonDomains}
          />
          <KeywordComparison 
            pages={data.pages}
            selectedPages={[
              data.pages.findIndex(p => p.website_info.domain === selectedDomain),
              ...comparisonDomains.map(domain => 
                data.pages.findIndex(p => p.website_info.domain === domain)
              )
            ].filter(i => i !== -1)}
          />
        </>
      )}
    </div>
  );
}
