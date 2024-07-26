# ベースイメージを指定
FROM node:16

# 作業ディレクトリを作成
WORKDIR /usr/src/app

# 必要なツールとライブラリをインストール
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 手動で deb ファイルをダウンロードしてインストール
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get update && \
    apt-get install -y ./google-chrome-stable_current_amd64.deb && \
    rm ./google-chrome-stable_current_amd64.deb

# サンドボックスを無効にするための設定
RUN chmod 4755 /opt/google/chrome/chrome-sandbox

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# Puppeteerの設定を追加
RUN npm install puppeteer --save
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# アプリケーションのポートを指定
EXPOSE 3005

# アプリケーションを起動
CMD ["node", "api.js"]
