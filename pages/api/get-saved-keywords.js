import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    // Get all saved keywords without any transformation
    const savedKeywords = await db.collection('saved_keywords')
      .find({})
      .toArray();

    res.status(200).json(savedKeywords);
  } catch (error) {
    console.error('Error fetching saved keywords:', error);
    res.status(500).json({ error: error.message });
  }
}
