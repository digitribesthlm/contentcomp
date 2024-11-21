import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const analysis = req.body;
    
    // Add crawl date using JavaScript's Date object
    const analysisWithDate = {
      ...analysis,
      crawl_date: new Date().toISOString()
    };
    
    console.log('Saving analysis to MongoDB...');
    
    const result = await db.collection("seo_structure_pages_json").insertOne(analysisWithDate);
    
    console.log('Analysis saved successfully:', result);
    
    res.status(200).json({ message: 'Analysis saved successfully' });
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ error: error.message });
  }
}
