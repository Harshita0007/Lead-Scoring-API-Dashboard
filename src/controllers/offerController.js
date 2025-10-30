const storage = require('../utils/storage');

/**
 * POST /offer
 * Store product/offer details for lead scoring
 */
function setOffer(req, res) {
  try {
    const { name, value_props, ideal_use_cases } = req.body;
    
    // Validation
    if (!name || !value_props || !ideal_use_cases) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'value_props', 'ideal_use_cases']
      });
    }
    
    if (!Array.isArray(value_props) || !Array.isArray(ideal_use_cases)) {
      return res.status(400).json({ 
        error: 'value_props and ideal_use_cases must be arrays'
      });
    }
    
    const offer = { name, value_props, ideal_use_cases };
    storage.setOffer(offer);
    
    res.status(201).json({
      message: 'Offer stored successfully',
      offer
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to store offer',
      message: error.message 
    });
  }
}

/**
 * GET /offer
 * Retrieve stored offer details
 */
function getOffer(req, res) {
  const offer = storage.getOffer();
  
  if (!offer) {
    return res.status(404).json({ 
      error: 'No offer found. Please POST to /offer first.'
    });
  }
  
  res.json(offer);
}

module.exports = { setOffer, getOffer };