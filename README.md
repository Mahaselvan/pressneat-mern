## Docker Deploy (Render)

This project supports a single-container deployment with:
- Node.js backend
- React frontend build
- Hugging Face Inference API for AI scanning

### Files added
- `Dockerfile`
- `.dockerignore`
- `server/.env.example`

### Render setup
1. Create a new Web Service on Render.
2. Select your repo.
3. Set **Environment** to `Docker`.
4. Add required environment variables used by `server/server.js` (`MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, etc.).
5. Add scanner variables: `HF_API_TOKEN`, `HF_MODEL` (optional, recommended: `facebook/detr-resnet-50`), `HF_API_URL` (optional).
6. Deploy.

The container starts with:
- `node server/server.js`

The server reads `process.env.PORT`, which Render injects automatically.
