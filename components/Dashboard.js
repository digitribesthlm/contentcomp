// components/Dashboard.js
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function Dashboard({ data }) {
  const [selectedPages, setSelectedPages] = useState([0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [comparisonView, setComparisonView] = useState('side-by-side');
  const itemsPerPage = 10;

  const togglePageSelection = (pageIndex) => {
    setSelectedPages(prev => 
      prev.includes(pageIndex)
        ? prev.filter(i => i !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    return data.pages.filter(page => {
      const searchLower = searchQuery.toLowerCase();
      const url = page.website_info.url.toLowerCase();
      const domain = new URL(page.website_info.url).hostname.toLowerCase();
      return url.includes(searchLower) || domain.includes(searchLower);
    });
  }, [data.pages, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPages = filteredPages.slice(startIndex, endIndex);

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }

    range.push(totalPages);

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
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

  // Helper function to get testimonial content regardless of key used
  const getTestimonialContent = (testimonial) => {
    return testimonial.content || testimonial.feedback || '';
  };

  // Helper function to normalize testimonials array
  const normalizeTestimonials = (testimonials) => {
    if (!Array.isArray(testimonials)) return [];
    
    return testimonials.map(testimonial => {
      // If testimonial is a simple array, convert to object format
      if (Array.isArray(testimonial)) {
        return {
          client: testimonial[0] || '',
          position: testimonial[1] || '',
          content: testimonial[2] || ''
        };
      }
      return testimonial;
    });
  };

  // Helper function to check if page has testimonials
  const hasTestimonials = (page) => {
    const testimonials = normalizeTestimonials(page.content_analysis.testimonials);
    return testimonials.length > 0;
  };

  // Helper function to check if page has FAQs
  const hasFAQs = (page) => {
    return page.content_analysis.faq && page.content_analysis.faq.length > 0;
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-primary mb-6">Content Comparison Tool</h1>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search pages..." 
                className="input input-bordered w-full pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentPages.map((page, index) => (
              <div 
                key={startIndex + index}
                className={`card bg-white hover:shadow-lg transition-all cursor-pointer border ${
                  selectedPages.includes(startIndex + index) 
                    ? 'border-primary' 
                    : 'border-base-300'
                }`}
                onClick={() => togglePageSelection(startIndex + index)}
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {new URL(page.website_info.url).hostname}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {getDisplayUrl(page.website_info.url)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        className="btn btn-circle btn-sm btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add history functionality
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button 
                        className="btn btn-circle btn-sm btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(page.website_info.url, '_blank');
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              
              {getPaginationNumbers().map((pageNum, i) => (
                <button 
                  key={i}
                  className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                  disabled={pageNum === '...'}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-gray-500 text-center mt-4">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPages.length)} of {filteredPages.length} results
          </div>
        </div>
      </div>

      {comparisonView === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPages.map(pageIndex => {
            const testimonials = normalizeTestimonials(data.pages[pageIndex].content_analysis.testimonials);
            
            return (
              <div key={pageIndex} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="bg-base-200 -mx-6 -mt-6 p-4 border-b flex justify-between items-start">
                    <div>
                      <h2 className="card-title text-primary text-lg">
                        {data.pages[pageIndex].website_info.domain}
                      </h2>
                      <p className="text-sm opacity-70 break-all">
                        {getDisplayUrl(data.pages[pageIndex].website_info.url)}
                      </p>
                    </div>
                    <Link 
                      href={`/dashboard/page-details/${data.pages[pageIndex]._id}`}
                      className="tooltip"
                      data-tip="View Details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-secondary">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    </Link>
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
                      <h3 className="font-bold mb-2">NLP Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.pages[pageIndex].content_analysis.nlp_keywords.map((keyword, idx) => (
                          <span key={idx} className="badge badge-info">{keyword}</span>
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

                    {/* Testimonials Section */}
                    {testimonials.length > 0 && (
                      <div>
                        <h3 className="font-bold mb-2">Testimonials</h3>
                        <div className="space-y-3">
                          {testimonials.map((testimonial, idx) => (
                            <div key={idx} className="card bg-base-200">
                              <div className="card-body p-4">
                                <p className="text-sm italic">"{getTestimonialContent(testimonial)}"</p>
                                <div className="text-sm mt-2">
                                  <span className="font-semibold">{testimonial.client}</span>
                                  {testimonial.position && (
                                    <span className="opacity-70"> - {testimonial.position}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
            );
          })}
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
                  <td className="font-bold bg-base-200 sticky left-0">NLP Keywords</td>
                  {selectedPages.map(pageIndex => (
                    <td key={pageIndex}>
                      <div className="flex flex-wrap gap-1">
                        {data.pages[pageIndex].content_analysis.nlp_keywords.map((keyword, idx) => (
                          <span key={idx} className="badge badge-sm badge-info">
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

                {/* Testimonials Row */}
                <tr>
                  <td className="font-bold bg-base-200 sticky left-0">Testimonials</td>
                  {selectedPages.map(pageIndex => {
                    const testimonials = normalizeTestimonials(data.pages[pageIndex].content_analysis.testimonials);
                    
                    return (
                      <td key={pageIndex}>
                        {testimonials.length > 0 ? (
                          <div className="space-y-3">
                            {testimonials.map((testimonial, idx) => (
                              <div key={idx} className="mb-3 p-2 bg-base-200 rounded-lg">
                                <p className="text-sm italic mb-1">"{getTestimonialContent(testimonial)}"</p>
                                <div className="text-sm">
                                  <span className="font-semibold">{testimonial.client}</span>
                                  {testimonial.position && (
                                    <span className="opacity-70"> - {testimonial.position}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm opacity-50">No testimonials available</span>
                        )}
                      </td>
                    );
                  })}
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
