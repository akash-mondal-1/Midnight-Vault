FROM node:22-alpine

WORKDIR /app

# Install Midnight compact compiler dependencies if any needed at OS level
# (Assuming compactc is provided or downloaded as part of setup)

COPY package*.json ./
RUN npm install

COPY . .

# Run tests by default or provide a shell
CMD ["npm", "run", "test"]
