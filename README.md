## Docker Deploy (Render)

This project supports a single-container deployment with:
- Node.js backend
- React frontend build
- Python + YOLO (ultralytics) for local AI scanning

### Files added
- `Dockerfile`
- `.dockerignore`
- `server/requirements.txt`

### Render setup
1. Create a new Web Service on Render.
2. Select your repo.
3. Set **Environment** to `Docker`.
4. Add required environment variables used by `server/server.js` (`MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, etc.).
5. Deploy.

The container starts with:
- `node server/server.js`

The server reads `process.env.PORT`, which Render injects automatically.
