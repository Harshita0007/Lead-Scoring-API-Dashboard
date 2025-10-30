const { 
  scoreRole, 
  scoreIndustry, 
  scoreDataQuality,
  calculateRuleScore 
} = require('../src/services/ruleEngine');

describe('Rule Engine Tests', () => {
  
  describe('scoreRole', () => {
    test('should score decision maker roles as 20 points', () => {
      expect(scoreRole('CEO')).toBe(20);
      expect(scoreRole('Chief Technology Officer')).toBe(20);
      expect(scoreRole('VP of Sales')).toBe(20);
      expect(scoreRole('Head of Marketing')).toBe(20);
      expect(scoreRole('Founder')).toBe(20);
    });
    
    test('should score influencer roles as 10 points', () => {
      expect(scoreRole('Engineering Manager')).toBe(10);
      expect(scoreRole('Senior Developer')).toBe(10);
      expect(scoreRole('Product Lead')).toBe(10);
    });
    
    test('should score other roles as 0 points', () => {
      expect(scoreRole('Junior Developer')).toBe(0);
      expect(scoreRole('Intern')).toBe(0);
      expect(scoreRole('Associate')).toBe(0);
    });
    
    test('should handle empty or null role', () => {
      expect(scoreRole('')).toBe(0);
      expect(scoreRole(null)).toBe(0);
    });
  });
  
  describe('scoreIndustry', () => {
    const icpCases = ['B2B SaaS', 'mid-market'];
    
    test('should score exact match as 20 points', () => {
      expect(scoreIndustry('SaaS', icpCases)).toBe(20);
      expect(scoreIndustry('B2B', icpCases)).toBe(20);
    });
    
    test('should score adjacent match as 10 points', () => {
      expect(scoreIndustry('Software', icpCases)).toBe(10);
      expect(scoreIndustry('Technology', icpCases)).toBe(10);
    });
    
    test('should score no match as 0 points', () => {
      expect(scoreIndustry('Healthcare', icpCases)).toBe(0);
      expect(scoreIndustry('Retail', icpCases)).toBe(0);
    });
  });
  
  describe('scoreDataQuality', () => {
    test('should score complete data as 10 points', () => {
      const completeLead = {
        name: 'John Doe',
        role: 'CEO',
        company: 'Acme Inc',
        industry: 'SaaS',
        location: 'San Francisco',
        linkedin_bio: 'Experienced leader'
      };
      expect(scoreDataQuality(completeLead)).toBe(10);
    });
    
    test('should score incomplete data as 0 points', () => {
      const incompleteLead = {
        name: 'John Doe',
        role: '',
        company: 'Acme Inc',
        industry: 'SaaS',
        location: '',
        linkedin_bio: ''
      };
      expect(scoreDataQuality(incompleteLead)).toBe(0);
    });
  });
  
  describe('calculateRuleScore', () => {
    const offer = {
      name: 'AI Outreach Tool',
      value_props: ['24/7 automation', 'More meetings'],
      ideal_use_cases: ['B2B SaaS']
    };
    
    test('should calculate total score correctly', () => {
      const lead = {
        name: 'Jane Smith',
        role: 'VP of Sales',
        company: 'TechCorp',
        industry: 'SaaS',
        location: 'NYC',
        linkedin_bio: 'Sales leader'
      };
      
      const result = calculateRuleScore(lead, offer);
      expect(result.total).toBe(50); // 20 + 20 + 10
      expect(result.breakdown.role).toBe(20);
      expect(result.breakdown.industry).toBe(20);
      expect(result.breakdown.dataQuality).toBe(10);
    });
  });
});