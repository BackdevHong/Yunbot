const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('게임')
    .setDescription('게임 명령어입니다.')
    .addSubcommand((subC) =>
      subC
        .setName('모집')
        .setDescription('게임 인원을 모집합니다.')
        .addStringOption((option) =>
          option
            .setName('게임이름')
            .setDescription('게임 이름(마인크래프트, GTA5 등)')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('인원수')
            .setDescription('모집 인원수를 설정합니다.')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('종료날짜')
            .setDescription(
              '모집 종료 날짜를 다음과 같은 식으로 넣어주세요. 예시 )2023/09/23',
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subCC) =>
      subCC
        .setName('모집종료')
        .setDescription('모집을 조기 종료합니다.')
        .addIntegerOption((option) =>
          option
            .setName('모집아이디')
            .setDescription('모집 ID를 입력해주세요.')
            .setRequired(true),
        ),
    ),
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   *
   */
  async execute (interaction) {
    if (interaction.options.getSubcommand() === '모집') {
      const gameName = interaction.options.getString('게임이름')
      const gameUserCount = interaction.options.getInteger('인원수')
      const gameEndDate = interaction.options.getString("종료날짜")

      if (gameName && gameUserCount && gameEndDate) {
        const assetsPath = '../../assets';
        const assetsFiles = fs
          .readdirSync(assetsPath)
          .filter((file) => file.endsWith('.png'));

        const randomFile = assetsFiles[Math.floor(Math.random() * assetsFiles.length)]
        const file = new AttachmentBuilder(`${assetsPath}/${randomFile}`)

        const embed = new EmbedBuilder()
          .setColor('Random')
          .setTitle("모집 안내")
          .setThumbnail(`attachment://${randomFile}`)
          .setDescription(`[ ${gameName} ] 를(을) 같이 할 시청자분들을 모집합니다!`)
          .addFields(
            {name: "모집 인원수", value: `이번 게임에 모집 인원수는 총 ${gameUserCount}명입니다!`},
            {name: "모집 종료 기간", value: `이번 게임에 모집 종료 기간은 ${gameEndDate} 11시 59분 59초까지 입니다!`}
          )
          .setTimestamp()

        interaction.reply({embeds: [embed], files: [file]})
      }
    }
  },
};
