FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies required by the Midnight compact compiler
RUN apt-get update && apt-get install -y curl ca-certificates

# Install the Midnight toolchain
RUN curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

# Add toolchain to PATH
ENV PATH="/root/.local/bin:${PATH}"

COPY package*.json ./
RUN npm install

COPY . .

# Run tests by default or provide a shell
CMD ["npm", "run", "test"]
