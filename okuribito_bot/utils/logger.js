// utils/logger.js

const chalkImport = require('chalk');
const { EmbedBuilder } = require('discord.js');
const chalk = chalkImport.default || chalkImport; // v5対応

async function sendErrorToChannel(client, message, error, context) {
    const errorChannelId = process.env.ERROR_LOG_CHANNEL_ID;
    if (!errorChannelId || !client?.isReady()) return;

    try {
        const channel = await client.channels.fetch(errorChannelId);
        if (!channel || !channel.isTextBased()) {
            console.error(chalk.red('[LOGGER-ERROR]'), 'エラーログ用のチャンネルが見つからないか、テキストチャンネルではありません。');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🚨 BOTエラー発生')
            .setDescription(`**メッセージ:** ${message}`)
            .setTimestamp();

        if (context?.interaction) {
            const { interaction } = context;
            embed.addFields(
                { name: '実行ユーザー', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'サーバー', value: `${interaction.guild.name} (${interaction.guild.id})`, inline: true }
            );
            if (interaction.isCommand()) {
                embed.addFields({ name: 'コマンド', value: `\`/${interaction.commandName}\``, inline: true });
            } else if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
                embed.addFields({ name: 'Custom ID', value: `\`${interaction.customId}\``, inline: true });
            }
        }

        if (error?.stack) {
            const stack = error.stack.substring(0, 1000); // Embedのフィールド文字数制限のため
            embed.addFields({ name: 'スタックトレース', value: `\`\`\`js\n${stack}...\`\`\`` });
        } else if (error) {
            embed.addFields({ name: 'エラー詳細', value: `\`\`\`${String(error).substring(0, 1000)}\`\`\`` });
        }

        await channel.send({ embeds: [embed] });
    } catch (e) {
        console.error(chalk.red('[LOGGER-ERROR]'), 'Discordへのエラーログ送信に失敗しました。', e);
    }
}

const logger = {
  info: (message, ...optionalParams) => {
    console.log(chalk.blue('[INFO]'), message, ...optionalParams);
  },
  warn: (message, ...optionalParams) => {
    console.warn(chalk.yellow('[WARN]'), message, ...optionalParams);
  },
  error: (logObject) => {
    const { message, error, client, interaction } = logObject;
    console.error(chalk.red('[ERROR]'), message, error || '');
    if (client) {
        sendErrorToChannel(client, message, error, { interaction });
    }
  },
  debug: (message, ...optionalParams) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(chalk.gray('[DEBUG]'), message, ...optionalParams);
    }
  },
};

module.exports = logger;