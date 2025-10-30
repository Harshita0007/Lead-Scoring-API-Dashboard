const csv = require('csv-parser');
const { Readable } = require('stream'); // Add this import at the top
const storage = require('../utils/storage');

/**
 * POST /leads/upload
 * Upload and parse CSV file with lead data
 */
async function uploadLeads(req, res) {
  if (!req.file) {
    return res.status(400).json({ 
      error: 'No file uploaded. Please attach a CSV file.'
    });
  }
  
  const leads = [];
  const requiredColumns = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
  let headerValidated = false;
  
  try {
    await new Promise((resolve, reject) => {
      // ✅ Convert buffer to stream instead of reading from file path
      const bufferStream = Readable.from(req.file.buffer.toString('utf8'));
      
      bufferStream
        .pipe(csv())
        .on('headers', (headers) => {
          // Validate CSV headers
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          if (missingColumns.length > 0) {
            reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
            return;
          }
          headerValidated = true;
        })
        .on('data', (row) => {
          if (headerValidated) {
            leads.push({
              name: row.name || '',
              role: row.role || '',
              company: row.company || '',
              industry: row.industry || '',
              location: row.location || '',
              linkedin_bio: row.linkedin_bio || ''
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // ✅ No need to clean up files anymore - they're in memory!
    
    if (leads.length === 0) {
      return res.status(400).json({ 
        error: 'CSV file is empty or improperly formatted'
      });
    }
    
    // Store leads in memory
    storage.setLeads(leads);
    
    res.status(201).json({
      message: 'Leads uploaded successfully',
      count: leads.length,
      preview: leads.slice(0, 3)
    });
    
  } catch (error) {
    // ✅ No file cleanup needed anymore
    
    res.status(400).json({ 
      error: 'Failed to process CSV file',
      message: error.message
    });
  }
}

module.exports = { uploadLeads };