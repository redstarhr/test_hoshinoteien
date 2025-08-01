const { handleInteractionError } = require('../../handlers/interactionErrorHandler');
const configManager = require('../../../utils/configManager');
const logger = require('../../../utils/logger');
const { updateSettingsMessage } = require('./updateSettingsMessage');

/**
 * 時間削除セレクトメニューの選択を処理する共通関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 * @param {'arrival' | 'departure'} timeType 削除する時間の種類
 */
async function handleRemoveTimeSelect(interaction, timeType) {
  await interaction.deferUpdate();

  try {
    const timeToRemove = interaction.values[0];
    const guildId = interaction.guild.id;

    const config = await configManager.getSyuttaikinConfig(guildId);
    const timesKey = timeType === 'arrival' ? 'arrivalTimes' : 'departureTimes';

    if (!config[timesKey]?.includes(timeToRemove)) {
      return interaction.followUp({ content: 'その時間は既に削除されているか、見つかりませんでした。', ephemeral: true });
    }

    // 時間を配列から削除
    config[timesKey] = config[timesKey].filter(t => t !== timeToRemove);
    await configManager.saveSyuttaikinConfig(guildId, config);

    logger.info(`[syuttaikin_bot] ${interaction.user.tag} removed ${timeType} time: ${timeToRemove} in guild ${guildId}`);

    // 設定パネルのメッセージを更新
    await updateSettingsMessage(interaction, `✅ ${timeToRemove} を削除しました。`);

  } catch (error) {
    await handleInteractionError(interaction, error, `Failed to remove ${timeType} time.`);
  }
}

module.exports = { handleRemoveTimeSelect };