import { clientPromise, dbName } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
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