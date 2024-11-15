export default function KeywordComparison({ pages, selectedPages }) {
  // Get all unique keywords across selected pages
  const allKeywords = new Set();
  selectedPages.forEach(pageIndex => {
    const page = pages[pageIndex];
    [...page.content_analysis.primary_keywords, 
     ...page.content_analysis.supporting_keywords].forEach(keyword => {
      allKeywords.add(keyword);
    });
  });

  return (
    <div className="card bg-base-100 shadow-xl mt-6">
      <div className="card-body">
        <h2 className="card-title">Keyword Analysis</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Keyword</th>
                {selectedPages.map(pageIndex => (
                  <th key={pageIndex}>{pages[pageIndex].website_info.domain}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(allKeywords).map(keyword => (
                <tr key={keyword}>
                  <td>{keyword}</td>
                  {selectedPages.map(pageIndex => {
                    const page = pages[pageIndex];
                    const isPrimary = page.content_analysis.primary_keywords.includes(keyword);
                    const isSupporting = page.content_analysis.supporting_keywords.includes(keyword);
                    return (
                      <td key={pageIndex}>
                        {isPrimary && <span className="badge badge-primary">Primary</span>}
                        {isSupporting && <span className="badge badge-secondary">Supporting</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 