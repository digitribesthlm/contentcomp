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

    let totalPrimaryCoverage = 0;
    let totalSecondaryCoverage = 0;
    let totalNlpCoverage = 0;
    let totalCompetitorPrimaryKeywords = 0;
    let totalCompetitorSecondaryKeywords = 0;
    let totalCompetitorNlpKeywords = 0;

    const analyzedPages = competitorPages.map(page => {
      // Get all competitor keywords in lowercase
      const competitorKeywords = {
        primary: (page.content_analysis?.primary_keywords || []).map(k => k.toLowerCase()),
        secondary: (page.content_analysis?.supporting_keywords || []).map(k => k.toLowerCase()),
        nlp: (page.content_analysis?.nlp_keywords || []).map(k => k.toLowerCase())
      };

      totalCompetitorPrimaryKeywords += competitorKeywords.primary.length;
      totalCompetitorSecondaryKeywords += competitorKeywords.secondary.length;
      totalCompetitorNlpKeywords += competitorKeywords.nlp.length;

      let primaryMatches, secondaryMatches, nlpMatches, missingKeywords;

      if (isFlexibleMode) {
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

        missingKeywords = [
          ...competitorKeywords.primary.filter(keyword => !allOurKeywords.includes(keyword)),
          ...competitorKeywords.secondary.filter(keyword => !allOurKeywords.includes(keyword)),
          ...competitorKeywords.nlp.filter(keyword => !allOurKeywords.includes(keyword))
        ];
      } else {
        primaryMatches = competitorKeywords.primary.filter(keyword => 
          ourKeywordsLower.primary.includes(keyword)
        );
        secondaryMatches = competitorKeywords.secondary.filter(keyword => 
          ourKeywordsLower.secondary.includes(keyword)
        );
        nlpMatches = competitorKeywords.nlp.filter(keyword => 
          ourKeywordsLower.nlp.includes(keyword)
        );

        missingKeywords = [
          ...competitorKeywords.primary.filter(keyword => !ourKeywordsLower.primary.includes(keyword)),
          ...competitorKeywords.secondary.filter(keyword => !ourKeywordsLower.secondary.includes(keyword)),
          ...competitorKeywords.nlp.filter(keyword => !ourKeywordsLower.nlp.includes(keyword))
        ];
      }

      const primaryCoverage = competitorKeywords.primary.length ? 
        Math.round((primaryMatches.length / competitorKeywords.primary.length) * 100) : 0;
      const secondaryCoverage = competitorKeywords.secondary.length ? 
        Math.round((secondaryMatches.length / competitorKeywords.secondary.length) * 100) : 0;
      const nlpCoverage = competitorKeywords.nlp.length ? 
        Math.round((nlpMatches.length / competitorKeywords.nlp.length) * 100) : 0;

      totalPrimaryCoverage += primaryMatches.length;
      totalSecondaryCoverage += secondaryMatches.length;
      totalNlpCoverage += nlpMatches.length;

      const competitorOriginalKeywords = {
        primary: page.content_analysis?.primary_keywords || [],
        secondary: page.content_analysis?.supporting_keywords || [],
        nlp: page.content_analysis?.nlp_keywords || []
      };

      const missingKeywordsOriginalCase = missingKeywords.map(lowercaseKeyword => {
        const allCompetitorKeywords = [
          ...competitorOriginalKeywords.primary,
          ...competitorOriginalKeywords.secondary,
          ...competitorOriginalKeywords.nlp
        ];
        return allCompetitorKeywords.find(k => k.toLowerCase() === lowercaseKeyword) || lowercaseKeyword;
      });

      return {
        id: page._id.toString(), // Include the MongoDB _id
        domain: page.website_info?.domain || 'Unknown Domain',
        title: page.website_info?.title || 'Untitled',
        description: page.website_info?.meta_description || 'No description',
        url: page.website_info?.url || '', // Include the URL
        competitorCounts: {
          primary: competitorKeywords.primary.length,
          secondary: competitorKeywords.secondary.length,
          nlp: competitorKeywords.nlp.length
        },
        primaryCoverage,
        secondaryCoverage,
        nlpCoverage,
        primaryMatches: `${primaryMatches.length}/${competitorKeywords.primary.length} competitor keywords covered`,
        secondaryMatches: `${secondaryMatches.length}/${competitorKeywords.secondary.length} competitor keywords covered`,
        nlpMatches: `${nlpMatches.length}/${competitorKeywords.nlp.length} competitor keywords covered`,
        missingKeywords: missingKeywordsOriginalCase.join(', ') || 'None'
      };
    });

    // Calculate average coverage percentages
    const averageCoverage = {
      primary: totalCompetitorPrimaryKeywords ? 
        Math.round((totalPrimaryCoverage / totalCompetitorPrimaryKeywords) * 100) : 0,
      secondary: totalCompetitorSecondaryKeywords ? 
        Math.round((totalSecondaryCoverage / totalCompetitorSecondaryKeywords) * 100) : 0,
      nlp: totalCompetitorNlpKeywords ? 
        Math.round((totalNlpCoverage / totalCompetitorNlpKeywords) * 100) : 0,
      total: Math.round(
        ((totalPrimaryCoverage + totalSecondaryCoverage + totalNlpCoverage) / 
        (totalCompetitorPrimaryKeywords + totalCompetitorSecondaryKeywords + totalCompetitorNlpKeywords)) * 100
      ) || 0
    };
    
    return res.status(200).json({
      selectedDomain: domain,
      totalCompetitors: competitorPages.length,
      totalOurPages: ourPages.length,
      flexibleMode: isFlexibleMode,
      averageCoverage,
      pages: analyzedPages
    });
  } catch (error) {
    console.error('Error in keyword-coverage API:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch keyword coverage data. Please ensure MongoDB connection is properly configured.' 
    });
  }
}
