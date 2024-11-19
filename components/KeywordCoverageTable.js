import React from 'react';

const KeywordCoverageTable = ({ data }) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Competitor Keyword Coverage Analysis</h1>
        <div className="mt-2 text-gray-600">
          Analyzing competitors against keywords from: <span className="font-semibold">{data?.selectedDomain}</span>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Found {data?.totalCompetitors || 0} competitor{data?.totalCompetitors !== 1 ? 's' : ''}
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
                Missing Keywords
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
                    <span className="text-xs text-gray-500 mt-1">{page.primaryMatches}</span>
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
                    <span className="text-xs text-gray-500 mt-1">{page.secondaryMatches}</span>
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
                    <span className="text-xs text-gray-500 mt-1">{page.nlpMatches}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {page.missingKeywords === 'None' ? (
                      <span className="text-green-600">No missing keywords</span>
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
