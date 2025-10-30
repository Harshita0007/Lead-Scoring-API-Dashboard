const { calculateRuleScore } = require('../services/ruleEngine');
const { classifyIntent } = require('../services/aiService');
const storage = require('../utils/storage');

/**
 * POST /score
 * Execute scoring pipeline on uploaded leads
 */
async function scoreLeads(req, res) {
  try {
    const offer = storage.getOffer();
    const leads = storage.getLeads();
    
    // Validate prerequisites
    if (!offer) {
      return res.status(400).json({ 
        error: 'No offer data found. Please POST to /offer first.'
      });
    }
    
    if (!leads || leads.length === 0) {
      return res.status(400).json({ 
        error: 'No leads found. Please POST to /leads/upload first.'
      });
    }
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'Groq API key not configured'
      });
    }
    
    console.log(`🔄 Scoring ${leads.length} leads...`);
    const scoredLeads = [];
    
    // Process each lead
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      console.log(`Processing lead ${i + 1}/${leads.length}: ${lead.name}`);
      
      try {
        // Step 1: Calculate rule-based score (max 50 points)
        const ruleResult = calculateRuleScore(lead, offer);
        
        // Step 2: Get AI classification (max 50 points)
        const aiResult = await classifyIntent(lead, offer);
        
        // Step 3: Calculate total score
        const totalScore = ruleResult.total + aiResult.points;
        
        // Step 4: Determine final intent label
        let finalIntent;
        if (totalScore >= 70) finalIntent = 'High';
        else if (totalScore >= 40) finalIntent = 'Medium';
        else finalIntent = 'Low';
        
        scoredLeads.push({
          name: lead.name,
          role: lead.role,
          company: lead.company,
          industry: lead.industry,
          location: lead.location,
          intent: finalIntent,
          score: totalScore,
          reasoning: aiResult.reasoning,
          scoreBreakdown: {
            ruleScore: ruleResult.total,
            aiScore: aiResult.points,
            details: {
              rolePoints: ruleResult.breakdown.role,
              industryPoints: ruleResult.breakdown.industry,
              dataQualityPoints: ruleResult.breakdown.dataQuality,
              aiIntent: aiResult.intent
            }
          }
        });
        
      } catch (error) {
        console.error(`Error scoring lead ${lead.name}:`, error.message);
        // Continue with next lead instead of failing entire batch
        scoredLeads.push({
          name: lead.name,
          role: lead.role,
          company: lead.company,
          intent: 'Low',
          score: 0,
          reasoning: `Error during scoring: ${error.message}`,
          error: true
        });
      }
    }
    
    // Store results
    storage.setResults(scoredLeads);
    
    // Calculate summary statistics
    const summary = {
      total: scoredLeads.length,
      high: scoredLeads.filter(l => l.intent === 'High').length,
      medium: scoredLeads.filter(l => l.intent === 'Medium').length,
      low: scoredLeads.filter(l => l.intent === 'Low').length,
      averageScore: Math.round(
        scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length
      )
    };
    
    console.log(`✅ Scoring complete. Summary:`, summary);
    
    res.json({
      message: 'Scoring completed successfully',
      summary,
      preview: scoredLeads.slice(0, 5)
    });
    
  } catch (error) {
    console.error('Scoring pipeline error:', error);
    res.status(500).json({ 
      error: 'Failed to score leads',
      message: error.message
    });
  }
}

/**
 * GET /results
 * Retrieve all scored leads as JSON
 */
function getResults(req, res) {
  const results = storage.getResults();
  
  if (!results || results.length === 0) {
    return res.status(404).json({ 
      error: 'No results found. Please POST to /score first.'
    });
  }
  
  res.json(results);
}

/**
 * GET /results/csv
 * Export scored leads as CSV file (BONUS feature)
 */
function exportResultsCSV(req, res) {
  const results = storage.getResults();
  
  if (!results || results.length === 0) {
    return res.status(404).json({ 
      error: 'No results found. Please POST to /score first.'
    });
  }
  
  // Create CSV header
  const headers = 'name,role,company,industry,location,intent,score,reasoning\n';
  
  // Create CSV rows
  const rows = results.map(r => {
    // Escape quotes in reasoning text
    const reasoning = (r.reasoning || '').replace(/"/g, '""');
    return `"${r.name}","${r.role}","${r.company}","${r.industry}","${r.location}","${r.intent}",${r.score},"${reasoning}"`;
  }).join('\n');
  
  const csv = headers + rows;
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=scored_leads.csv');
  res.send(csv);
}

module.exports = {
  scoreLeads,
  getResults,
  exportResultsCSV
};