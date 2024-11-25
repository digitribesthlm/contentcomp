import OpenAI from 'openai';
import { contentRecommendationTemplate } from '../../utils/contentTemplate';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { analysisData } = req.body;
    
    // Extract relevant data from the analysis
    const selectedKeywords = analysisData.keywords.map(k => ({
      keyword: k.keyword,
      type: k.keywordAnalysis?.inPrimaryKeywords ? 'primary' : 'supporting',
      sourceUrl: k.sourceUrl
    }));

    // Competitor data from the analyzed keywords
    const competitorData = analysisData.keywords.map(k => ({
      domain: k.sourceUrl,
      url: k.pageInfo?.url,
      mainTopic: k.pageInfo?.mainTopic,
      keywords: {
        primary: k.keywordAnalysis?.primaryKeywords || [],
        supporting: k.keywordAnalysis?.supportingKeywords || []
      }
    }));

    // Company's current content from companyData
    const companyContent = analysisData.companyData?.pages.map(page => ({
      url: page.url,
      mainTopic: page.mainTopic,
      mainKeywords: page.mainKeywords
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "You are a B2B content strategist specializing in Microsoft services and business intelligence solutions. Your task is to analyze inputs and provide detailed content recommendations in JSON format."
        },
        {
          role: "user",
          content: `Please analyze these keywords and provide content recommendations in JSON format based on our current content and competitor analysis.
          
          Selected Keywords for Analysis:
          ${JSON.stringify(selectedKeywords, null, 2)}
          
          Our Current Content Coverage:
          ${JSON.stringify(companyContent, null, 2)}
          
          Competitor Content Analysis:
          ${JSON.stringify(competitorData, null, 2)}
          
          Target Domain: ${analysisData.targetDomain}
          
          Please provide recommendations in this exact JSON structure:
          ${JSON.stringify(contentRecommendationTemplate, null, 2)}
          
          Consider and include in your JSON response:
          1. Whether to create new content or enhance existing content based on our current pages
          2. Technical depth and expertise positioning
          3. Integration with current service offerings
          4. SEO optimization opportunities
          5. Competitive differentiation
          6. How to best utilize the identified keywords in the content
          7. Content gaps compared to competitors
          8. Opportunities to expand on topics where competitors are weak`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const analysis = completion.choices[0].message.content;
    return res.status(200).json(JSON.parse(analysis));
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
}
