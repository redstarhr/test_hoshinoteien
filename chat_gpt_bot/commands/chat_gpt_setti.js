const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { handleInteractionError } = require('../../utils/interactionErrorLogger');
const { isChatGptAdmin } = require('../../manager/permissionManager');
const { getChatGPTConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('legion_chatgpt_パネル設置')
    .setDescription('現在のチャンネルにChatGPT機能の操作パネルを設置します。(管理者のみ)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      if (!(await isChatGptAdmin(interaction))) {
        return interaction.editReply({
          content: '❌ このコマンドを実行する権限がありません。',
        });
      }

      const gptConfig = await getChatGPTConfig(interaction.guildId);
      const systemPromptLength = gptConfig.systemPrompt?.length ?? 0;
      const todayGptChannelId = gptConfig.today_gpt_channel_id;

      const todayGptDescription = todayGptChannelId
        ? `投稿先: <#${todayGptChannelId}>\n上記チャンネルに、天気やニュースなどのお知らせを投稿します。`
        : '投稿先のチャンネルが未設定です。下のボタンから設定してください。';

      const embed = new EmbedBuilder()
        .setTitle('🤖 ChatGPT 操作パネル')
        .setDescription('以下のボタンから ChatGPT の各種操作や設定を行えます。\n一部の操作では応答に数秒かかることがあります。')
        .setColor(0x10A37F)
        .addFields(
          {
            name: '今日のChatGPTを生成',
            value: todayGptDescription,
            inline: false,
          },
          {
            name: '基本設定',
            value:
              `システムプロンプトや応答の多様性(Temperature)などを編集します。\n` +
              `**現在のプロンプト文字数:** ${systemPromptLength}文字`,
            inline: false,
          },
          {
            name: 'チャンネル設定',
            value: '「今日のお知らせ」の投稿先や、Botが自動で応答するチャンネルを設定します。',
            inline: false,
          }
        )
        .setFooter({
          text: 'StarGPT Bot | このパネルは管理者のみ操作可能です。',
        });

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('chatgpt_panel_today_gpt')
          .setLabel('今日のChatGPTを生成')
          .setStyle(ButtonStyle.Success)
          .setEmoji('☀️'),
        new ButtonBuilder()
          .setCustomId('chatgpt_panel_open_config_modal')
          .setLabel('基本設定を編集')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⚙️')
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('chatgpt_config_edit_today_channel')
          .setLabel('「今日のGPT」CH設定')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('chatgpt_config_edit_auto_channels')
          .setLabel('自動応答CH設定')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({
        content: `✅ ChatGPT操作パネルを **<#${interaction.channel.id}>** に設置しました。`,
        embeds: [embed],
        components: [row1, row2],
      });
    } catch (error) {
      await handleInteractionError({
        interaction,
        error,
        context: 'ChatGPTパネル設置',
      });
    }
  },
};
