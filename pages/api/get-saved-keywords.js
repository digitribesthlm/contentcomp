import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Connecting to database...');
    const { db } = await connectToDatabase();

    // First get the saved keywords
    const savedKeywords = await db.collection('saved_keywords').find({}).toArray();
    console.log('Saved keywords found:', savedKeywords);

    // For each saved keyword, find its corresponding page data
    const enrichedKeywords = await Promise.all(savedKeywords.map(async (entry) => {
      const enrichedKeywordPromises = entry.keywords.map(async (keyword) => {
        // Find the page data for this keyword's domain
        const pageData = await db.collection('pages').findOne({
          'website_info.domain': keyword.competitorDomain
        });

        console.log('Found page data for domain:', keyword.competitorDomain, pageData ? 'yes' : 'no');

        if (pageData) {
          return {
            ...keyword,
            pageInfo: {
              title: pageData.website_info.title,
              description: pageData.website_info.meta_description,
              url: pageData.website_info.url,
              domain: pageData.website_info.domain,
              headings: pageData.content_analysis.key_sections,
              content: pageData.content_analysis.summary,
              sections: pageData.content_analysis.key_sections,
              wordCount: pageData.seo_metrics.total_word_count,
              readabilityScore: pageData.seo_metrics.seo_score,
              contentAnalysis: {
                mainTopic: pageData.content_analysis.main_topic,
                subTopics: pageData.content_analysis.sub_topics,
                type: pageData.content_analysis.type,
                intent: pageData.content_analysis.overall_intent,
                primaryKeywords: pageData.content_analysis.primary_keywords,
                supportingKeywords: pageData.content_analysis.supporting_keywords,
                nlpKeywords: pageData.content_analysis.nlp_keywords,
                offerings: pageData.content_analysis.offerings,
                uniqueValueProps: pageData.content_analysis.unique_value_propositions
              },
              seoMetrics: {
                keywordDensity: pageData.seo_metrics.keyword_density,
                seoScore: pageData.seo_metrics.seo_score
              }
            }
          };
        }

        // If no page data found, return the original keyword
        return keyword;
      });

      const enrichedKeywords = await Promise.all(enrichedKeywordPromises);

      return {
        ...entry,
        keywords: enrichedKeywords
      };
    }));

    console.log('Enriched keywords:', JSON.stringify(enrichedKeywords, null, 2));

    res.status(200).json(enrichedKeywords);
  } catch (error) {
    console.error('Error in get-saved-keywords:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      details: 'Error occurred while fetching saved keywords'
    });
  }
}
