# SelfPulse - AI-Powered Safety Companion

A comprehensive safety application that understands your journey context and provides personalized protection through AI-driven route analysis, emergency response, and community safety features.

## Features

- **AI-Powered Route Analysis**: Analyzes routes based on lighting, crowd activity, isolation, and nearby help points
- **Emergency SOS System**: Multiple activation methods (hold button, triple-tap, voice, gesture) with trusted contact notifications
- **Journey Tracking**: Real-time location tracking with offline support
- **Safety Map**: View nearby protectors, hospitals, police stations, and community safety reports
- **Trusted Contacts**: Manage emergency contacts with priority-based notifications
- **Community Reports**: Report and view safety incidents in your area
- **Protector Network**: Connect with verified safety protectors and emergency responders

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for fast development and building
- Tailwind CSS v4 for styling
- Figma Make for UI integration

**Backend:**
- Express.js server
- SQLite database
- JWT authentication with bcrypt
- Zod for input validation
- Vitest for unit testing
- Helmet for security
- Express Rate Limiting

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd SelfPulse
   ```

2. **Install frontend dependencies**
   ```bash
   pnpm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   pnpm install
   cd ..
   ```

4. **Setup environment variables**
   ```bash
   # Root .env
   cp .env.example .env
   
   # Backend .env
   cp server/.env.example server/.env
   ```

   Configure the following:
   - `REACT_APP_API_URL=http://localhost:3000/api`
   - `JWT_SECRET` (minimum 32 characters for production)
   - Optional: Twilio, Gmail, Google Maps API keys

### Running Locally

**Terminal 1 - Start Backend:**
```bash
cd server
pnpm install
pnpm run dev
# Backend runs on http://localhost:3000
```

**Terminal 2 - Start Frontend:**
```bash
pnpm install
pnpm run dev
# Frontend runs on http://localhost:5173
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Emergency
- `POST /api/emergency/activate` - Activate emergency with method (hold-button, triple-tap, voice, gesture)
- `GET /api/emergency/:eventId` - Get emergency event details and notifications
- `POST /api/emergency/:eventId/resolve` - Resolve emergency event

### Journey
- `POST /api/journey/start` - Start a journey
- `GET /api/journey/active` - Get active journey
- `GET /api/journey/:journeyId` - Get journey details
- `POST /api/journey/:journeyId/location` - Add location to journey
- `POST /api/journey/:journeyId/end` - End journey

### Routes
- `POST /api/routes/analyze` - Analyze route safety
- `GET /api/routes/:routeId` - Get route analysis

### Safety Map
- `GET /api/safety-map/nearby?latitude=X&longitude=Y&radius=5` - Get nearby safety points and protectors

### Trusted Contacts
- `POST /api/trusted-contacts` - Create trusted contact
- `GET /api/trusted-contacts` - List all contacts
- `PUT /api/trusted-contacts/:contactId` - Update contact
- `DELETE /api/trusted-contacts/:contactId` - Delete contact

### Protectors
- `GET /api/protectors` - List all protectors
- `GET /api/protectors/:protectorId` - Get protector details

### Community Reports
- `POST /api/community-reports` - Create safety report
- `GET /api/community-reports/nearby?latitude=X&longitude=Y` - Get nearby reports

## Testing

### Backend Tests
```bash
cd server
pnpm run test:run
```

### Frontend Build
```bash
pnpm run build
```

### Type Checking
```bash
pnpm run type-check
```

## Security Features

✅ **Authentication & Authorization**
- JWT-based authentication with 7-day expiry
- Bcrypt password hashing
- Token management in localStorage
- Protected API endpoints with middleware

✅ **Input Validation**
- Zod schemas for all API endpoints
- Coordinate validation for location data
- Email and phone validation
- Request body size limits

✅ **Error Handling**
- Centralized error handler middleware
- Secure error messages (no stack traces in production)
- Proper HTTP status codes
- Detailed logging with Pino

✅ **Rate Limiting**
- Auth endpoint: 5 requests per 15 minutes per IP
- SOS endpoint: 1 request per 30 seconds per user
- Prevents abuse and DDoS attacks

✅ **CORS & Headers**
- Helmet.js for security headers
- CORS configured for frontend origin only
- XSS protection
- Content Security Policy

✅ **Location Data Safety**
- Coordinates validated (-90 to 90 latitude, -180 to 180 longitude)
- Approximate distance calculations for privacy
- Location data deleted when journey ends
- No sensitive coordinates in logs

✅ **Emergency SOS Integrity**
- Does NOT claim SMS sent unless Twilio confirms delivery
- Does NOT claim calls made unless provider confirms
- Does NOT claim notifications sent unless stored in database
- Only marks as "attempted" until confirmed by provider
- Maintains transparency in emergency notifications

## Emergency SOS Important Notes

The emergency system currently:
- ✅ Creates emergency events in database
- ✅ Notifies trusted contacts (stores notification intent)
- ✅ Tracks emergency status
- ❌ Does NOT send actual SMS unless TWILIO configured
- ❌ Does NOT send actual push notifications (requires provider setup)
- ❌ Does NOT make actual calls (requires phone system integration)

For production deployment with real SMS/calls, configure:
1. Twilio account credentials in .env
2. Firebase Cloud Messaging for push notifications
3. Phone carrier integration for voice calls

## Database Schema

- **users** - User accounts with authentication
- **trusted_contacts** - Emergency contacts per user
- **emergency_events** - SOS activation records
- **emergency_notifications** - Notification delivery tracking
- **journeys** - Active journey tracking
- **journey_locations** - GPS location history
- **routes** - Route analysis data
- **route_analysis** - Safety scoring and recommendations
- **protectors** - Emergency responders and safety contacts
- **safety_points** - Hospitals, police stations, etc.
- **community_reports** - User-reported safety incidents
- **notifications** - User notifications

## Deployment

### Frontend (Figma Make)
Deployed through Figma Make deployment system.

### Backend (Node.js)
```bash
cd server
npm install --production
npm run build
npm start
```

Configure environment variables on your hosting platform.

## Contributing

1. Create feature branch from `feat/complete-backend`
2. Follow existing code style and patterns
3. Add tests for new features
4. Submit pull request with detailed description

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built for safety. Powered by AI. Always on your side.**
