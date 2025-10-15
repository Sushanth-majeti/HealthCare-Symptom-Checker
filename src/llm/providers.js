const { GoogleGenerativeAI } = require('@google/generative-ai');

class LLMProviders {
  constructor() {
    this.gemini = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(
      process.env.GOOGLE_API_KEY
    ) : null;
  }

  async analyzeSymptoms(symptoms) {
    if (!this.gemini) {
      throw new Error('Google API key not configured. Please add your Google Gemini API key to the environment variables.');
    }

    const prompt = this.buildPrompt(symptoms);
    return await this.callGemini(prompt);
  }

  buildPrompt(symptoms) {
    return `You are a medical education assistant. Analyze these symptoms for educational purposes only.

Symptoms: ${symptoms}

IMPORTANT: Respond ONLY with valid JSON in this exact format (no additional text):

{
  "conditions": [
    "Possible condition 1 with educational context",
    "Possible condition 2 with educational context"
  ],
  "nextSteps": [
    "Recommended step 1",
    "Recommended step 2",
    "Consult with a healthcare professional"
  ],
  "urgentCare": [
    "When to seek immediate medical attention",
    "Emergency warning signs to watch for"
  ],
  "disclaimer": "This is for educational purposes only. Always consult healthcare professionals for medical advice, diagnosis, or treatment."
}

Requirements:
- Educational purpose only
- Include safety warnings
- Recommend professional consultation
- Valid JSON format only`;
  }

  async callGemini(prompt) {
    try {
      const modelNames = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      
      for (const modelName of modelNames) {
        try {
          const model = this.gemini.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000,
            }
          });
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const responseText = response.text();
          
          console.log(`✅ ${modelName} responded successfully`);
          console.log('Response preview:', responseText.substring(0, 100) + '...');
          
          return this.parseResponse(responseText);
        } catch (error) {
          console.log(`Model ${modelName} failed, trying next...`);
          continue;
        }
      }
      
      throw new Error('All Gemini models failed. Please check your API key and try again.');
      
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw error;
    }
  }

  parseResponse(text) {
    try {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd);
      }
      
      const parsed = JSON.parse(cleanText);
      
      if (parsed.conditions && parsed.nextSteps && parsed.urgentCare && parsed.disclaimer) {
        return parsed;
      } else {
        throw new Error('Missing required fields in AI response');
      }
      
    } catch (error) {
      console.log('JSON parsing failed:', error.message);
      console.log('Raw response:', text.substring(0, 200) + '...');
      return this.extractFromText(text);
    }
  }

  extractFromText(text) {
    return {
      conditions: [
        "Based on the symptoms described, several conditions could be possible",
        "Professional medical evaluation is recommended for accurate diagnosis"
      ],
      nextSteps: [
        "Monitor symptoms closely",
        "Stay hydrated and rest",
        "Consult with a healthcare professional for proper evaluation",
        "Keep track of any changes in symptoms"
      ],
      urgentCare: [
        "Seek immediate medical attention if symptoms worsen rapidly",
        "Contact emergency services for severe or life-threatening symptoms",
        "Don't delay seeking help if you feel seriously unwell"
      ],
      disclaimer: "This is for educational purposes only. Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.",
      rawResponse: text,
      note: "AI response was not in expected JSON format - using fallback structure"
    };
  }
}

module.exports = new LLMProviders();