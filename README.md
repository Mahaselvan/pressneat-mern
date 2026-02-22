# PressNeat (MERN)

PressNeat is a full-stack laundry/ironing service platform with:
- user booking and payment
- admin operations dashboard
- order tracking with real-time rider updates
- AI fabric scanner powered by Hugging Face Inference API

## 1. Core Features

### User side
- Register/login with JWT auth
- Check pincode serviceability and delivery charge
- Book ironing orders with item-wise pricing
- Pay online via Razorpay
- Track latest order status
- Live rider location tracking on Google Maps
- Download invoice PDF for paid orders
- Manage user profile and view simple eco-impact stats
- Scan garment image with AI scanner

### Admin side
- Admin login/register flow
- Dashboard analytics:
  - total orders
  - paid revenue
  - active orders
  - today orders
  - premium users
  - status breakdown
  - recent orders
- Manage order status transitions
- Push rider location updates in real time
- Create additional admin accounts
- Update admin profile

## 2. Tech Stack

### Frontend (`client`)
- React + Vite
- Chakra UI
- Axios
- React Router
- Socket.IO client
- Google Maps (`@react-google-maps/api`)

### Backend (`server`)
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Razorpay payments
- Multer file uploads
- Socket.IO realtime channel
- PDFKit invoice generation
- Hugging Face Inference API integration

## 3. Project Structure

```text
pressneat-mern/
  client/                  # React frontend (Vite)
    src/
      pages/               # Home, Book, Track, Scanner, Profile, Admin pages
      context/             # Auth context + session helpers
      api/axios.js         # API base URL + auth token interceptor
  server/                  # Express backend
    config/                # DB, Razorpay, pincode seed list
    middleware/            # auth + admin guards
    models/                # User, Order, Pincode schemas
    routes/                # auth, orders, payment, scanner, admin, etc.
    utils/                 # invoice generator
    uploads/               # scanner temp uploads
  Dockerfile
  .dockerignore
```

## 4. Environment Variables

Create/update these files:
- `server/.env`
- `client/.env`

### Server variables (`server/.env`)

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CORS_ORIGIN=https://your-frontend-domain.com
PORT=10000

# Optional admin bootstrap / gated admin creation
ADMIN_PHONE=
ADMIN_PASSWORD=
ADMIN_REGISTER_SECRET=

# Hugging Face scanner
HF_API_TOKEN=hf_xxx
HF_MODEL=facebook/detr-resnet-50
# Optional override; usually leave empty
HF_API_URL=
```

### Client variables (`client/.env`)

```env
VITE_API_ORIGIN=http://localhost:10000
VITE_GOOGLE_MAPS_API=your_google_maps_api_key
```

Notes:
- If `VITE_API_ORIGIN` is empty, frontend uses relative `/api`.
- In production on Render, set env vars in Render dashboard (not only local `.env`).

## 5. Local Development Setup

### Prerequisites
- Node.js 20+
- npm 9+
- MongoDB connection (Atlas/local)
- Razorpay test keys
- Hugging Face token with permission:
  - `Inference -> Make calls to Inference Providers`

### Install dependencies

```bash
npm run install-all
```

### Run backend

```bash
cd server
npm start
```

### Run frontend (new terminal)

```bash
cd client
npm run dev
```

Frontend default Vite URL: `http://localhost:5173`  
Backend default URL: `http://localhost:10000`

## 6. API Overview

Base URL: `/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/admin/register`
- `POST /auth/admin/login`
- `GET /auth/me`
- `PUT /auth/me`

### Orders
- `GET /orders` (admin sees all, user sees own)
- `GET /orders/my`
- `POST /orders` (create booking)
- `PUT /orders/:id` (admin status update)
- `PUT /orders/:id/location` (admin rider location update)
- `POST /orders/verify` (Razorpay signature verification)

### Payment
- `POST /payment/create-order`
- `POST /payment/verify`

### Scanner
- `POST /scanner` (multipart form-data; field: `image`)

Returns:
- `fabric`
- `count`
- `price`
- `eco_score`
- `items`
- `raw_caption`

### Admin
- `GET /admin/analytics`
- `GET /admin/orders`
- `PUT /admin/orders/:id/status`
- `POST /admin/admins`

### Serviceability
- `POST /service/seed`
- `GET /service`
- `GET /service/:pincode`

### Subscription
- `POST /subscription/:userId`

### Video proof
- `POST /video/:id` (multipart form-data; field: `video`)

## 7. Real-Time Events (Socket.IO)

Client/server room key: `orderId`

### Events emitted by admin
- `statusUpdate` -> broadcast as `orderStatusUpdate`
- `riderLocation` -> broadcast as `locationUpdate`

### Event emitted by user client
- `joinOrder`

## 8. Pricing Logic (Current)

Booking prices in code:
- Shirt: `₹15`
- Pant: `₹20`
- Saree: `₹50`
- Uniform: `₹15`
- Delivery charge: pincode-dependent (defaults to configured charge)

Scanner prices are heuristic based on detected garment labels and count.

## 9. Deployment (Render, Docker)

### Current deploy model
Single container serving:
- backend API
- built frontend static files

### Steps
1. Push code to your Git repo.
2. Create Render Web Service.
3. Environment: `Docker`.
4. Add all required env vars from section 4.
5. Deploy.

The container runs:
- `node server/server.js`

Server reads dynamic Render port from `process.env.PORT`.

## 10. Hugging Face Scanner Notes

PressNeat scanner uses Hugging Face router endpoint:
- `https://router.huggingface.co/hf-inference/models/{MODEL_ID}`

Important:
- Old `api-inference.huggingface.co` endpoint is deprecated.
- Use a model supported by `hf-inference`.
- If you get `403`, check token permissions.
- If you get `404`, check model availability/provider support.

## 11. Troubleshooting

### `HF_API_FAILED` with `410`
- Cause: old API endpoint
- Fix: use router endpoint or leave `HF_API_URL` empty

### `HF_API_FAILED` with `403`
- Cause: insufficient token permissions
- Fix: create token with `Inference Providers` call permission

### `HF_API_FAILED` with `404`
- Cause: model not available on selected provider route
- Fix: choose a supported model, verify `HF_MODEL`, clear wrong `HF_API_URL`

### Payment verification issues
- Confirm `RAZORPAY_KEY_SECRET` is correct
- Ensure client and server use matching order/payment IDs

### Auth failures (`401`)
- Missing/expired token in localStorage
- Ensure Axios interceptor is attaching `Authorization` header

## 12. Security Recommendations

- Never commit `.env` files or secrets
- Rotate exposed tokens immediately
- Restrict CORS in production (`CORS_ORIGIN`)
- Use strong `JWT_SECRET`
- Use HTTPS in production

## 13. Useful Scripts

Root:
- `npm run install-all`
- `npm run build`
- `npm run start`

Client:
- `npm run dev`
- `npm run build`
- `npm run preview`

Server:
- `npm start`
