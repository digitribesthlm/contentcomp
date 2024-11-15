// components/Dashboard.js
import { useState } from 'react';

export default function Dashboard({ data }) {
  const [selectedPages, setSelectedPages] = useState([0]);
  const [comparisonView, setComparisonView] = useState('side-by-side');

  const togglePageSelection = (pageIndex) => {
    setSelectedPages(prev => 
      prev.includes(pageIndex)
        ? prev.filter(i => i !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  function calculateSeoScore(pageData) {
    let score = 100;
    
    if (!pageData.website_info.title) score -= 20;
    else if (pageData.seo_metrics.title_length < 30) score -= 10;
    
    if (!pageData.website_info.meta_description) score -= 20;
    else if (pageData.seo_metrics.meta_description_length < 120) score -= 10;
    
    if (!pageData.website_info.meta_keywords.length) score -= 20;
    
    return Math.max(0, score);
  }

  const getDisplayUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/\/$/, ''); // Remove trailing slash
    } catch {
      return url;
    }
  };

  const formatKeywordDensity = (density) => {
    return Object.entries(density).map(([keyword, value]) => ({
      keyword,
      percentage: (value * 100).toFixed(1)
    }));
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-primary mb-4">Content Comparison Tool</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.pages.map((page, index) => (
              <div 
                key={index}
                onClick={() => togglePageSelection(index)}
                className={`card cursor-pointer border-2 hover:shadow-lg transition-all ${
                  selectedPages.includes(index) 
                    ? 'border-primary bg-primary/10' 
                    : 'border-base-300'
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary" 
                      checked={selectedPages.includes(index)}
                      onChange={() => {}} // Handled by parent div click
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{page.website_info.domain}</h3>
                      <p className="text-xs opacity-70 truncate" title={page.website_info.url}>
                        {getDisplayUrl(page.website_info.url)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div className="tabs tabs-boxed">
              <a 
                className={`tab ${comparisonView === 'side-by-side' ? 'tab-active' : ''}`}
                onClick={() => setComparisonView('side-by-side')}
              >
                Side by Side
              </a>
              <a 
                className={`tab ${comparisonView === 'table' ? 'tab-active' : ''}`}
                onClick={() => setComparisonView('table')}
              >
                Table View
              </a>
            </div>
            
            <div className="text-sm opacity-70">
              {selectedPages.length} pages selected
            </div>
          </div>
        </div>
      </div>

      {comparisonView === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPages.map(pageIndex => (
            <div key={pageIndex} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="bg-base-200 -mx-6 -mt-6 p-4 border-b">
                  <h2 className="card-title text-primary text-lg">
                    {data.pages[pageIndex].website_info.domain}
                  </h2>
                  <p className="text-sm opacity-70 break-all">
                    {getDisplayUrl(data.pages[pageIndex].website_info.url)}
                  </p>
                </div>

                <div className="pt-4 space-y-6">
                  <div className="stats bg-base-200 w-full">
                    <div className="stat">
                      <div className="stat-title">SEO Score</div>
                      <div className="stat-value text-primary">
                        {calculateSeoScore(data.pages[pageIndex])}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Main Topic</h3>
                    <p className="text-sm">
                      {data.pages[pageIndex].content_analysis.main_topic}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Keyword Density</h3>
                    <div className="overflow-x-auto">
                      <table className="table table-xs w-full">
                        <thead>
                          <tr>
                            <th>Keyword</th>
                            <th>Density</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formatKeywordDensity(data.pages[pageIndex].seo_metrics.keyword_density)
                            .sort((a, b) => b.percentage - a.percentage)
                            .map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.keyword}</td>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="badge badge-primary">{item.percentage}%</div>
                                    <div className="w-20 h-2 bg-base-200 rounded-full">
                                      <div 
                                        className="h-2 bg-primary rounded-full" 
                                        style={{width: `${item.percentage}%`}}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Primary Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.pages[pageIndex].content_analysis.primary_keywords.map((keyword, idx) => (
                        <span key={idx} className="badge badge-primary">{keyword}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Supporting Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.pages[pageIndex].content_analysis.supporting_keywords.map((keyword, idx) => (
                        <span key={idx} className="badge badge-secondary">{keyword}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Offerings</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.pages[pageIndex].content_analysis.offerings.map((offering, idx) => (
                        <div key={idx} className="badge badge-accent badge-outline">
                          {offering}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Unique Value Propositions</h3>
                    <div className="space-y-2">
                      {data.pages[pageIndex].content_analysis.unique_value_propositions.map((prop, idx) => (
                        <div key={idx} className="alert alert-info bg-info/10 py-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="text-sm">{prop}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Content Sections</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {data.pages[pageIndex].content_analysis.key_sections.map((section, idx) => (
                        <li key={idx}>{section}</li>
                      ))}
                    </ul>
                  </div>

                  {/* FAQ Section - Only show if FAQs exist */}
                  {data.pages[pageIndex].content_analysis.faq && (
                    <div>
                      <h3 className="font-bold mb-2">Frequently Asked Questions</h3>
                      <div className="space-y-2">
                        {data.pages[pageIndex].content_analysis.faq.map((faq, idx) => (
                          <details key={idx} className="collapse bg-base-200">
                            <summary className="collapse-title font-medium">
                              {faq.question}
                            </summary>
                            <div className="collapse-content">
                              <p>{faq.answer}</p>
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {comparisonView === 'table' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="bg-base-200 sticky left-0">Aspect</th>
                  {selectedPages.map(pageIndex => (
                    <th key={pageIndex} className="min-w-[250px]">
                      <div className="font-bold">
                        {data.pages[pageIndex].website_info.domain}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {getDisplayUrl(data.pages[pageIndex].website_info.url)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Main Topic</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      {data.pages[pageIndex].content_analysis.main_topic}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Keyword Density</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      <div className="space-y-1">
                        {formatKeywordDensity(data.pages[pageIndex].seo_metrics.keyword_density)
                          .sort((a, b) => b.percentage - a.percentage)
                          .slice(0, 5) // Show top 5 keywords
                          .map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm">{item.keyword}</span>
                              <span className="badge badge-sm badge-primary">{item.percentage}%</span>
                            </div>
                          ))}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Primary Keywords</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      <div className="flex flex-wrap gap-1">
                        {data.pages[pageIndex].content_analysis.primary_keywords.map((keyword, idx) => (
                          <span key={idx} className="badge badge-sm badge-primary">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Supporting Keywords</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      <div className="flex flex-wrap gap-1">
                        {data.pages[pageIndex].content_analysis.supporting_keywords.map((keyword, idx) => (
                          <span key={idx} className="badge badge-sm badge-secondary">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Offerings</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      <div className="flex flex-wrap gap-1">
                        {data.pages[pageIndex].content_analysis.offerings.map((offering, idx) => (
                          <span key={idx} className="badge badge-sm badge-accent badge-outline">
                            {offering}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Unique Value Propositions</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {data.pages[pageIndex].content_analysis.unique_value_propositions.map((prop, idx) => (
                          <li key={idx}>{prop}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Content Sections</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {data.pages[pageIndex].content_analysis.key_sections.map((section, idx) => (
                          <li key={idx}>{section}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">FAQs</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      {data.pages[pageIndex].content_analysis.faq ? (
                        <div className="space-y-2">
                          {data.pages[pageIndex].content_analysis.faq.map((faq, idx) => (
                            <div key={idx} className="mb-2">
                              <p className="font-semibold text-sm">{faq.question}</p>
                              <p className="text-sm opacity-75">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm opacity-50">No FAQ available</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}