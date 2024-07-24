# ベースイメージを指定
FROM node:14

# 作業ディレクトリを作成
WORKDIR /usr/src/app

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
