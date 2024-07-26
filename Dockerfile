# ベースイメージを指定
FROM node:16

# 作業ディレクトリを作成
WORKDIR /usr/src/app

# 必要なツールをインストール
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 手動で deb ファイルをダウンロードしてインストール
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
apt-get update && \
apt-get install -y ./google-chrome-stable_current_amd64.deb && \
rm ./google-chrome-stable_current_amd64.deb

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションのポートを指定
EXPOSE 3005

# アプリケーションを起動
CMD ["node", "api.js"]
