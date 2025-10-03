# Invoice Readiness Analyzer

Built for the internship assignment - analyzes invoice data compliance with GETS v0.1 standards. This tool helps organizations understand their e-invoicing readiness and identify gaps.

## Features

- Upload CSV/JSON files or paste data directly
- Smart field mapping with similarity detection
- 5 validation rules: totals balance, line math, dates, currency, tax numbers
- Scoring: Data Quality (25%) + Field Coverage (35%) + Rule Compliance (30%) + Technical Posture (10%)
- 3-step wizard UI with data preview and interactive results
- Reports persist for 7 days with shareable links
- Dark/light theme support

## Tech Stack

**MERN Stack:**
- React frontend with Tailwind CSS
- Node.js/Express backend
- **MongoDB Atlas** (cloud database)
- Additional: Framer Motion, React Router, Mongoose

## Database Setup

**Database Choice: MongoDB Atlas**
- Cloud-hosted, survives server restarts
- 7-day TTL for automatic cleanup
- Reliable persistence as required by assignment

## Quick Start

1. **Install dependencies:**
```bash
git clone <repository-url>
cd invoice-readiness-analyzer
npm run install-all
```

2. **Configure database in `server/.env`:**
```bash
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoice-analyzer?retryWrites=true&w=majority
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

3. **Start application:**
```bash
npm run dev
```

Open http://localhost:3000

## API Endpoints

- `POST /api/upload` - Upload file/data
- `POST /api/analyze` - Run analysis  
- `GET /api/report/:reportId` - Get report (persists after restart)
- `GET /api/health` - Health check with DB status

## Testing

Use provided sample files:
- `sample_clean.json` - should score 90%+
- `sample_flawed.csv` - contains validation errors
- `postman_collection.json` - API testing

## Validation Rules

1. **TOTALS_BALANCE**: total_excl_vat + vat_amount = total_incl_vat
2. **LINE_MATH**: qty × unit_price = line_total
3. **DATE_ISO**: YYYY-MM-DD format required
4. **CURRENCY_ALLOWED**: Only AED, SAR, MYR, USD
5. **TRN_PRESENT**: Both buyer/seller tax numbers required

## Key Implementation Details

- **Field Detection**: Normalizes names, checks variations, uses similarity scoring
- **Data Processing**: Handles both flat CSV and nested JSON structures
- **Persistence**: MongoDB with TTL ensures 7-day retention and restart survival
- **Performance**: Processes ≤200 rows in <5 seconds
- **Security**: Rate limiting, input validation, CORS protection

