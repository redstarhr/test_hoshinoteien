const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

let storageClient;
let isConnected = false;

async function initializeGCS() {
    if (storageClient) {
        return storageClient;
    }

    try {
        const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!keyFilePath) {
            throw new Error('環境変数 GOOGLE_APPLICATION_CREDENTIALS が設定されていません。');
        }

        const absolutePath = path.resolve(keyFilePath);
        logger.info(`[GCS] サービスアカウントキーを読み込みます: ${absolutePath}`);

        const keyFileContent = await fs.readFile(absolutePath, 'utf8');
        const credentials = JSON.parse(keyFileContent);

        // private_key内の `\\n` を `\n` に置換する（よくあるフォーマット問題への対策）
        const privateKey = credentials.private_key.replace(/\\n/g, '\n');

        storageClient = new Storage({
            projectId: credentials.project_id,
            credentials: {
                client_email: credentials.client_email,
                private_key: privateKey,
            },
        });

        logger.info('[GCS] クライアントを初期化しました。接続を確認します...');
        const bucketName = process.env.GCS_BUCKET_NAME;
        if (!bucketName) {
            throw new Error('環境変数 GCS_BUCKET_NAME が設定されていません。');
        }
        await storageClient.bucket(bucketName).exists();
        
        logger.info('✅ [GCS] Google Cloud Storageへの接続に成功しました。');
        isConnected = true;

        return storageClient;
    } catch (error) {
        logger.error('❌ [GCS] GCSクライアントの初期化または接続確認に失敗しました。');
        if (error.message.includes('invalid_grant') || error.message.includes('Invalid JWT Signature')) {
            logger.error('[GCS] エラー: Invalid JWT Signature. 認証トークンの署名が無効です。');
            logger.error('[GCS] >> 原因の可能性: 1. サービスアカウントキー(.json)が破損している。 2. BOTサーバーのシステム時刻がずれている。 3. Google Cloudプロジェクトで "IAM Service Account Credentials API" が有効になっていない。');
        } else {
            logger.error('[GCS] >> 詳細エラー:', error.message);
        }
        storageClient = null; 
        isConnected = false;
    }
}

const getGCSClient = () => storageClient;
const isGCSConnected = () => isConnected;

module.exports = { initializeGCS, getGCSClient, isGCSConnected };