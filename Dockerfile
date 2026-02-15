FROM node:20-bookworm

WORKDIR /app

# Python runtime for local YOLO inference
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-venv libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Use isolated venv to avoid Debian PEP 668 pip restrictions
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

# Install server dependencies
COPY server/package*.json ./server/
RUN npm ci --prefix server

# Install client dependencies and build frontend
COPY client/package*.json ./client/
RUN npm ci --prefix client --include=dev

# Install Python dependencies
COPY server/requirements.txt ./server/requirements.txt
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r ./server/requirements.txt

# Copy source
COPY . .

# Build client assets used by server in production mode
RUN npm run build --prefix client

# Runtime env
ENV NODE_ENV=production

# Render sets PORT dynamically; server already reads process.env.PORT
EXPOSE 10000

CMD ["node", "server/server.js"]

