import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('seo_structure_pages_json');

    // Get unique domains from the database
    const domains = await collection.distinct('website_info.domain');

    if (!domains || domains.length === 0) {
      return res.status(404).json({ message: 'No domains found in database' });
    }

    return res.status(200).json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return res.status(500).json({ message: 'Failed to fetch domains' });
  }
}
