import RadarChart from './RadarChart';

export default function AnalysisDisplay({ analysis }) {
  if (!analysis) return null;

  return (
    <div data-theme="cupcake" className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="hero bg-base-200 rounded-box p-6">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold">{analysis.website_info.title}</h1>
            <p className="py-4 text-base-content/70">{analysis.content_analysis.summary}</p>
            <div className="badge badge-primary">{analysis.website_info.domain}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">SEO Score</div>
          <div className="stat-value text-primary">{analysis.seo_metrics.seo_score}%</div>
        </div>
        <div className="stat">
          <div className="stat-title">Word Count</div>
          <div className="stat-value">{analysis.seo_metrics.total_word_count}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Title Length</div>
          <div className="stat-value text-secondary">{analysis.seo_metrics.title_length}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Column */}
        <div className="space-y-6">
          {/* Primary Keywords */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Primary Keywords
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.content_analysis.primary_keywords.map((keyword, index) => (
                  <div key={index} className="badge badge-primary badge-lg">{keyword}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Supporting Keywords */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Supporting Keywords
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.content_analysis.supporting_keywords.map((keyword, index) => (
                  <div key={index} className="badge badge-secondary badge-lg">{keyword}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Keyword Density */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Keyword Density
              </h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Density</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analysis.seo_metrics.keyword_density)
                      .sort(([,a], [,b]) => b - a)
                      .map(([keyword, density]) => (
                        <tr key={keyword}>
                          <td>{keyword}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <progress 
                                className="progress progress-primary w-20" 
                                value={density * 20} 
                                max="100"
                              ></progress>
                              <span className="badge badge-sm">{density}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Content Structure Column */}
        <div className="space-y-6">
          {/* Key Sections */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Content Sections
              </h2>
              <ul className="menu bg-base-200 rounded-box">
                {analysis.content_analysis.key_sections.map((section, index) => (
                  <li key={index}><a>{section}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Unique Value Propositions
              </h2>
              <div className="space-y-2">
                {analysis.content_analysis.unique_value_propositions.map((prop, index) => (
                  <div key={index} className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{prop}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Influence Metrics */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Influence Metrics
              </h2>
              <RadarChart data={analysis.influence_metrics.persuasion_score} />
            </div>
          </div>

          {/* FAQ Section */}
          {analysis.content_analysis.faq?.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ Section
                </h2>
                <div className="join join-vertical w-full">
                  {analysis.content_analysis.faq.map((item, index) => (
                    <div key={index} className="collapse collapse-arrow join-item border border-base-300">
                      <input type="radio" name="faq-accordion" /> 
                      <div className="collapse-title font-medium">
                        {item.question}
                      </div>
                      <div className="collapse-content">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
