import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    const pages = await db
      .collection("seo_structure_pages_json")
      .find({})
      .toArray();

    res.json({ pages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
} 