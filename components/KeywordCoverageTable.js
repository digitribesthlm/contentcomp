import React from 'react';

const KeywordCoverageTable = ({ data }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Competitor Keyword Coverage Analysis</h1>
      
      <div className="text-sm mb-4">{data?.selectedDomain}</div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                Competitor Page
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
                Action Required
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.pages?.map((page, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="font-medium">{page.title}</div>
                  <div className="text-sm text-gray-500">{page.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg">{page.primaryCoverage}%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2" 
                        style={{ width: `${page.primaryCoverage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{page.primaryMatches}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg">{page.secondaryCoverage}%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 rounded-full h-2" 
                        style={{ width: `${page.secondaryCoverage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{page.secondaryMatches}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg">{page.nlpCoverage}%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 rounded-full h-2" 
                        style={{ width: `${page.nlpCoverage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{page.nlpMatches}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-red-500">Missing: {page.missingKeywords}</div>
                  <button className="text-blue-500 hover:underline text-sm">
                    Show Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeywordCoverageTable;
