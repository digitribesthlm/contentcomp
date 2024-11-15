// pages/api/analyze-seo.js
import OpenAI from 'openai';
import { seoAnalysisTemplate } from '../../utils/seoTemplates';

export const config = {
  maxDuration: 300,
  runtime: 'edge'
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    console.log('Received URL:', url);

    // Check API keys
    console.log('JINA_API_KEY exists:', !!process.env.JINA_API_KEY);
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

    // Scrape website content
    console.log('Attempting to scrape with Jina AI...');
    const scrapeResponse = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Authorization': `Bearer ${process.env.JINA_API_KEY}` }
    });

    console.log('Jina AI response status:', scrapeResponse.status);
    
    if (!scrapeResponse.ok) {
      throw new Error('Failed to scrape website');
    }

    const content = await scrapeResponse.text();
    console.log('Content retrieved, length:', content.length);

    // Analyze with OpenAI
    console.log('Starting OpenAI analysis...');
    try {
      console.log('Before OpenAI call');
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
      console.log('After OpenAI call');

      const analysis = JSON.parse(completion.choices[0].message.content);
      return new Response(JSON.stringify(analysis), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error('OpenAI Error:', e.message);
      throw e;
    }
  } catch (error) {
    console.error('Final error catch:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}