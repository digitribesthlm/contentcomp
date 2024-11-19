import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    // Validate the ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid page ID' });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('seo_structure_pages_json');

    // Find the page by its ObjectId
    const page = await collection.findOne({ _id: new ObjectId(id) });

    if (!page) {
      // Log additional diagnostic information
      console.error(`Page not found for ID: ${id}`);
      
      // Check if the collection exists and has any documents
      const collectionExists = await db.listCollections({ name: 'seo_structure_pages_json' }).hasNext();
      if (!collectionExists) {
        console.error('Collection seo_structure_pages_json does not exist');
        return res.status(500).json({ 
          message: 'Database collection not found',
          diagnostics: {
            id: id,
            collectionExists: false
          }
        });
      }

      // Count total documents in the collection
      const totalDocuments = await collection.countDocuments();
      console.error(`Total documents in collection: ${totalDocuments}`);

      return res.status(404).json({ 
        message: `Page not found for ID "${id}"`,
        diagnostics: {
          id: id,
          totalDocuments: totalDocuments
        }
      });
    }

    res.status(200).json(page);
  } catch (error) {
    console.error('Error in page details API:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch page details',
      error: error.toString()
    });
  }
}
