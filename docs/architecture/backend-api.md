# Backend API

Technical documentation for the FastAPI backend powering candlz.

## Overview
- Endpoints for trading, data, and user management
- Authentication and security
- Example requests and responses

## Example Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /trade | POST | Submit a new trade order |
| /portfolio | GET | Retrieve current portfolio data |
| /market/data | GET | Get latest market prices and info |
| /user | GET/POST | Get or update user profile |
| /algorithm | POST | Deploy or update a trading algorithm |

## Example Request

```http
POST /trade
{
  "asset": "BTC",
  "action": "buy",
  "amount": 1.5
}
```

## Authentication

All endpoints require authentication via API key or user session.
