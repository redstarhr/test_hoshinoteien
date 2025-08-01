const { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_send_driver_select',
    /**
     * @param {StringSelectMenuInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const selectedDriverId = interaction.values[0];

            const countSelectMenu = new StringSelectMenuBuilder()
                // Pass the selected driver's ID in the customId for the next step
                .setCustomId(`okuribito_send_count_select:${selectedDriverId}`)
                .setPlaceholder('送ってもらう人数を選択してください');

            // Generate options for 1 to 24 passengers
            const countOptions = Array.from({ length: 24 }, (_, i) => {
                const count = i + 1;
                return {
                    label: `${count}人`,
                    value: `${count}`,
                };
            });

            countSelectMenu.addOptions(countOptions);

            const row = new ActionRowBuilder().addComponents(countSelectMenu);
            await interaction.editReply({ content: 'ステップ2: 人数を選択してください。', components: [row], ephemeral: true });

        } catch (error) {
            logger.error({ message: '人数選択メニューの表示中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ エラーが発生しました。', ephemeral: true });
        }
    },
};