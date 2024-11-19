import React from 'react';

const CoverageBar = ({ percentage, label }) => (
  <div className="flex flex-col">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-medium text-gray-900">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${
          percentage >= 70 ? 'bg-green-500' :
          percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const KeywordCoverageTable = ({ data }) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Competitor Keyword Coverage Analysis</h1>
        <div className="text-gray-600 mb-6">
          Analyzing how well <span className="font-semibold">{data?.selectedDomain}</span> covers competitor keywords
          across {data?.totalCompetitors || 0} competitor{data?.totalCompetitors !== 1 ? 's' : ''}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-lg font-semibold mb-4">Average Coverage</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CoverageBar 
              percentage={data?.averageCoverage?.total || 0} 
              label="Total Coverage"
            />
            <CoverageBar 
              percentage={data?.averageCoverage?.primary || 0} 
              label="Primary Keywords"
            />
            <CoverageBar 
              percentage={data?.averageCoverage?.secondary || 0} 
              label="Secondary Keywords"
            />
            <CoverageBar 
              percentage={data?.averageCoverage?.nlp || 0} 
              label="NLP Keywords"
            />
          </div>
        </div>

        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
          {data?.flexibleMode ? (
            <span>Flexible Mode: Looking for competitor keywords anywhere in our content</span>
          ) : (
            <span>Strict Mode: Looking for competitor keywords in matching categories</span>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                Competitor Information
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                Primary Keywords Coverage
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                Secondary Keywords Coverage
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                NLP Keywords Coverage
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                Missing Competitor Keywords
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.pages?.map((page, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{page.domain}</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">{page.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{page.description}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Keywords: {page.competitorCounts.primary} primary, {page.competitorCounts.secondary} secondary, {page.competitorCounts.nlp} NLP
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{page.primaryCoverage}%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`rounded-full h-2 ${
                          page.primaryCoverage >= 70 ? 'bg-green-500' :
                          page.primaryCoverage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${page.primaryCoverage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {page.primaryMatches}
                      {data?.flexibleMode && ' (across all our content)'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{page.secondaryCoverage}%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`rounded-full h-2 ${
                          page.secondaryCoverage >= 70 ? 'bg-green-500' :
                          page.secondaryCoverage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${page.secondaryCoverage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {page.secondaryMatches}
                      {data?.flexibleMode && ' (across all our content)'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{page.nlpCoverage}%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`rounded-full h-2 ${
                          page.nlpCoverage >= 70 ? 'bg-green-500' :
                          page.nlpCoverage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${page.nlpCoverage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {page.nlpMatches}
                      {data?.flexibleMode && ' (across all our content)'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {page.missingKeywords === 'None' ? (
                      <span className="text-green-600">We cover all their keywords!</span>
                    ) : (
                      <div className="max-h-24 overflow-y-auto">
                        {page.missingKeywords}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {(!data?.pages || data.pages.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          No competitor data available
        </div>
      )}
    </div>
  );
};

export default KeywordCoverageTable;
