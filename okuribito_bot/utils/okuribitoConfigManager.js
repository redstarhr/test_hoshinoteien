// utils/okuribitoConfigManager.js
const { Storage } = require('@google-cloud/storage');
const logger = require('./logger'); // パスを修正

const storage = new Storage();
// .envファイルからGCSのバケット名を読み込みます
const bucketName = 'data-svml'; // 仕様に合わせてバケット名を変更

if (!bucketName) {
    logger.error('GCS_BUCKET_NAMEが.envファイルに設定されていません。');
    // アプリケーションの起動を中止させる場合は、ここで process.exit(1) を呼び出すことを検討してください。
}

/**
 * GCSから送り人設定を読み込む
 * @param {string} guildId ギルドID
 * @returns {Promise<object|null>} 設定オブジェクト。存在しない場合はnullを返す。
 */
async function loadOkuribitoConfig(guildId) {
    if (!bucketName) throw new Error('GCS_BUCKET_NAMEが設定されていません。');
    // 仕様: data-hoshinokoutei/ギルドID/okuribito/config.json
    const filePath = `data-hoshinokoutei/${guildId}/okuribito/config.json`;
    try {
        const [data] = await storage.bucket(bucketName).file(filePath).download();
        logger.info(`[GCS] Guild ID: ${guildId} の設定を ${filePath} から読み込みました。`);
        return JSON.parse(data.toString('utf8'));
    } catch (error) {
        if (error.code === 404) {
            logger.info(`[GCS] Guild ID: ${guildId} の設定ファイルは見つかりませんでした。`);
            return null; // ファイルが存在しない場合はnullを返す
        }
        logger.error({ message: `[GCS] Guild ID: ${guildId} の設定読み込み中にエラーが発生しました。`, error });
        throw error; // その他のエラーは再スロー
    }
}

/**
 * 送り人設定情報をGCSに保存
 * @param {string} guildId ギルドID
 * @param {object} config 保存する設定オブジェクト
 */
async function saveOkuribitoConfig(guildId, config) {
    if (!bucketName) throw new Error('GCS_BUCKET_NAMEが設定されていません。');
    // 仕様: data-hoshinokoutei/ギルドID/okuribito/config.json
    const filePath = `data-hoshinokoutei/${guildId}/okuribito/config.json`;
    const file = storage.bucket(bucketName).file(filePath);

    try {
        const jsonStr = JSON.stringify(config, null, 2);
        await file.save(jsonStr, { contentType: 'application/json' });
        logger.info(`[GCS] Guild ID: ${guildId} の設定を ${filePath} に保存しました。`);
    } catch (error) {
        logger.error({ message: `[GCS] Guild ID: ${guildId} の設定保存中にエラーが発生しました。`, error });
        throw error;
    }
}

/**
 * 送り人設定情報をGCSから削除
 * @param {string} guildId ギルドID
 * @returns {Promise<void>}
 */
async function deleteOkuribitoConfig(guildId) {
    if (!bucketName) throw new Error('GCS_BUCKET_NAMEが設定されていません。');
    // 仕様: data-hoshinokoutei/ギルドID/okuribito/config.json
    const filePath = `data-hoshinokoutei/${guildId}/okuribito/config.json`;
    const file = storage.bucket(bucketName).file(filePath);

    try {
        await file.delete();
        logger.info(`[GCS] Guild ID: ${guildId} の設定ファイル ${filePath} を削除しました。`);
    } catch (error) {
        if (error.code === 404) {
            logger.warn(`[GCS] Guild ID: ${guildId} の設定ファイル ${filePath} は存在しないため、削除はスキップされました。`);
            return; // ファイルが存在しない場合はエラーとしない
        }
        logger.error({ message: `[GCS] Guild ID: ${guildId} の設定削除中にエラーが発生しました。`, error });
        throw error;
    }
}

module.exports = { loadOkuribitoConfig, saveOkuribitoConfig, deleteOkuribitoConfig };
