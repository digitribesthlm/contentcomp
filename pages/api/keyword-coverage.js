import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { domain } = req.query;
  
  if (!domain) {
    return res.status(400).json({ message: 'Domain parameter is required' });
  }

  try {
    const { db, client } = await connectToDatabase();
    const collection = db.collection('seo_structure_pages_json');

    // Get all pages for analysis
    const pages = await collection.find({}).toArray();
    
    // Get the selected domain's page
    const selectedPage = pages.find(page => 
      page.website_info.domain === domain
    );

    if (!selectedPage) {
      return res.status(404).json({ 
        message: `Domain "${domain}" not found in database. Please ensure the domain exists and try again.` 
      });
    }

    // Process pages and calculate coverage
    const analyzedPages = pages.map(page => {
      const primaryKeywords = selectedPage.content_analysis?.primary_keywords || [];
      const secondaryKeywords = selectedPage.content_analysis?.supporting_keywords || [];
      const nlpKeywords = selectedPage.content_analysis?.nlp_keywords || [];

      const pageKeywords = [
        ...(page.content_analysis?.primary_keywords || []),
        ...(page.content_analysis?.supporting_keywords || []),
        ...(page.content_analysis?.nlp_keywords || [])
      ];

      const primaryMatches = primaryKeywords.filter(keyword => 
        pageKeywords.includes(keyword)
      );
      const secondaryMatches = secondaryKeywords.filter(keyword => 
        pageKeywords.includes(keyword)
      );
      const nlpMatches = nlpKeywords.filter(keyword => 
        pageKeywords.includes(keyword)
      );

      const missingKeywords = [
        ...primaryKeywords.filter(keyword => !pageKeywords.includes(keyword)),
        ...secondaryKeywords.filter(keyword => !pageKeywords.includes(keyword)),
        ...nlpKeywords.filter(keyword => !pageKeywords.includes(keyword))
      ];

      return {
        title: page.website_info?.title || 'Untitled',
        description: page.website_info?.meta_description || 'No description',
        primaryCoverage: primaryKeywords.length ? Math.round((primaryMatches.length / primaryKeywords.length) * 100) : 0,
        secondaryCoverage: secondaryKeywords.length ? Math.round((secondaryMatches.length / secondaryKeywords.length) * 100) : 0,
        nlpCoverage: nlpKeywords.length ? Math.round((nlpMatches.length / nlpKeywords.length) * 100) : 0,
        primaryMatches: `${primaryMatches.length}/${primaryKeywords.length} matches`,
        secondaryMatches: `${secondaryMatches.length}/${secondaryKeywords.length} matches`,
        nlpMatches: `${nlpMatches.length}/${nlpKeywords.length} matches`,
        missingKeywords: missingKeywords.join(', ') || 'None'
      };
    });
    
    return res.status(200).json({
      selectedDomain: domain,
      pages: analyzedPages
    });
  } catch (error) {
    console.error('Error in keyword-coverage API:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch keyword coverage data. Please ensure MongoDB connection is properly configured.' 
    });
  }
}
