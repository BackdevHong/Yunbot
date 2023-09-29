const { SlashCommandBuilder } = require('discord.js');

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
  async execute(interaction) {
    await interaction.reply('hello!');
  },
};
