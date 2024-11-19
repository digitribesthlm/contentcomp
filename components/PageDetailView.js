import React from 'react';

const extractValue = (value) => {
  if (value && typeof value === 'object') {
    if ('$numberInt' in value) return parseInt(value['$numberInt'], 10);
    if ('$numberDouble' in value) return parseFloat(value['$numberDouble']);
  }
  return value;
};

const PageDetailView = ({ data }) => {
  if (!data) return null;

  const { 
    website_info, 
    content_analysis, 
    media, 
    seo_metrics, 
    locations, 
    contact_info 
  } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          {website_info?.title}
        </h1>
        <div className="flex items-center space-x-4">
          <a
            href={website_info?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-secondary-focus text-lg"
          >
            {website_info?.url}
          </a>
          <span className="badge badge-primary">
            {website_info?.domain}
          </span>
        </div>
        <p className="text-gray-600 mt-4">
          {website_info?.meta_description}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Content Analysis Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Content Analysis</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-secondary">Summary</h3>
                <p className="text-gray-700">{content_analysis?.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-secondary">Main Topic</h3>
                <p className="text-gray-700">{content_analysis?.main_topic}</p>
              </div>
              
              {/* Keywords */}
              <div>
                <h3 className="font-semibold text-secondary">Primary Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {content_analysis?.primary_keywords?.map((keyword, index) => (
                    <span key={index} className="badge badge-outline">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Metrics Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">SEO Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="stat">
                <div className="stat-title">Word Count</div>
                <div className="stat-value text-secondary">
                  {extractValue(seo_metrics?.total_word_count)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">SEO Score</div>
                <div className="stat-value text-secondary">
                  {extractValue(seo_metrics?.seo_score)}/100
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Title Length</div>
                <div className="stat-value text-secondary">
                  {extractValue(seo_metrics?.title_length)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Meta Description</div>
                <div className="stat-value text-secondary">
                  {extractValue(seo_metrics?.meta_description_length)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="mt-8 space-y-4">
        {/* Media Information */}
        <div className="collapse collapse-arrow border border-base-300 bg-base-100">
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">
            Media Information
          </div>
          <div className="collapse-content">
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">Image URLs</h3>
                <ul className="menu bg-base-100 rounded-box">
                  {media?.images?.map((image, index) => (
                    <li key={index}>
                      <a 
                        href={image.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-secondary"
                      >
                        {image.url}
                        {image.alt && (
                          <span className="badge badge-xs ml-2">
                            {image.alt}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Locations */}
        {locations && (
          <div className="collapse collapse-arrow border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              Locations
            </div>
            <div className="collapse-content">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title">Main Countries</h3>
                  <div className="flex flex-wrap gap-2">
                    {locations.main_countries?.map((country, index) => (
                      <span key={index} className="badge badge-primary">
                        {country}
                      </span>
                    ))}
                  </div>
                  {locations.office_locations && (
                    <div className="mt-4">
                      <h3 className="card-title">Office Locations</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(locations.office_locations).map(([country, details]) => (
                          <div key={country} className="bg-base-100 p-4 rounded-lg">
                            <h4 className="font-semibold text-secondary">{country}</h4>
                            <p>{details.address}</p>
                            <p>Phone: {details.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {contact_info && (
          <div className="collapse collapse-arrow border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              Contact Information
            </div>
            <div className="collapse-content">
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="card-title">Phone Numbers</h3>
                      {Object.entries(contact_info.phone_numbers || {}).map(([type, number]) => (
                        <div key={type} className="mb-2">
                          <span className="font-semibold text-secondary capitalize">{type}: </span>
                          <span>{number}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="card-title">Email</h3>
                      <p>{contact_info.email}</p>
                      <h3 className="card-title mt-4">Addresses</h3>
                      {Object.entries(contact_info.addresses || {}).map(([country, address]) => (
                        <div key={country} className="mb-2">
                          <span className="font-semibold text-secondary">{country}: </span>
                          <span>{address}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageDetailView;
