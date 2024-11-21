import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, ChevronDown, CheckCircle2, ExternalLink, MapPin, Mail, Phone, Link2, Quote } from 'lucide-react';

// Helper function to safely extract values from MongoDB format
const extractValue = (value) => {
  if (!value) return null;
  if (typeof value === 'object') {
    if ('$numberInt' in value) return parseInt(value.$numberInt);
    if ('$numberDouble' in value) return parseFloat(value.$numberDouble);
  }
  return value;
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

// Helper function to get testimonial content regardless of key used
const getTestimonialContent = (testimonial) => {
  return testimonial.content || testimonial.feedback || '';
};

const PageDetailView = ({ data }) => {
  const [activeFaq, setActiveFaq] = useState(null);
  
  if (!data) return null;

  const { 
    website_info, 
    content_analysis, 
    media, 
    seo_metrics, 
    locations, 
    contact_info,
    events
  } = data;

  // Prepare keyword density data
  const keywordData = seo_metrics?.keyword_density ? 
    Object.entries(seo_metrics.keyword_density).map(([keyword, density]) => ({
      keyword,
      density: extractValue(density)
    })).sort((a, b) => b.density - a.density) : [];

  // Normalize testimonials
  const testimonials = normalizeTestimonials(content_analysis?.testimonials || []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {website_info?.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {website_info?.meta_description || content_analysis?.summary}
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href={website_info?.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Globe className="w-4 h-4 mr-2" />
              {website_info?.domain}
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            {website_info?.language && (
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                Language: {website_info.language.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SEO Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">SEO Score</div>
          <div className="text-3xl font-bold text-indigo-600">
            {extractValue(seo_metrics?.seo_score) || 'N/A'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Word Count</div>
          <div className="text-3xl font-bold text-indigo-600">
            {extractValue(seo_metrics?.total_word_count) || 'N/A'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Title Length</div>
          <div className="text-3xl font-bold text-indigo-600">
            {extractValue(seo_metrics?.title_length) || 'N/A'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Meta Description Length</div>
          <div className="text-3xl font-bold text-indigo-600">
            {extractValue(seo_metrics?.meta_description_length) || 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Analysis */}
        <div className="space-y-6">
          {/* Main Topic */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Main Topic</h2>
            <p className="text-gray-800">{content_analysis?.main_topic}</p>
          </div>

          {/* Keywords Sections */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Keywords</h2>
            
            {/* Primary Keywords */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Primary Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {content_analysis?.primary_keywords?.map((keyword, index) => (
                  <span key={index} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Supporting Keywords */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Supporting Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {content_analysis?.supporting_keywords?.map((keyword, index) => (
                  <span key={index} className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* NLP Keywords */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">NLP Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {content_analysis?.nlp_keywords?.map((keyword, index) => (
                  <span key={index} className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Density Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Keyword Density</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keywordData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="keyword" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="density" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Sections */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Content Sections</h2>
          <div className="space-y-2">
            {content_analysis?.key_sections?.map((section, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                {section}
              </div>
            ))}
          </div>
        </div>

        {/* Offerings */}
        {content_analysis?.offerings && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Offerings</h2>
            <div className="space-y-2">
              {content_analysis.offerings.map((offering, index) => (
                <div key={index} className="bg-indigo-50 p-3 rounded flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>{offering}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
                <Quote className="w-8 h-8 text-indigo-600 mb-4" />
                <p className="text-gray-700 mb-4 italic">"{getTestimonialContent(testimonial)}"</p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900">{testimonial.client}</p>
                  {testimonial.position && (
                    <p className="text-gray-500 text-sm">{testimonial.position}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value Propositions */}
      {content_analysis?.unique_value_propositions && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Unique Value Propositions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content_analysis.unique_value_propositions.map((prop, index) => (
              <div key={index} className="bg-emerald-50 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                <span>{prop}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Resources */}
      {media && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            Media Resources
            {media.num_images && (
              <span className="ml-2 text-sm text-gray-500">
                ({extractValue(media.num_images)} images)
              </span>
            )}
          </h2>
          
          {/* Images */}
          {media.images && (
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium text-gray-500">Images</h3>
              <div className="space-y-2">
                {media.images.map((image, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                    <Link2 className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <a 
                        href={typeof image === 'string' ? image : image.url}
                        className="text-blue-600 hover:text-blue-800 break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {typeof image === 'string' ? image : image.url}
                      </a>
                      {typeof image === 'object' && image.alt && (
                        <p className="text-sm text-gray-500 mt-1">Alt: {image.alt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {media.social_media_links && media.social_media_links.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Social Media</h3>
              <div className="space-y-2">
                {media.social_media_links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Locations and Contact */}
      {(locations || contact_info) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Locations & Contact</h2>
          
          {/* Main Countries */}
          {locations?.main_countries && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Countries</h3>
              <div className="flex flex-wrap gap-2">
                {locations.main_countries.map((country, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Office Locations */}
          {locations?.office_locations && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(locations.office_locations).map(([country, details]) => (
                <div key={country} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{country}</h3>
                  <div className="space-y-2 text-sm">
                    {details.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                        <span>{details.address}</span>
                      </div>
                    )}
                    {details.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{details.phone}</span>
                      </div>
                    )}
                    {details.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{details.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ Section */}
      {content_analysis?.faq && content_analysis.faq.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <div className="space-y-3">
            {content_analysis.faq.map((faq, index) => (
              <div key={index} className="border rounded-lg">
                <button
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 transform transition-transform duration-200 ${
                      activeFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-4 py-3 border-t bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Section */}
      {events && events.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-lg text-gray-900">{event.title}</h3>
                <div className="text-indigo-600 font-medium mt-1">{event.date}</div>
                <p className="text-gray-600 mt-2">{event.description}</p>
                {event.link && (
                  <a 
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-800 mt-2 inline-flex items-center gap-1"
                  >
                    Learn more
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageDetailView;
