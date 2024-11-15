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
    console.log('Initializing OpenAI request...');
    
    try {
      console.log('Sending request to OpenAI API...');
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

      console.log('OpenAI response received');
      console.log('Response status:', completion.status);
      console.log('Model used:', completion.model);
      console.log('Response tokens:', {
        completion_tokens: completion.usage?.completion_tokens,
        prompt_tokens: completion.usage?.prompt_tokens,
        total_tokens: completion.usage?.total_tokens
      });

      if (!completion.choices || !completion.choices[0]) {
        throw new Error('No completion choices returned from OpenAI');
      }

      console.log('Parsing OpenAI response...');
      const analysis = JSON.parse(completion.choices[0].message.content);
      console.log('Analysis parsed successfully');
      
      res.status(200).json(analysis);
    } catch (openAiError) {
      console.error('OpenAI API Error Details:', {
        error: openAiError,
        message: openAiError.message,
        type: openAiError.type,
        code: openAiError.code,
        status: openAiError.status,
        statusText: openAiError.statusText,
        response: openAiError.response,
        stack: openAiError.stack
      });
      throw new Error(`OpenAI API Error: ${openAiError.message}`);
    }
  } catch (error) {
    console.error('Error in analyze-seo:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}