import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { domain, flexibleMode } = req.query;
  const isFlexibleMode = flexibleMode === 'true';
  
  if (!domain) {
    return res.status(400).json({ message: 'Domain parameter is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('seo_structure_pages_json');

    // Get ALL pages from the selected domain
    const ourPages = await collection.find({
      'website_info.domain': domain
    }).toArray();

    if (!ourPages || ourPages.length === 0) {
      return res.status(404).json({ 
        message: `Domain "${domain}" not found in database. Please ensure the domain exists and try again.` 
      });
    }

    // Combine all unique keywords from all our pages
    const ourUniqueKeywords = {
      primary: new Set(),
      secondary: new Set(),
      nlp: new Set()
    };

    // Keep track of original case while collecting unique keywords
    const originalCaseMap = new Map();

    ourPages.forEach(page => {
      // Primary keywords
      page.content_analysis?.primary_keywords?.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        ourUniqueKeywords.primary.add(lowerKeyword);
        originalCaseMap.set(lowerKeyword, keyword);
      });

      // Secondary keywords
      page.content_analysis?.supporting_keywords?.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        ourUniqueKeywords.secondary.add(lowerKeyword);
        originalCaseMap.set(lowerKeyword, keyword);
      });

      // NLP keywords
      page.content_analysis?.nlp_keywords?.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        ourUniqueKeywords.nlp.add(lowerKeyword);
        originalCaseMap.set(lowerKeyword, keyword);
      });
    });

    // Convert Sets to Arrays for easier handling
    const ourKeywordsLower = {
      primary: Array.from(ourUniqueKeywords.primary),
      secondary: Array.from(ourUniqueKeywords.secondary),
      nlp: Array.from(ourUniqueKeywords.nlp)
    };

    // Get competitor pages
    const competitorPages = await collection.find({
      'website_info.domain': { $ne: domain }
    }).toArray();

    const analyzedPages = competitorPages.map(page => {
      // Get all competitor keywords in lowercase
      const competitorKeywords = {
        primary: (page.content_analysis?.primary_keywords || []).map(k => k.toLowerCase()),
        secondary: (page.content_analysis?.supporting_keywords || []).map(k => k.toLowerCase()),
        nlp: (page.content_analysis?.nlp_keywords || []).map(k => k.toLowerCase())
      };

      let primaryMatches, secondaryMatches, nlpMatches, missingKeywords;

      if (isFlexibleMode) {
        // In flexible mode, check if competitor keywords appear anywhere in our content
        const allOurKeywords = [
          ...ourKeywordsLower.primary,
          ...ourKeywordsLower.secondary,
          ...ourKeywordsLower.nlp
        ];

        primaryMatches = competitorKeywords.primary.filter(keyword => 
          allOurKeywords.includes(keyword)
        );
        secondaryMatches = competitorKeywords.secondary.filter(keyword => 
          allOurKeywords.includes(keyword)
        );
        nlpMatches = competitorKeywords.nlp.filter(keyword => 
          allOurKeywords.includes(keyword)
        );

        // Missing keywords are competitor keywords we don't have
        missingKeywords = [
          ...competitorKeywords.primary.filter(keyword => !allOurKeywords.includes(keyword)),
          ...competitorKeywords.secondary.filter(keyword => !allOurKeywords.includes(keyword)),
          ...competitorKeywords.nlp.filter(keyword => !allOurKeywords.includes(keyword))
        ];
      } else {
        // In strict mode, check if competitor keywords appear in their corresponding categories
        primaryMatches = competitorKeywords.primary.filter(keyword => 
          ourKeywordsLower.primary.includes(keyword)
        );
        secondaryMatches = competitorKeywords.secondary.filter(keyword => 
          ourKeywordsLower.secondary.includes(keyword)
        );
        nlpMatches = competitorKeywords.nlp.filter(keyword => 
          ourKeywordsLower.nlp.includes(keyword)
        );

        // Missing keywords are competitor keywords we don't have in corresponding categories
        missingKeywords = [
          ...competitorKeywords.primary.filter(keyword => !ourKeywordsLower.primary.includes(keyword)),
          ...competitorKeywords.secondary.filter(keyword => !ourKeywordsLower.secondary.includes(keyword)),
          ...competitorKeywords.nlp.filter(keyword => !ourKeywordsLower.nlp.includes(keyword))
        ];
      }

      // Get original case of competitor keywords for display
      const competitorOriginalKeywords = {
        primary: page.content_analysis?.primary_keywords || [],
        secondary: page.content_analysis?.supporting_keywords || [],
        nlp: page.content_analysis?.nlp_keywords || []
      };

      // Map missing keywords back to original case
      const missingKeywordsOriginalCase = missingKeywords.map(lowercaseKeyword => {
        const allCompetitorKeywords = [
          ...competitorOriginalKeywords.primary,
          ...competitorOriginalKeywords.secondary,
          ...competitorOriginalKeywords.nlp
        ];
        return allCompetitorKeywords.find(k => k.toLowerCase() === lowercaseKeyword) || lowercaseKeyword;
      });

      return {
        domain: page.website_info?.domain || 'Unknown Domain',
        title: page.website_info?.title || 'Untitled',
        description: page.website_info?.meta_description || 'No description',
        competitorCounts: {
          primary: competitorKeywords.primary.length,
          secondary: competitorKeywords.secondary.length,
          nlp: competitorKeywords.nlp.length
        },
        primaryCoverage: competitorKeywords.primary.length ? 
          Math.round((primaryMatches.length / competitorKeywords.primary.length) * 100) : 0,
        secondaryCoverage: competitorKeywords.secondary.length ? 
          Math.round((secondaryMatches.length / competitorKeywords.secondary.length) * 100) : 0,
        nlpCoverage: competitorKeywords.nlp.length ? 
          Math.round((nlpMatches.length / competitorKeywords.nlp.length) * 100) : 0,
        primaryMatches: `${primaryMatches.length}/${competitorKeywords.primary.length} competitor keywords covered`,
        secondaryMatches: `${secondaryMatches.length}/${competitorKeywords.secondary.length} competitor keywords covered`,
        nlpMatches: `${nlpMatches.length}/${competitorKeywords.nlp.length} competitor keywords covered`,
        missingKeywords: missingKeywordsOriginalCase.join(', ') || 'None'
      };
    });
    
    return res.status(200).json({
      selectedDomain: domain,
      totalCompetitors: competitorPages.length,
      totalOurPages: ourPages.length,
      flexibleMode: isFlexibleMode,
      ourKeywordCounts: {
        primary: ourKeywordsLower.primary.length,
        secondary: ourKeywordsLower.secondary.length,
        nlp: ourKeywordsLower.nlp.length
      },
      pages: analyzedPages
    });
  } catch (error) {
    console.error('Error in keyword-coverage API:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch keyword coverage data. Please ensure MongoDB connection is properly configured.' 
    });
  }
}
