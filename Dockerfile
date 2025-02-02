# Specify base image
FROM node:18

# Create working directory
WORKDIR /usr/src/app

# Install necessary tools
RUN apt-get update && apt-get install -y \
    libreoffice \
    wget \
    gnupg \
    fonts-recommended \
    fonts-noto \
    fonts-ipafont \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Manually download and install deb file
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
apt-get update && \
apt-get install -y ./google-chrome-stable_current_amd64.deb && \
rm ./google-chrome-stable_current_amd64.deb

ENV CHROME_NO_SANDBOX=1

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Specify application port
EXPOSE 3005

# Start application
CMD ["node", "api.js"]
