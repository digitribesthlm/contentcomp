export default function ContentRecommendations({ recommendations }) {
  if (!recommendations?.content_recommendations) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {recommendations.content_recommendations.map((recommendation, index) => (
        <div key={index} className="bg-base-100 rounded-xl shadow-xl p-8 mb-8">
          {/* Centered Title and Description */}
          <div className="text-center mb-8">
   
            <h2 className="text-3xl font-semibold text-base-content mb-4">
              {recommendation.page_structure.proposed_title}
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              {recommendation.page_structure.meta_description}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Page Structure & SEO */}
            <div className="space-y-6">
              {/* Page Structure Card */}
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-secondary">Page Structure</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Original Keyword</h3>
                      <div className="badge badge-primary badge-lg">
                        {recommendation.keyword}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Suggested Sections</h3>
                      <div className="space-y-2">
                        {recommendation.page_structure.suggested_sections.map((section, idx) => (
                          <div key={idx} className="badge badge-ghost">
                            {section}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Strategy Card */}
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-secondary">SEO Strategy</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Primary Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.seo_strategy.primary_keywords.map((keyword, idx) => (
                          <div key={idx} className="badge badge-primary">
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Secondary Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.seo_strategy.secondary_keywords.map((keyword, idx) => (
                          <div key={idx} className="badge badge-secondary">
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Differentiation & Integration */}
            <div className="space-y-6">
              {/* Differentiation Card */}
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-secondary">Differentiation Strategy</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Unique Angles</h3>
                      <ul className="list-disc list-inside">
                        {recommendation.differentiation.unique_angles.map((angle, idx) => (
                          <li key={idx} className="text-base-content/80">{angle}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Competitor Gaps</h3>
                      <ul className="list-disc list-inside">
                        {recommendation.differentiation.competitor_gaps.map((gap, idx) => (
                          <li key={idx} className="text-base-content/80">{gap}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Card */}
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-secondary">Service Integration</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Service Connections</h3>
                      <div className="space-y-2">
                        {recommendation.integration.existing_service_connections.map((connection, idx) => (
                          <div key={idx} className="badge badge-accent">
                            {connection}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Points Section */}
          <div className="mt-8 bg-base-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-secondary text-center mb-6">Key Points to Cover</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendation.page_structure.key_points_to_cover.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-base-100 p-4 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-base-content/80">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Notes and Priority */}
          {(recommendations.strategic_notes || recommendations.implementation_priority) && (
            <div className="bg-base-200 rounded-xl p-6 mt-8 text-center">
              {recommendations.strategic_notes && (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-secondary mb-2">Strategic Notes</h3>
                  <p className="text-base-content/70">{recommendations.strategic_notes}</p>
                </div>
              )}
              {recommendations.implementation_priority && (
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Implementation Priority</h3>
                  <div className="badge badge-info">{recommendations.implementation_priority}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
