# --- Base Stage ---
FROM node:18-slim AS base

# タイムゾーン設定（必要なら）
ENV TZ=Asia/Tokyo

# 作業ディレクトリ
WORKDIR /usr/src/app

# 依存関係の解決高速化のためpackage*.json先コピー
COPY package*.json ./

# --- Production Stage (Cloud Run用) ---
FROM base AS production

# 本番環境用パッケージのみインストール
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts && npm cache clean --force

# ソースコードをコピー
COPY . .

# 環境変数はCloud Runの設定やGitHub Actionsで注入する想定

# Bot起動コマンド
CMD ["node", "index.js"]
