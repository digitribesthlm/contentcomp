// pages/api/analyze-seo.js
import OpenAI from 'openai';
import { seoAnalysisTemplate } from '../../utils/seoTemplates';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    // Scrape website content
    const scrapeResponse = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Authorization': `Bearer ${process.env.JINA_API_KEY}` }
    });

    if (!scrapeResponse.ok) {
      throw new Error('Failed to scrape website');
    }

    const content = await scrapeResponse.text();

    // Analyze with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "You are a SEO analyzer that extracts website information into structured JSON format."
        },
        {
          role: "user",
          content: `Analyze this website content and return data matching this schema: ${JSON.stringify(seoAnalysisTemplate)}
                   Content to analyze: ${content}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}