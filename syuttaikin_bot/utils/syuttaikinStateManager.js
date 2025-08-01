const { getGCSClient, isGCSConnected } = require('../../utils/gcsClient');
const logger = require('../../utils/logger');

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const FILE_PATH_PREFIX = 'syuttaikin_bot/state';

const getStateFilePath = (guildId) => `${FILE_PATH_PREFIX}/${guildId}_config.json`;

/**
 * Reads the state from GCS and merges it with the default state.
 * @param {string} guildId The ID of the guild.
 * @returns {Promise<object>} The state object.
 */
async function readState(guildId) {
    if (!isGCSConnected()) {
        logger.warn('[GCS] GCS未接続のため、空の設定を返します。');
        return {};
    }
    const storage = getGCSClient();
    const file = storage.bucket(BUCKET_NAME).file(getStateFilePath(guildId));

    try {
        const [data] = await file.download();
        return JSON.parse(data.toString('utf8'));
    } catch (error) {
        if (error.code === 404) {
            logger.info(`[syuttaikin] Guild ${guildId} の設定ファイルが見つかりませんでした。新規作成します。`);
            return {};
        }
        logger.error(`[syuttaikin] Guild ${guildId} の設定ファイル読み込みに失敗しました。`, { error });
        throw error;
    }
}

/**
 * Reads the current state, applies an update function, and writes the new state back to GCS.
 * This provides a safe way to update nested state properties.
 * @param {string} guildId The ID of the guild.
 * @param {(currentState: object) => object} updateFn A function that takes the current state and returns the new state.
 */
async function updateState(guildId, updateFn) {
    if (!isGCSConnected()) {
        logger.error('[GCS] GCS未接続のため、設定を更新できません。');
        throw new Error('GCS is not connected.');
    }
    const storage = getGCSClient();
    const file = storage.bucket(BUCKET_NAME).file(getStateFilePath(guildId));

    try {
        const currentState = await readState(guildId);
        const newState = updateFn(currentState);
        await file.save(JSON.stringify(newState, null, 2), {
            contentType: 'application/json',
        });
    } catch (error) {
        logger.error(`[syuttaikin] Guild ${guildId} の設定ファイル更新に失敗しました。`, { error });
        throw error;
    }
}

module.exports = { readState, updateState };
