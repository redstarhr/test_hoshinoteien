// chat_gpt_bot/interactions/buttons/configEditTodayChannel.js

const {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const { checkAdminAndReply } = require('../../utils/permissionChecker');
const { handleInteractionError } = require('../../../utils/interactionErrorLogger');

// customIds.jsからインポートするように変更
const {
  chatgpt_config_select_today_channel: SELECT_TODAY_CHANNEL,
  chatgpt_config_remove_today_channel: REMOVE_TODAY_CHANNEL,
  chatgpt_config_edit_today_prompt,
} = require('../../utils/customIds');

module.exports = {
  customId: 'chatgpt_config_edit_today_channel',

  async handle(interaction) {
    try {
      if (!(await checkAdminAndReply(interaction))) {
        return;
      }

      // チャンネル選択メニュー
      const selectMenu = new ChannelSelectMenuBuilder()
        .setCustomId(SELECT_TODAY_CHANNEL)
        .setPlaceholder('「今日のChatGPT」投稿チャンネルを選択してください')
        .addChannelTypes(ChannelType.GuildText)
        .setMinValues(1)
        .setMaxValues(1);

      // プロンプト編集ボタン
      const editPromptButton = new ButtonBuilder()
        .setCustomId(chatgpt_config_edit_today_prompt)
        .setLabel('プロンプトを編集')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝');

      // 設定解除ボタン
      const removeButton = new ButtonBuilder()
        .setCustomId(REMOVE_TODAY_CHANNEL)
        .setLabel('設定を解除')
        .setStyle(ButtonStyle.Danger);

      // アクション行
      const row1 = new ActionRowBuilder().addComponents(selectMenu);
      const row2 = new ActionRowBuilder().addComponents(editPromptButton, removeButton);

      await interaction.reply({
        content:
          '📍 「今日のChatGPT」機能に関する設定です。\n' +
          '投稿先のチャンネルや、生成に使用するプロンプトを編集できます。',
        components: [row1, row2],
        ephemeral: true,
      });
    } catch (error) {
      await handleInteractionError({
        interaction,
        error,
        context: 'ChatGPT 今日の投稿チャンネル設定UI',
      });
    }
  },
};
