const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Use Groq AI (Llama 3) to classify lead intent and provide reasoning
 * @param {Object} lead - Lead information
 * @param {Object} offer - Product/offer information
 * @returns {Promise<Object>} { intent, reasoning, points }
 */
async function classifyIntent(lead, offer) {
  // Construct detailed prompt for AI
  const prompt = `You are a B2B sales qualification expert. Analyze this prospect's fit for our product.

PRODUCT INFORMATION:
- Name: ${offer.name}
- Value Propositions: ${offer.value_props.join(', ')}
- Ideal Use Cases: ${offer.ideal_use_cases.join(', ')}

PROSPECT INFORMATION:
- Name: ${lead.name}
- Role: ${lead.role}
- Company: ${lead.company}
- Industry: ${lead.industry}
- Location: ${lead.location}
- LinkedIn Bio: ${lead.linkedin_bio || 'Not provided'}

TASK:
Classify this prospect's buying intent as High, Medium, or Low based on their fit with the product's value propositions and ideal customer profile.

Consider:
1. Does their role suggest they have buying authority or influence?
2. Does their industry align with our ideal use cases?
3. Does their background/bio show relevant pain points or interests?

Respond in JSON format:
{
  "intent": "High|Medium|Low",
  "reasoning": "Brief 1-2 sentence explanation"
}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile', // Fast and accurate model
      messages: [
        { 
          role: 'system', 
          content: 'You are a B2B sales qualification expert. Analyze prospects and classify their buying intent accurately and concisely. Always respond with valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);
    
    // Map intent to points: High=50, Medium=30, Low=10
    const pointsMap = {
      'High': 50,
      'Medium': 30,
      'Low': 10
    };
    
    // Normalize intent (case-insensitive)
    const intent = result.intent.charAt(0).toUpperCase() + result.intent.slice(1).toLowerCase();
    
    return {
      intent: intent,
      reasoning: result.reasoning,
      points: pointsMap[intent] || 10
    };
    
  } catch (error) {
    console.error('Groq API error:', error.message);
    
    // Fallback: return Medium intent if AI fails
    return {
      intent: 'Medium',
      reasoning: 'AI analysis unavailable - using default classification',
      points: 30
    };
  }
}

module.exports = { classifyIntent };