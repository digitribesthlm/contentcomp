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

  // First, calculate categorizeKeywords
  const categorizeKeywords = useMemo(() => {
    if (!data?.pages || !selectedDomain || selectedDomain === 'all') return {};

    // Get all keywords for the selected domain
    const selectedDomainPage = data.pages.find(p => p.website_info.domain === selectedDomain);
    if (!selectedDomainPage) return {};

    const selectedKeywords = new Set([
      ...(selectedDomainPage.content_analysis?.primary_keywords || []),
      ...(selectedDomainPage.content_analysis?.supporting_keywords || []),
      ...Object.keys(selectedDomainPage.seo_metrics?.keyword_density || {})
    ]);

    // Get keywords by domain
    const keywordsByDomain = new Map();
    data.pages.forEach(page => {
      const domain = page.website_info.domain;
      if (domain !== selectedDomain) {
        const keywords = new Set([
          ...(page.content_analysis?.primary_keywords || []),
          ...(page.content_analysis?.supporting_keywords || []),
          ...Object.keys(page.seo_metrics?.keyword_density || {})
        ]);
        keywordsByDomain.set(domain, keywords);
      }
    });

    // Get all competitor keywords
    const allCompetitorKeywords = new Set();
    keywordsByDomain.forEach((keywords) => {
      keywords.forEach(k => allCompetitorKeywords.add(k));
    });

    // Calculate categories
    const missingKeywords = [...allCompetitorKeywords].filter(keyword => {
      if (selectedKeywords.has(keyword)) return false;
      return Array.from(keywordsByDomain.values()).every(domainKeywords => 
        domainKeywords.has(keyword)
      );
    });

    const untappedKeywords = [...allCompetitorKeywords].filter(keyword => 
      !selectedKeywords.has(keyword)
    );

    const sharedKeywords = [...selectedKeywords].filter(keyword => 
      allCompetitorKeywords.has(keyword)
    );

    const uniqueKeywords = [...selectedKeywords].filter(keyword => 
      !allCompetitorKeywords.has(keyword)
    );

    const allKeywords = [...new Set([...selectedKeywords, ...allCompetitorKeywords])];

    return {
      shared: sharedKeywords,
      missing: missingKeywords,
      untapped: untappedKeywords,
      unique: uniqueKeywords,
      all: allKeywords
    };
  }, [data, selectedDomain]);

  // Then, calculate filteredKeywords using categorizeKeywords
  const filteredKeywords = useMemo(() => {
    if (!data?.pages || !selectedDomain || selectedDomain === 'all') return [];

    const keywords = categorizeKeywords[keywordFilter] || categorizeKeywords.all || [];
    return keywords.map(keyword => {
      const domainUsage = new Map();
      
      data.pages.forEach(page => {
        const domain = page.website_info.domain;
        const density = page.seo_metrics?.keyword_density?.[keyword] || 0;
        const isPrimary = page.content_analysis?.primary_keywords?.includes(keyword);
        const isSupporting = page.content_analysis?.supporting_keywords?.includes(keyword);
        
        if (density > 0 || isPrimary || isSupporting) {
          domainUsage.set(domain, { domain, density, isPrimary, isSupporting });
        }
      });

      return { keyword, domainUsage };
    });
  }, [data, selectedDomain, keywordFilter, categorizeKeywords]);

  const handleComparisonToggle = (domain) => {
    setComparisonDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  // Keep ALL of your existing JSX/UI code exactly the same
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
                All Keywords ({categorizeKeywords.all?.length || 0})
              </button>
            </div>
            
            <div className="tooltip" data-tip="Keywords that both you and other domains are using">
              <button 
                className={`btn btn-sm ${keywordFilter === 'shared' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setKeywordFilter('shared')}
              >
                Shared ({categorizeKeywords.shared?.length || 0})
              </button>
            </div>
            
            <div className="tooltip" data-tip="Keywords that all other domains use but you don't">
              <button 
                className={`btn btn-sm ${keywordFilter === 'missing' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setKeywordFilter('missing')}
              >
                Missing ({categorizeKeywords.missing?.length || 0})
              </button>
            </div>
            
            <div className="tooltip" data-tip="Keywords you don't have but at least one other domain uses">
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