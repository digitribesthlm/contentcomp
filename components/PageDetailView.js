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

// Helper function to extract value from MongoDB's special number types
const extractValue = (value) => {
  if (value && typeof value === 'object') {
    if ('$numberInt' in value) return parseInt(value['$numberInt'], 10);
    if ('$numberDouble' in value) return parseFloat(value['$numberDouble']);
  }
  return value;
};

// Helper function to render object or array as a list
const renderValue = (value) => {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside text-gray-600">
        {value.map((item, index) => (
          <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="mb-2">
            <span className="font-medium text-gray-700">{key}: </span>
            <span className="text-gray-600">{typeof val === 'object' ? JSON.stringify(val) : val}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-gray-600">{value}</span>;
};

const PageDetailView = ({ data }) => {
  if (!data) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{data.website_info?.title}</h1>
        <a
          href={data.website_info?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800"
        >
          {data.website_info?.url}
        </a>
      </div>

      {/* Dynamically render all top-level sections */}
      {Object.entries(data).map(([sectionKey, sectionValue]) => {
        // Skip empty sections or sections without content
        if (!sectionValue || (typeof sectionValue === 'object' && Object.keys(sectionValue).length === 0)) {
          return null;
        }

        return (
          <Section key={sectionKey} title={sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
            {typeof sectionValue === 'object' ? (
              Object.entries(sectionValue).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                  {renderValue(value)}
                </div>
              ))
            ) : (
              renderValue(sectionValue)
            )}
          </Section>
        );
      })}

      {/* Special handling for specific sections */}
      {data.media && (
        <Section title="Media Information">
          <div>
            <h3 className="text-lg font-medium mb-2">Images ({extractValue(data.media.num_images)})</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Image URLs</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {data.media.images.map((image, index) => (
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
        </Section>
      )}
    </div>
  );
};

export default PageDetailView;
