const logger = require('../utils/logger');

/**
 * Finds a component handler from a collection, supporting exact and prefix matches.
 * @param {import('discord.js').Collection<string, any>} collection The collection to search in.
 * @param {string} customId The custom ID of the interaction component.
 * @returns {any|null} The found handler or null.
 */
function findComponentHandler(collection, customId) {
  // 1. Exact match (most common)
  let handler = collection.get(customId);
  if (handler) return handler;

  // 2. Prefix match (for dynamic IDs, e.g., 'delete-item-12345')
  for (const [key, value] of collection.entries()) {
    // The key is the customIdPrefix
    if (value.customIdPrefix && customId.startsWith(key)) {
      return value;
    }
  }
  return null;
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    const handleError = async (error, type, name) => {
      logger.error(`Error executing ${type} '${name}':`, error);
      const reply = { content: '⚠️ 処理中にエラーが発生しました。', flags: 64 }; // Use flags: 64 for ephemeral
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      } catch (sendError) {
        logger.error(`Failed to send error reply for interaction ${interaction.id}:`, sendError);
      }
    };

    // --- Chat Input (Slash) Commands ---
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        logger.warn(`No command matching '${interaction.commandName}' was found.`);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'このコマンドは存在しません。', flags: 64 });
        }
        return;
      }
      try {
        await command.execute(interaction, client);
      } catch (error) {
        await handleError(error, 'command', interaction.commandName);
      }
      return;
    }

    // --- Autocomplete ---
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) {
        return logger.warn(`No autocomplete handler for command '${interaction.commandName}' was found.`);
      }
      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        logger.error(`Error in autocomplete for '${interaction.commandName}':`, error);
      }
      return;
    }

    // --- Message Components (Buttons, Select Menus) & Modals ---
    let handler;
    let handlerType = '';
    let collection;

    if (interaction.isButton()) { handlerType = 'button'; collection = client.buttons; }
    else if (interaction.isAnySelectMenu()) { handlerType = 'select menu'; collection = client.selectMenus; }
    else if (interaction.isModalSubmit()) { handlerType = 'modal'; collection = client.modals; }

    if (handlerType && collection) {
        handler = findComponentHandler(collection, interaction.customId);
        if (handler) {
            try {
                await handler.execute(interaction, client);
            } catch (error) {
                await handleError(error, handlerType, interaction.customId);
            }
        } else {
            logger.warn(`No handler found for ${handlerType} with customId: ${interaction.customId}`);
            // Optionally reply if no handler is found, but only if not already handled
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'この操作は現在無効です。', flags: 64 }).catch(e => logger.error('Failed to send invalid component reply:', e));
            }
        }
    }
  },
};
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このコマンドは存在しません。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このコマンドは存在しません。', ephemeral: true });
          }
          return;
        }
        await command.execute(interaction, client);

      } else if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if (!button) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このボタンは無効です。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このボタンは無効です。', ephemeral: true });
          }
          return;
        }
        await button.execute(interaction, client);

      } else if (interaction.isModalSubmit()) {
        const modal = client.modals.get(interaction.customId);
        if (!modal) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このモーダルは無効です。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このモーダルは無効です。', ephemeral: true });
          }
          return;
        }
        await modal.execute(interaction, client);

      } else if (interaction.isSelectMenu()) {
        const select = client.selectMenus.get(interaction.customId);
        if (!select) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このセレクトメニューは無効です。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このセレクトメニューは無効です。', ephemeral: true });
          }
          return;
        }
        await select.execute(interaction, client);
      }
    } catch (error) {
      console.error('interactionCreateイベントでエラー:', error);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '処理中にエラーが発生しました。', ephemeral: true });
        } else {
          await interaction.reply({ content: '処理中にエラーが発生しました。', ephemeral: true });
        }
      } catch (err) {
        console.error('エラー通知送信時にさらにエラー:', err);
        // interactionが期限切れなどで送れない可能性あり
      }
    }
  },
};
