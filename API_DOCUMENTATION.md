# API DOCUMENTATION

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.selfpulse.app` (example)

## Authentication
All endpoints except `/auth/register` and `/auth/login` require Bearer token:
```
Authorization: Bearer {jwt_token}
```

---

## AUTH ENDPOINTS

### POST /auth/register
Register new user
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "+919876543210" // optional
}

Response (201):
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": "uuid", "email": "john@example.com", "name": "John Doe" }
  }
}
```

### POST /auth/login
Login user
```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": "uuid", "email": "john@example.com" }
  }
}
```

---

## EMERGENCY ENDPOINTS

### POST /emergency/activate
Activate emergency SOS
```json
Request:
{
  "activationMethod": "hold-button", // or triple-tap, voice, gesture
  "latitude": 19.0760,
  "longitude": 72.8777
}

Response (201):
{
  "success": true,
  "data": {
    "id": "emergency-uuid",
    "status": "active",
    "activatedAt": "2026-09-15T19:30:00Z"
  }
}
```

### GET /emergency/:eventId
Get emergency event details
```
Response (200):
{
  "success": true,
  "data": {
    "id": "event-uuid",
    "status": "active",
    "notifications": [
      { "contactId": "uuid", "channel": "sms", "status": "pending", "attemptedAt": "2026-09-15T19:30:01Z" }
    ]
  }
}
```

### POST /emergency/:eventId/resolve
Resolve emergency
```
Response (200):
{
  "success": true,
  "message": "Emergency event resolved"
}
```

---

## JOURNEY ENDPOINTS

### POST /journey/start
Start a journey
```json
Request:
{
  "origin": "Home, Dadar West",
  "destination": "Office, Bandra"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "journey-uuid",
    "status": "active",
    "startedAt": "2026-09-15T08:00:00Z"
  }
}
```

### GET /journey/active
Get active journey
```
Response (200):
{
  "success": true,
  "data": {
    "id": "journey-uuid",
    "status": "active",
    "origin": "Home",
    "destination": "Office"
  }
}
```

### GET /journey/:journeyId
Get journey details with locations
```
Response (200):
{
  "success": true,
  "data": {
    "id": "journey-uuid",
    "status": "active",
    "locations": [
      { "id": "loc-uuid", "latitude": 19.0760, "longitude": 72.8777, "timestamp": "2026-09-15T08:00:30Z" }
    ]
  }
}
```

### POST /journey/:journeyId/location
Add location tracking
```json
Request:
{
  "latitude": 19.0761,
  "longitude": 72.8778,
  "accuracy": 10.5
}

Response (201):
{
  "success": true,
  "data": { "id": "location-uuid", "latitude": 19.0761, "longitude": 72.8778 }
}
```

### POST /journey/:journeyId/end
End journey
```
Response (200):
{
  "success": true,
  "message": "Journey ended"
}
```

---

## ROUTE ENDPOINTS

### POST /routes/analyze
Analyze route safety
```json
Request:
{
  "origin": { "lat": 19.0760, "lng": 72.8777 },
  "destination": { "lat": 19.0850, "lng": 72.8850 },
  "distance": 5.2,
  "duration": 15
}

Response (201):
{
  "success": true,
  "data": {
    "routeId": "route-uuid",
    "analysis": {
      "safetyScore": 78,
      "lighting": "Well-lit",
      "crowdActivity": "Moderate",
      "isolation": "Low",
      "recommendationReason": "Safe route with good lighting"
    }
  }
}
```

### GET /routes/:routeId
Get route analysis
```
Response (200):
{
  "success": true,
  "data": {
    "id": "route-uuid",
    "safetyScore": 78,
    "lighting": "Well-lit",
    "crowdActivity": "Moderate"
  }
}
```

---

## SAFETY MAP ENDPOINTS

### GET /safety-map/nearby?latitude=19.0760&longitude=72.8777&radius=5
Get nearby safety points and protectors
```
Response (200):
{
  "success": true,
  "data": {
    "safetyPoints": [
      { "id": "uuid", "type": "hospital", "name": "City Hospital", "latitude": 19.0765, "longitude": 72.8780 }
    ],
    "protectors": [
      { "id": "uuid", "name": "John Protector", "type": "volunteer", "latitude": 19.0762, "longitude": 72.8778, "verified": true }
    ]
  }
}
```

---

## TRUSTED CONTACTS ENDPOINTS

### POST /trusted-contacts
Create trusted contact
```json
Request:
{
  "name": "Mom",
  "phone": "+919876543210",
  "email": "mom@example.com",
  "relationship": "Mother",
  "priority": 0
}

Response (201):
{
  "success": true,
  "data": { "id": "contact-uuid", "name": "Mom", "priority": 0, "verified": false }
}
```

### GET /trusted-contacts
List all contacts
```
Response (200):
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Mom", "phone": "+919876543210", "priority": 0, "verified": true }
  ]
}
```

### PUT /trusted-contacts/:contactId
Update contact
```json
Request: { "name": "Mom Updated", "priority": 1 }
Response (200): { "success": true, "message": "Contact updated" }
```

### DELETE /trusted-contacts/:contactId
Delete contact
```
Response (200): { "success": true, "message": "Contact deleted" }
```

---

## PROTECTORS ENDPOINTS

### GET /protectors
List all protectors
```
Response (200):
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "NPO Safety", "type": "organization", "verified": true, "availability": "24/7" }
  ]
}
```

### GET /protectors/:protectorId
Get protector details
```
Response (200):
{
  "success": true,
  "data": { "id": "uuid", "name": "NPO Safety", "responseTime": "5 mins" }
}
```

---

## COMMUNITY REPORTS ENDPOINTS

### POST /community-reports
Create safety report
```json
Request:
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "category": "harassment", // or theft, assault, suspicious-activity, road-hazard, other
  "description": "Suspicious activity near station",
  "severity": "high" // or low, medium
}

Response (201):
{
  "success": true,
  "data": { "id": "report-uuid", "status": "pending" }
}
```

### GET /community-reports/nearby?latitude=19.0760&longitude=72.8777&radius=5
Get nearby reports
```
Response (200):
{
  "success": true,
  "data": [
    { "id": "uuid", "category": "harassment", "severity": "high", "status": "verified" }
  ]
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    { "path": ["email"], "message": "Invalid email" }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "User with this email already exists"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

---

## RATE LIMITS

- Auth endpoints (register/login): 5 requests per 15 minutes per IP
- SOS activation: 1 request per 30 seconds per user
- Other endpoints: 100 requests per 15 minutes per user

---

## HEADERS REQUIRED

```
Content-Type: application/json
Authorization: Bearer {jwt_token} (except auth endpoints)
```
