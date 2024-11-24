import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { selectedKeywords, targetDomain } = req.body;
    console.log('Analyzing keywords:', { selectedKeywords, targetDomain });

    const { db } = await connectToDatabase();

    // Get fresh page data for each selected keyword
    const enrichedKeywords = await Promise.all(selectedKeywords.map(async (keyword) => {
      console.log('Looking for page with domain:', keyword.sourceUrl);
      
      // Find the page in the correct collection
      const page = await db.collection('seo_structure_pages_json').findOne({
        'website_info.domain': keyword.sourceUrl
      });

      console.log('Query result:', {
        domain: keyword.sourceUrl,
        found: page ? 'yes' : 'no'
      });

      if (page) {
        return {
          keyword: keyword.mainKeyword,
          sourceUrl: keyword.sourceUrl,
          pageInfo: {
            title: page.website_info.title,
            description: page.website_info.meta_description,
            url: page.website_info.url,
            mainTopic: page.content_analysis.main_topic,
            type: page.content_analysis.type,
            content: page.content_analysis.summary,
            sections: page.content_analysis.key_sections,
            wordCount: page.seo_metrics.total_word_count,
            readabilityScore: page.seo_metrics.seo_score
          },
          keywordAnalysis: {
            inPrimaryKeywords: page.content_analysis.primary_keywords.includes(keyword.mainKeyword),
            inSupportingKeywords: page.content_analysis.supporting_keywords?.includes(keyword.mainKeyword),
            primaryKeywords: page.content_analysis.primary_keywords,
            supportingKeywords: page.content_analysis.supporting_keywords,
            nlpKeywords: page.content_analysis.nlp_keywords,
            keywordDensity: page.seo_metrics.keyword_density
          },
          contentStrategy: {
            offerings: page.content_analysis.offerings,
            uniqueValueProps: page.content_analysis.unique_value_propositions,
            subTopics: page.content_analysis.sub_topics,
            intent: page.content_analysis.overall_intent
          }
        };
      }

      console.log('Page not found for domain:', keyword.sourceUrl);
      return {
        keyword: keyword.mainKeyword,
        sourceUrl: keyword.sourceUrl,
        error: 'Page not found'
      };
    }));

    const analysisData = {
      targetDomain,
      timestamp: new Date().toISOString(),
      keywords: enrichedKeywords,
      summary: {
        totalKeywords: enrichedKeywords.length,
        analyzedDomains: [...new Set(enrichedKeywords.map(k => k.sourceUrl))],
        foundPages: enrichedKeywords.filter(k => !k.error).length
      }
    };

    console.log('Analysis results:', JSON.stringify(analysisData, null, 2));
    res.status(200).json(analysisData);
  } catch (error) {
    console.error('Error analyzing keywords:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      details: 'Error occurred while analyzing keywords'
    });
  }
}
