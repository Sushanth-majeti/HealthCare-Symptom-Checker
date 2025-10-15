# Healthcare Symptom Checker

**EDUCATIONAL PURPOSE ONLY - NOT FOR MEDICAL DIAGNOSIS**

A modern, AI-powered symptom checker application that uses Google Gemini AI to suggest possible conditions and next steps based on user-reported symptoms.

##  Quick Setup

### Prerequisites
- Node.js (v14 or higher)
- Google API Key for Gemini AI

### 1. Get Google API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- **Important**: A valid API key is required for the application to function

### 2. Configure Environment
# Create .env file from the template
cp .env.example .env

# Edit .env and add your API key:
GOOGLE_API_KEY=your_actual_api_key_here


### 3. Install Dependencies

npm install


### 4. Run the Application

npm start


### 5. Access the Application
- **Frontend**: http://localhost:7810
- **API**: http://localhost:7810/api
- **Health Check**: http://localhost:7810/health

##  API Usage

### Analyze Symptoms

curl -X POST http://localhost:7810/api/symptoms \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "headache and fever for 2 days",
    "language": "en"
  }'


### Get Analysis History
curl http://localhost:7810/api/history

### Health Check
curl http://localhost:7810/health

##  Environment Variables

Create a `.env` file in the root directory:

GOOGLE_API_KEY=your_google_gemini_api_key_here
PORT=7810
NODE_ENV=development

## Deployment

### Local Development
npm run dev

### Production Build
npm start

### Vercel Deployment
npm run build
vercel --prod

### Successful Analysis
```json
{
  "success": true,
  "data": {
    "conditions": [
      {
        "name": "Common Cold",
        "confidence": "85%",
        "symptoms": ["Runny nose", "Sore throat", "Cough"],
        "recommendations": ["Rest", "Hydration", "Over-the-counter medicine"]
      }
    ],
    "disclaimer": "Educational purposes only - consult a doctor"
  }
}


### Error Response

{
  "success": false,
  "error": "Invalid API key",
  "message": "Please check your Google API configuration"
}


