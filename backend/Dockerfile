# Node.js + Python backend with gRPC support
FROM node:18-bookworm-slim

# Install Python and C++ libraries needed for gRPC
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Copy Python requirements first
COPY requirements.txt ./

# Create venv and install Python deps
RUN python3 -m venv audio_reader_standalone/venv && \
    audio_reader_standalone/venv/bin/pip install --upgrade pip && \
    audio_reader_standalone/venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy Node.js package files and install
COPY package*.json ./
RUN npm ci --only=production

# Copy all application code
COPY . .

# Create output directory
RUN mkdir -p audio_reader_standalone/output

# Expose port
EXPOSE 5000

CMD ["npm", "start"]
