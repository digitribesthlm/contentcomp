import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="bg-white rounded-lg shadow-sm p-6">{children}</div>
  </div>
);

const KeywordList = ({ keywords, title }) => (
  <div className="mb-4">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
        >
          {keyword}
        </span>
      ))}
    </div>
  </div>
);

const PageDetailView = ({ data }) => {
  if (!data) return null;

  const { website_info, content_analysis, media, locations, contact_info, seo_metrics } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{website_info.title}</h1>
        <a
          href={website_info.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800"
        >
          {website_info.url}
        </a>
      </div>

      <Section title="Website Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-2">Domain: {website_info.domain}</p>
            <p className="text-gray-600 mb-2">Language: {website_info.language}</p>
            <p className="text-gray-600">Meta Description: {website_info.meta_description}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Meta Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {website_info.meta_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Content Analysis">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Summary</h3>
            <p className="text-gray-600">{content_analysis.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Main Topic</h3>
            <p className="text-gray-600">{content_analysis.main_topic}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Key Sections</h3>
            <ul className="list-disc list-inside text-gray-600">
              {content_analysis.key_sections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ul>
          </div>

          <KeywordList keywords={content_analysis.primary_keywords} title="Primary Keywords" />
          <KeywordList keywords={content_analysis.supporting_keywords} title="Supporting Keywords" />
          <KeywordList keywords={content_analysis.nlp_keywords} title="NLP Keywords" />

          <div>
            <h3 className="text-lg font-medium mb-2">Offerings</h3>
            <ul className="list-disc list-inside text-gray-600">
              {content_analysis.offerings.map((offering, index) => (
                <li key={index}>{offering}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Unique Value Propositions</h3>
            <ul className="list-disc list-inside text-gray-600">
              {content_analysis.unique_value_propositions.map((uvp, index) => (
                <li key={index}>{uvp}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Media Information">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Images ({media.num_images})</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Image URLs</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {media.images.map((image, index) => (
                  <li key={index} className="mb-1 break-all">
                    <a 
                      href={image.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {image.url}
                    </a>
                    {image.alt && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Alt: {image.alt})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Social Media Links</h3>
            <div className="flex flex-wrap gap-4">
              {media.social_media_links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {new URL(link).hostname.split('.')[1]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="SEO Metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Word Count</p>
            <p className="text-2xl font-semibold">{seo_metrics.total_word_count}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">SEO Score</p>
            <p className="text-2xl font-semibold">{seo_metrics.seo_score}/100</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Title Length</p>
            <p className="text-2xl font-semibold">{seo_metrics.title_length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Meta Description Length</p>
            <p className="text-2xl font-semibold">{seo_metrics.meta_description_length}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Keyword Density</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(seo_metrics.keyword_density).map(([keyword, density]) => (
              <div key={keyword} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{keyword}</p>
                <p className="text-xl font-semibold">{density}%</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default PageDetailView;
