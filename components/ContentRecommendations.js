export default function ContentRecommendations({ recommendations }) {
  if (!recommendations?.content_recommendations) return null;

  return (
    <div className="space-y-6">
      {recommendations.content_recommendations.map((recommendation, index) => (
        <div key={index} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Keyword and Content Type Header */}
            <div className="flex justify-between items-center">
              <h2 className="card-title text-primary">{recommendation.keyword}</h2>
              <div className="badge badge-secondary">{recommendation.content_type}</div>
            </div>

            {/* Page Structure */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Page Structure</h3>
              <div className="space-y-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Proposed Title</span>
                  </label>
                  <input type="text" value={recommendation.page_structure.proposed_title} className="input input-bordered" readOnly />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Meta Description</span>
                  </label>
                  <textarea className="textarea textarea-bordered" value={recommendation.page_structure.meta_description} readOnly />
                </div>
              </div>

              {/* Suggested Sections */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Suggested Sections</h4>
                <div className="space-y-2">
                  {recommendation.page_structure.suggested_sections.map((section, idx) => (
                    <div key={idx} className="alert alert-info">
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Points */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Key Points to Cover</h4>
                <div className="space-y-2">
                  {recommendation.page_structure.key_points_to_cover.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Differentiation */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Differentiation Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-sm">Unique Angles</h4>
                    <ul className="list-disc list-inside">
                      {recommendation.differentiation.unique_angles.map((angle, idx) => (
                        <li key={idx}>{angle}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-sm">Competitor Gaps</h4>
                    <ul className="list-disc list-inside">
                      {recommendation.differentiation.competitor_gaps.map((gap, idx) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Strategy */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">SEO Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-sm">Primary Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.seo_strategy.primary_keywords.map((keyword, idx) => (
                        <div key={idx} className="badge badge-primary">{keyword}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-sm">Secondary Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.seo_strategy.secondary_keywords.map((keyword, idx) => (
                        <div key={idx} className="badge badge-secondary">{keyword}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Service Integration</h3>
              <div className="space-y-2">
                {recommendation.integration.existing_service_connections.map((connection, idx) => (
                  <div key={idx} className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{connection}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Strategic Notes */}
      {recommendations.strategic_notes && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Strategic Notes</h2>
            <div className="prose">
              <p>{recommendations.strategic_notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Implementation Priority */}
      {recommendations.implementation_priority && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Implementation Priority</h3>
            <div className="text-sm">{recommendations.implementation_priority}</div>
          </div>
        </div>
      )}
    </div>
  );
}
