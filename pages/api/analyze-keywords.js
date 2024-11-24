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
        found: page ? 'yes' : 'no',
        collectionName: 'seo_structure_pages_json'
      });

      if (page) {
        // Check if this keyword exists in primary_keywords
        const isMainKeyword = page.content_analysis.primary_keywords.includes(keyword.mainKeyword);
        // Or in supporting_keywords
        const isSupporting = page.content_analysis.supporting_keywords?.includes(keyword.mainKeyword);

        console.log('Keyword found:', {
          keyword: keyword.mainKeyword,
          inPrimary: isMainKeyword,
          inSupporting: isSupporting
        });

        return {
          mainKeyword: keyword.mainKeyword,
          sourceUrl: keyword.sourceUrl,
          type: isMainKeyword ? 'primary' : isSupporting ? 'supporting' : 'regular',
          pageInfo: {
            title: page.website_info.title,
            description: page.website_info.meta_description,
            url: page.website_info.url,
            domain: page.website_info.domain,
            headings: page.content_analysis.key_sections,
            content: page.content_analysis.summary,
            sections: page.content_analysis.key_sections,
            wordCount: page.seo_metrics.total_word_count,
            readabilityScore: page.seo_metrics.seo_score,
            contentAnalysis: {
              mainTopic: page.content_analysis.main_topic,
              subTopics: page.content_analysis.sub_topics,
              type: page.content_analysis.type,
              intent: page.content_analysis.overall_intent,
              primaryKeywords: page.content_analysis.primary_keywords,
              supportingKeywords: page.content_analysis.supporting_keywords,
              nlpKeywords: page.content_analysis.nlp_keywords,
              offerings: page.content_analysis.offerings,
              uniqueValueProps: page.content_analysis.unique_value_propositions
            },
            seoMetrics: {
              keywordDensity: page.seo_metrics.keyword_density,
              seoScore: page.seo_metrics.seo_score
            }
          }
        };
      }

      console.log('Page not found for domain:', keyword.sourceUrl);
      return keyword;
    }));

    const analysisData = {
      targetDomain,
      selectedKeywords: enrichedKeywords,
      timestamp: new Date().toISOString(),
      analysisContext: {
        totalKeywords: enrichedKeywords.length,
        domainInfo: {
          domain: targetDomain
        },
        contentStrategy: {
          existingContent: enrichedKeywords.map(k => ({
            keyword: k.mainKeyword,
            pageInfo: {
              title: k.pageInfo?.title,
              description: k.pageInfo?.description,
              mainTopic: k.pageInfo?.contentAnalysis?.mainTopic,
              subTopics: k.pageInfo?.contentAnalysis?.subTopics || [],
              intent: k.pageInfo?.contentAnalysis?.intent,
              offerings: k.pageInfo?.contentAnalysis?.offerings || [],
              uniqueValueProps: k.pageInfo?.contentAnalysis?.uniqueValueProps || []
            },
            seoMetrics: k.pageInfo?.seoMetrics || {}
          })),
          competitorAnalysis: enrichedKeywords.map(k => ({
            keyword: k.mainKeyword,
            sourceUrl: k.sourceUrl,
            pageStructure: {
              sections: k.pageInfo?.sections || [],
              wordCount: k.pageInfo?.wordCount,
              readabilityScore: k.pageInfo?.readabilityScore
            },
            keywordUsage: {
              primaryKeywords: k.pageInfo?.contentAnalysis?.primaryKeywords || [],
              supportingKeywords: k.pageInfo?.contentAnalysis?.supportingKeywords || [],
              nlpKeywords: k.pageInfo?.contentAnalysis?.nlpKeywords || [],
              density: k.pageInfo?.seoMetrics?.keywordDensity || {}
            }
          }))
        }
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
