const { Storage } = require('@google-cloud/storage');
const logger = require('./logger'); // パスを修正

const storage = new Storage();
const bucketName = 'data-svml'; // As specified in your requirements

/**
 * Appends a record to the daily send log CSV in GCS.
 * Creates the file with a header if it doesn't exist.
 * @param {string} guildId
 * @param {object} logData - The data to log.
 * @param {string} logData.timestamp - ISO string timestamp.
 * @param {string} logData.requesterId
 * @param {string} logData.requesterName
 * @param {string} logData.driverId
 * @param {string} logData.driverName
 * @param {number} logData.passengerCount
 * @param {string} logData.logMessageId
 */
async function appendToSendLogCsv(guildId, logData) {
    if (!bucketName) throw new Error('GCS bucket name is not configured.');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const filePath = `data-hoshinokoutei/${guildId}/okuribito/送迎_${yyyy}-${mm}-${dd}.csv`;

    const file = storage.bucket(bucketName).file(filePath);

    try {
        const [exists] = await file.exists();
        const header = 'timestamp,requesterId,requesterName,driverId,driverName,passengerCount,logMessageId\n';
        let currentContent = exists ? (await file.download())[0].toString('utf8') : header;

        // Escape commas in names to prevent CSV corruption
        const requesterName = `"${logData.requesterName.replace(/"/g, '""')}"`;
        const driverName = `"${logData.driverName.replace(/"/g, '""')}"`;

        const newRow = `${logData.timestamp},${logData.requesterId},${requesterName},${logData.driverId},${driverName},${logData.passengerCount},${logData.logMessageId}\n`;

        await file.save(currentContent + newRow, { contentType: 'text/csv' });
        logger.info(`[GCS] Appended send log to ${filePath}`);
    } catch (error) {
        logger.error({ message: `[GCS] Failed to append to send log CSV at ${filePath}`, error });
        throw error;
    }
}

/**
 * Gets the content of a daily send log CSV from GCS.
 * @param {string} guildId
 * @param {string} date - The date in 'YYYY-MM-DD' format.
 * @returns {Promise<{buffer: Buffer, fileName: string}|null>} The file buffer and name, or null if not found.
 */
async function getSendLogCsv(guildId, date) {
    if (!bucketName) throw new Error('GCS bucket name is not configured.');

    const [yyyy, mm, dd] = date.split('-');
    const fileName = `送迎_${yyyy}-${mm}-${dd}.csv`;
    const filePath = `data-hoshinokoutei/${guildId}/okuribito/${fileName}`;

    const file = storage.bucket(bucketName).file(filePath);

    try {
        const [exists] = await file.exists();
        if (!exists) {
            return null;
        }
        const [buffer] = await file.download();
        return { buffer, fileName };
    } catch (error) {
        logger.error({ message: `[GCS] Failed to get send log CSV at ${filePath}`, error });
        throw error;
    }
}

module.exports = { appendToSendLogCsv, getSendLogCsv };