// okuribito_bot/components/selects/select_send_count.js

module.exports = {
  // customIdの先頭部分を定義（これで複数のIDを受け取る設計に対応）
  customIdPrefix: 'select_send_count_',

  async execute(interaction) {
    // customIdは 'select_send_count_<送り人ID>' の形式
    const { customId, values } = interaction;
    const count = values[0];
    const okuribitoUserId = customId.slice(this.customIdPrefix.length);

    // ここでokuribitoUserIdとcountを使ってログ出力やGCS保存などの処理を行う
    // 例（仮）:
    console.log(`送り人ID: ${okuribitoUserId}, 送る人数: ${count}`);

    await interaction.update({
      content: `送り人 <@${okuribitoUserId}> の送迎人数を **${count}** 人に設定しました。\n備考があれば「備考」ボタンから入力してください。`,
      components: [],
      embeds: [],
    });
  },
};
