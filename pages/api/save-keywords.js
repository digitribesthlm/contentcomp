import { connectToDatabase } from '../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { keywords, domain } = req.body;
    const { db } = await connectToDatabase();

    const timestamp = Date.now();

    // Create the document structure
    const document = {
      domain: domain,
      keywords: keywords.map(({ 
        keyword, 
        competitorDomain, 
        url, 
        isPrimary, 
        isSupporting, 
        density 
      }) => ({
        keyword,
        competitorDomain,
        url, // Store the actual competitor URL
        isPrimary: isPrimary || false,
        isSupporting: isSupporting || false,
        density: density || 0,
        addedAt: new Date(timestamp).toISOString(),
        createdAt: {
          $date: {
            $numberLong: timestamp.toString()
          }
        },
        id: {
          $oid: new ObjectId().toString()
        }
      })),
      createdAt: {
        $date: {
          $numberLong: timestamp.toString()
        }
      },
      updatedAt: {
        $date: {
          $numberLong: timestamp.toString()
        }
      }
    };

    // Insert into MongoDB
    const result = await db.collection('saved_keywords').insertOne(document);

    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error saving keywords:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
