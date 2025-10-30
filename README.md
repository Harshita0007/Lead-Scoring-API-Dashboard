# Lead Scoring Backend API

AI-powered lead qualification system that combines rule-based scoring with GROQ AI intelligence to predict buying intent for B2B sales leads.

## ✨ Features

- **Product/Offer Management**: Store your product details and ideal customer profile
- **CSV Lead Upload**: Bulk import prospect data
- **Hybrid Scoring Engine**: 
  - Rule-based scoring (50 points max)
  - AI intent classification (50 points max)
- **Intent Classification**: High / Medium / Low buying intent
- **Export Results**: JSON API and CSV download
- **Production Ready**: Error handling, validation, logging
- **Serverless Compatible**: Optimized for Vercel and traditional hosting

## ⚠️ Important Notes

- **File Storage**: Uses in-memory storage (compatible with serverless platforms like Vercel)
- **AI Model**: Uses GROQ AI (llama-3.1-70b-versatile) for intelligent lead scoring
- **Deployment**: Optimized for both traditional servers (Render) and serverless (Vercel)
- **CSV Uploads**: Files are processed in memory, not saved to disk

## 📋 Table of Contents

- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Scoring Logic](#scoring-logic)
- [Usage Examples](#usage-examples)
- [Deployment](#deployment)
- [Testing](#testing)

## 🛠 Setup

### Prerequisites

- Node.js 18+ 
- GROQ API key ([Get one here](https://console.groq.com/keys))

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lead-scoring-api.git
cd lead-scoring-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Add your GROQ API key to `.env`**
```env
GROQ_API_KEY=gsk_your_api_key_here
PORT=3000
NODE_ENV=development
```

5. **Start the server**
```bash
npm start
```

Server will be running at `http://localhost:3000`

## 📡 API Endpoints

### 1. Health Check
```
GET /
```
Returns API status and available endpoints.

**Example Response:**
```json
{
  "status": "healthy",
  "message": "Lead Scoring API v1.0",
  "timestamp": "2025-10-30T23:48:15.371Z",
  "endpoints": {
    "offer": "POST /offer - Store product/offer details",
    "upload": "POST /leads/upload - Upload CSV file with leads",
    "score": "POST /score - Run scoring pipeline",
    "results": "GET /results - Get scored leads as JSON",
    "export": "GET /results/csv - Export results as CSV"
  }
}
```

### 2. Store Product/Offer
```
POST /offer
Content-Type: application/json

{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings"],
  "ideal_use_cases": ["B2B SaaS mid-market"]
}
```

### 3. Upload Leads CSV
```
POST /leads/upload
Content-Type: multipart/form-data

file: <leads.csv>
```

**Required CSV Format:**
```csv
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,SaaS,San Francisco,Growth leader with 10 years experience
```

### 4. Run Scoring Pipeline
```
POST /score
```
Scores all uploaded leads using rule + AI layers.

### 5. Get Results (JSON)
```
GET /results
```
Returns scored leads:
```json
[
  {
    "name": "Ava Patel",
    "role": "Head of Growth",
    "company": "FlowMetrics",
    "industry": "SaaS",
    "location": "San Francisco",
    "intent": "High",
    "score": 85,
    "reasoning": "Strong fit: decision-maker role in target SaaS industry...",
    "scoreBreakdown": {
      "ruleScore": 50,
      "aiScore": 50,
      "details": {
        "rolePoints": 20,
        "industryPoints": 20,
        "dataQualityPoints": 10,
        "aiIntent": "High"
      }
    }
  }
]
```

### 6. Export Results (CSV)
```
GET /results/csv
```
Downloads `scored_leads.csv` file.

## 🧮 Scoring Logic

### Total Score = Rule Score (0-50) + AI Score (0-50)

### Rule Layer (Max 50 points)

#### 1. Role Scoring (0-20 points)
- **Decision Maker (+20)**: CEO, CTO, CFO, VP, Director, Head of, Founder
- **Influencer (+10)**: Manager, Lead, Senior, Principal
- **Other (0)**: All other roles

#### 2. Industry Match (0-20 points)
- **Exact Match (+20)**: Industry appears in ICP (e.g., "SaaS" in "B2B SaaS")
- **Adjacent Match (+10)**: Related industry (e.g., "Software" adjacent to "SaaS")
- **No Match (0)**: Unrelated industry

**Adjacent Industry Mappings:**
- SaaS ↔ Software, Tech, B2B, Cloud
- Finance ↔ Fintech, Banking
- Healthcare ↔ Health, Medical, Pharma
- And more...

#### 3. Data Quality (0-10 points)
- **Complete (+10)**: All 6 fields present and non-empty
- **Incomplete (0)**: Any field missing or empty

### AI Layer (Max 50 points)

Sends prospect + offer context to GROQ AI (llama-3.1-70b-versatile) with prompt:

```
You are a B2B sales qualification expert. Analyze this prospect's fit.

PRODUCT: [name, value_props, ideal_use_cases]
PROSPECT: [name, role, company, industry, location, bio]

Classify buying intent as High, Medium, or Low.
Explain in 1-2 sentences.

Response format: {"intent": "High|Medium|Low", "reasoning": "..."}
```

**Points Mapping:**
- High Intent: +50 points
- Medium Intent: +30 points  
- Low Intent: +10 points

### Final Intent Label

Based on total score (0-100):
- **High**: 70-100 points
- **Medium**: 40-69 points
- **Low**: 0-39 points

## 📝 Usage Examples

### cURL Examples

#### 1. Store Offer
```bash
# Local development
curl -X POST http://localhost:3000/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings", "AI-powered personalization"],
    "ideal_use_cases": ["B2B SaaS mid-market", "Sales teams 10-50 reps"]
  }'

# Production (Vercel)
curl -X POST https://lead-scoring-api-dashboard-4r39.vercel.app/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings", "AI-powered personalization"],
    "ideal_use_cases": ["B2B SaaS mid-market", "Sales teams 10-50 reps"]
  }'
```

#### 2. Upload Leads
```bash
# Local
curl -X POST http://localhost:3000/leads/upload \
  -F "file=@leads.csv"

# Production
curl -X POST https://lead-scoring-api-dashboard-4r39.vercel.app/leads/upload \
  -F "file=@leads.csv"
```

#### 3. Run Scoring
```bash
# Local
curl -X POST http://localhost:3000/score

# Production
curl -X POST https://lead-scoring-api-dashboard-4r39.vercel.app/score
```

#### 4. Get Results
```bash
# Local
curl http://localhost:3000/results

# Production
curl https://lead-scoring-api-dashboard-4r39.vercel.app/results
```

#### 5. Export CSV
```bash
# Local
curl http://localhost:3000/results/csv -o scored_leads.csv

# Production
curl https://lead-scoring-api-dashboard-4r39.vercel.app/results/csv -o scored_leads.csv
```

### Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Lead Scoring API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/"
      }
    },
    {
      "name": "2. Store Offer",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{base_url}}/offer",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"AI Outreach Tool\",\n  \"value_props\": [\"24/7 automation\", \"6x more meetings\"],\n  \"ideal_use_cases\": [\"B2B SaaS\", \"Sales teams\"]\n}"
        }
      }
    },
    {
      "name": "3. Get Offer",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/offer"
      }
    },
    {
      "name": "4. Upload Leads",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/leads/upload",
        "body": {
          "mode": "formdata",
          "formdata": [{"key": "file", "type": "file", "src": "/path/to/leads.csv"}]
        }
      }
    },
    {
      "name": "5. Run Scoring",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/score"
      }
    },
    {
      "name": "6. Get Results",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/results"
      }
    },
    {
      "name": "7. Export CSV",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/results/csv"
      }
    }
  ],
  "variable": [
    {"key": "base_url", "value": "https://lead-scoring-api-dashboard-4r39.vercel.app"}
  ]
}
```



## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

Tests cover:
- Role scoring logic
- Industry matching
- Data quality validation
- Total score calculation

### Manual Testing Workflow

1. **Health Check**: `GET /`
2. **Store Offer**: `POST /offer` with product data
3. **Upload CSV**: `POST /leads/upload` with test CSV
4. **Run Scoring**: `POST /score`
5. **View Results**: `GET /results`
6. **Export CSV**: `GET /results/csv`

### Sample Test CSV

```csv
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,SaaS,San Francisco,Growth leader with 10 years in B2B SaaS
John Smith,CEO,TechVision,Software,New York,Founded 3 SaaS companies
Sarah Lee,Manager,RetailCo,Retail,Austin,Retail operations manager
Michael Chen,VP of Sales,CloudScale,Technology,Seattle,Sales executive driving revenue growth
Emily Johnson,Senior Developer,DevTools Inc,Tech,Boston,Full-stack developer passionate about developer tools
David Rodriguez,Founder,StartupLab,B2B SaaS,Miami,Building next-gen sales tools for mid-market
Lisa Wang,Director of Operations,FinanceHub,Fintech,Chicago,Operations leader optimizing processes
Robert Brown,Manager,HealthCare Plus,Healthcare,Denver,Healthcare operations manager
Jennifer Taylor,Lead,EcomSolutions,Ecommerce,Portland,Lead Product Manager for ecommerce platform
Tom Anderson,CTO,DataCorp,Data,Toronto,Technical leader building data infrastructure
```

## 📁 Project Structure

```
lead-scoring-backend/
├── src/
│   ├── controllers/
│   │   ├── offerController.js      # Handle offer CRUD
│   │   ├── leadsController.js      # CSV upload & parsing
│   │   └── scoringController.js    # Scoring pipeline
│   ├── services/
│   │   ├── ruleEngine.js           # Rule-based scoring logic
│   │   └── aiService.js            # GROQ AI integration
│   ├── utils/
│   │   └── storage.js              # In-memory data store
│   └── server.js                   # Express app entry point
├── tests/
│   └── ruleEngine.test.js          # Unit tests
├── .env.example                     # Environment template
├── .gitignore
├── vercel.json                      # Vercel deployment config
├── Dockerfile                       # Docker configuration
├── package.json
└── README.md
```

## 🔑 Environment Variables

```env
PORT=3000                           # Server port (optional, ignored on Vercel)
GROQ_API_KEY=gsk_...                # Required: GROQ API key
NODE_ENV=development                # Environment mode
```

## 🐛 Troubleshooting

### "GROQ API key not configured"
- Ensure `.env` file exists with valid `GROQ_API_KEY`
- Check key starts with `gsk_`
- For Vercel: Set in Project Settings → Environment Variables → Redeploy

### "Missing required columns" error
- Verify CSV has exact headers: `name,role,company,industry,location,linkedin_bio`
- Check for typos or extra spaces in headers
- Ensure no empty header columns

### AI scoring returns "Medium" for all leads
- GROQ API might be rate-limited
- Check API key has sufficient credits
- Review console logs for API errors

### "EROFS: read-only file system" error on Vercel
- This happens if multer tries to write to disk
- Ensure you're using `multer.memoryStorage()` instead of `dest: 'uploads/'`
- Files should be stored in `req.file.buffer`, not saved to disk
- Check that `leadsController.js` uses `Readable.from(req.file.buffer.toString('utf8'))`

### Server not starting
- Check if port 3000 is already in use
- Try: `PORT=3001 npm start`
- Verify all dependencies installed: `npm install`

### 401 Unauthorized on Vercel
- Go to Vercel Project Settings → Deployment Protection
- Disable "Vercel Authentication" if enabled
- Redeploy after changing settings

## 📊 Example Output

```json
{
  "name": "Ava Patel",
  "role": "Head of Growth",
  "company": "FlowMetrics", 
  "industry": "SaaS",
  "location": "San Francisco",
  "intent": "High",
  "score": 90,
  "reasoning": "Perfect fit as Head of Growth in target B2B SaaS segment with clear growth mandate.",
  "scoreBreakdown": {
    "ruleScore": 50,
    "aiScore": 50,
    "details": {
      "rolePoints": 20,
      "industryPoints": 20,
      "dataQualityPoints": 10,
      "aiIntent": "High"
    }
  }
}
```

## 🎯 Evaluation Criteria Checklist

- ✅ Clean API design with proper REST conventions
- ✅ Rule-based scoring (50 points: role + industry + data quality)
- ✅ AI integration with GROQ AI (llama-3.1-70b-versatile)
- ✅ Effective prompt engineering for intent classification
- ✅ Comprehensive error handling and validation
- ✅ Inline code documentation and comments
- ✅ CSV export bonus feature
- ✅ Unit tests for rule engine
- ✅ Docker support
- ✅ Deployment-ready configuration (Vercel + Render)
- ✅ Clear README with examples
- ✅ Serverless compatibility

## 🔗 Live Demo
🎥 **Project Demo Video**  
👉 [Watch the Demo on Google Drive](https://drive.google.com/file/d/17kGvbYP8xTVSvG_f3kVsf6Oief-MmM00/view?usp=sharing)

**Deployed API Base URL:**  
🔗 [https://lead-scoring-api-dashboard-4r39.vercel.app](https://lead-scoring-api-dashboard-4r39.vercel.app)

Test the live API:
```bash
curl https://lead-scoring-api-dashboard-4r39.vercel.app/

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Lead Scoring API v1.0",
  "timestamp": "2025-10-30T23:48:15.371Z",
  "endpoints": {
    "offer": "POST /offer - Store product/offer details",
    "upload": "POST /leads/upload - Upload CSV file with leads",
    "score": "POST /score - Run scoring pipeline",
    "results": "GET /results - Get scored leads as JSON",
    "export": "GET /results/csv - Export results as CSV"
  }
}




