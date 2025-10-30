/**
 * Rule-based scoring engine
 * Assigns up to 50 points based on:
 * - Role relevance (20 points max)
 * - Industry match (20 points max)
 * - Data completeness (10 points max)
 */

// Decision maker keywords (20 points)
const DECISION_MAKER_ROLES = [
  'ceo', 'cto', 'cfo', 'coo', 'cmo',
  'founder', 'co-founder', 'owner',
  'president', 'vp', 'vice president',
  'director', 'head of', 'chief'
];

// Influencer keywords (10 points)
const INFLUENCER_ROLES = [
  'manager', 'lead', 'senior', 'sr',
  'principal', 'architect', 'specialist'
];

/**
 * Score based on job role/title
 * @param {string} role - Job title
 * @returns {number} Points (0, 10, or 20)
 */
function scoreRole(role) {
  if (!role) return 0;
  
  const roleLower = role.toLowerCase().trim();
  
  // Check for decision maker keywords
  for (const keyword of DECISION_MAKER_ROLES) {
    if (roleLower.includes(keyword)) {
      return 20;
    }
  }
  
  // Check for influencer keywords
  for (const keyword of INFLUENCER_ROLES) {
    if (roleLower.includes(keyword)) {
      return 10;
    }
  }
  
  return 0;
}

/**
 * Score based on industry match with ICP
 * @param {string} leadIndustry - Lead's industry
 * @param {Array<string>} idealUseCases - Ideal customer profiles
 * @returns {number} Points (0, 10, or 20)
 */
function scoreIndustry(leadIndustry, idealUseCases) {
  if (!leadIndustry || !idealUseCases || idealUseCases.length === 0) {
    return 0;
  }
  
  const leadIndustryLower = leadIndustry.toLowerCase().trim();
  const icpString = idealUseCases.join(' ').toLowerCase();
  
  // Exact match: check if industry appears in ICP
  if (icpString.includes(leadIndustryLower) || 
      leadIndustryLower.includes(icpString)) {
    return 20;
  }
  
  // Adjacent industry matching (fuzzy logic)
  const adjacentMatches = {
    'saas': ['software', 'tech', 'technology', 'b2b', 'cloud'],
    'software': ['saas', 'tech', 'technology', 'it'],
    'tech': ['software', 'saas', 'technology', 'it', 'digital'],
    'technology': ['tech', 'software', 'saas', 'it'],
    'finance': ['fintech', 'banking', 'financial', 'investment'],
    'fintech': ['finance', 'banking', 'financial'],
    'healthcare': ['health', 'medical', 'pharma', 'hospital'],
    'ecommerce': ['retail', 'commerce', 'shopping', 'marketplace'],
    'b2b': ['saas', 'enterprise', 'business'],
    'enterprise': ['b2b', 'corporate', 'business']
  };
  
  // Check for adjacent matches
  for (const [key, adjacents] of Object.entries(adjacentMatches)) {
    if (leadIndustryLower.includes(key)) {
      for (const adjacent of adjacents) {
        if (icpString.includes(adjacent)) {
          return 10;
        }
      }
    }
  }
  
  return 0;
}

/**
 * Score based on data completeness
 * @param {Object} lead - Lead data object
 * @returns {number} Points (0 or 10)
 */
function scoreDataQuality(lead) {
  const requiredFields = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
  
  // Check if all fields are present and non-empty
  const allFieldsPresent = requiredFields.every(field => {
    const value = lead[field];
    return value && value.toString().trim().length > 0;
  });
  
  return allFieldsPresent ? 10 : 0;
}

/**
 * Calculate total rule-based score for a lead
 * @param {Object} lead - Lead data
 * @param {Object} offer - Offer/product data
 * @returns {Object} Score breakdown
 */
function calculateRuleScore(lead, offer) {
  const roleScore = scoreRole(lead.role);
  const industryScore = scoreIndustry(lead.industry, offer.ideal_use_cases);
  const qualityScore = scoreDataQuality(lead);
  
  return {
    total: roleScore + industryScore + qualityScore,
    breakdown: {
      role: roleScore,
      industry: industryScore,
      dataQuality: qualityScore
    }
  };
}

module.exports = {
  calculateRuleScore,
  scoreRole,
  scoreIndustry,
  scoreDataQuality
};