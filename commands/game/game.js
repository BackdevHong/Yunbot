const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
  ComponentType,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const dayjs = require("dayjs");
const { PrismaClient } = require("@prisma/client");
const schedule = require("node-schedule");
const { ButtonStyle } = require("discord-api-types/v10");

const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("게임")
    .setDescription("게임 명령어입니다.")
    .addSubcommand((subC) =>
      subC
        .setName("모집")
        .setDescription("게임 인원을 모집합니다.")
        .addStringOption((option) =>
          option
            .setName("게임이름")
            .setDescription("게임 이름(마인크래프트, GTA5 등)")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("인원수")
            .setDescription("모집 인원수를 설정합니다.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("종료날짜")
            .setDescription(
              "모집 종료 날짜를 다음과 같은 식으로 넣어주세요. 예시) 2023/09/23"
            )
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   *
   */
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "모집") {
      const gameName = interaction.options.getString("게임이름");
      const gameUserCount = interaction.options.getInteger("인원수");
      const gameEndDate = interaction.options.getString("종료날짜");
      let game_id;

      if (gameName && gameUserCount && gameEndDate) {
        const date = dayjs(gameEndDate);
        if (date.format() === "Invalid Date") {
          interaction.reply({
            content: "올바른 날짜 형식이 아닙니다. 다시 시도해주세요.",
            ephemeral: true,
          });
          return;
        }
        const assetsPath = path.resolve("assets");
        const assetsFiles = fs
          .readdirSync(assetsPath)
          .filter((file) => file.endsWith(".png"));

        const randomFile =
          assetsFiles[Math.floor(Math.random() * assetsFiles.length)];
        const file = new AttachmentBuilder(`${assetsPath}/${randomFile}`);

        const join = new ButtonBuilder()
          .setCustomId("join")
          .setLabel("참여")
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(join);

        const newGame = await prisma.gameOpens
          .create({
            data: {
              game_type: gameName,
              game_maxUserCount: gameUserCount,
              game_stopGameOpening: date,
            },
          })
          .then((r) => {
            game_id = r.game_id;
          });

        try {
          const newGameDoc = await prisma.gameOpens.findUnique({
            where: {
              game_id: game_id,
            },
          });

          const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("모집 안내")
            .setThumbnail(`attachment://${randomFile}`)
            .setDescription(
              `[ ${newGameDoc.game_type} ] 를(을) 같이 할 시청자분들을 모집합니다!`
            )
            .addFields(
              {
                name: "모집 인원수",
                value: `이번 게임에 모집 인원수는 총 ${newGameDoc.game_maxUserCount}명입니다!`,
              },
              {
                name: "모집 종료 기간",
                value: `이번 게임에 모집 종료 기간은 ${dayjs(
                  newGameDoc.game_stopGameOpening
                ).format("YYYY-MM-DD")} 오후 2시까지 입니다!`,
              }
            )
            .setTimestamp();

          const response = await interaction.reply({
            embeds: [embed],
            files: [file],
            components: [row],
          });

          try {
            const collector = response.createMessageComponentCollector({
              componentType: ComponentType.Button,
            });

            const job = schedule.scheduleJob(
              {
                second: 0,
                hour: 2,
                minute: 39,
                month: date.get("month"),
                dayOfMonth: date.get("date"),
              },
              () => {
                collector.stop();
              }
            );

            collector.on("collect", async (i) => {
              if (i.customId === "join") {
                const newGameCurrDoc = await prisma.currentGameUsers.findUnique(
                  {
                    where: {
                      gameOpensGame_id: game_id,
                    },
                  }
                );

                if (newGameCurrDoc === null) {
                  await i.reply({
                    content: `참여 신청이 완료되었습니다.`,
                    ephemeral: true,
                  });
                  await prisma.currentGameUsers.create({
                    data: {
                      current_users: [i.user.id],
                      gameOpensGame_id: newGameDoc.game_id,
                    },
                  });
                } else {
                  const userList = await prisma.currentGameUsers.findMany({
                    where: {
                      gameOpensGame_id: newGameDoc.game_id,
                    },
                    select: {
                      current_users: true,
                    },
                  });

                  if (userList[0].current_users.includes(i.user.id) !== false) {
                    const newData = userList[0].current_users;
                    const findIndex = newData.indexOf(i.user.id);
                    if (findIndex > -1) {
                      newData.splice(findIndex, 1);
                    }

                    await prisma.currentGameUsers.update({
                      where: {
                        gameOpensGame_id: newGameDoc.game_id,
                      },
                      data: {
                        current_users: newData,
                      },
                    });
                    await i.reply({
                      content: "참여 취소가 완료 되었습니다.",
                      ephemeral: true,
                    });
                  } else {
                    const newData = userList[0].current_users;
                    newData.push(i.user.id);

                    await prisma.currentGameUsers.update({
                      where: {
                        gameOpensGame_id: newGameDoc.game_id,
                      },
                      data: {
                        current_users: newData,
                      },
                    });
                    await i.reply({
                      content: `참여 신청이 완료되었습니다.`,
                      ephemeral: true,
                    });
                  }
                }
              }
            });

            collector.on("end", async (i) => {
              const channel = interaction.client.channels.cache.find(
                process.env.CHANNEL
              );

              const userList = await prisma.currentGameUsers.findMany({
                where: {
                  gameOpensGame_id: newGameDoc.game_id,
                },
                select: {
                  current_users: true,
                },
              });

              let newUserList = [];

              if (userList[0].current_users.length < 0) {
                const endEmbed = new EmbedBuilder()
                  .setColor("Random")
                  .setTitle("모집이 종료되었습니다")
                  .setDescription(
                    `[ ${newGameDoc.game_type} ] 모집이 완료되었습니다`
                  )
                  .addFields(
                    {
                      name: "모집 인원 결과",
                      value: `${userList[0].current_users.length}명 입니다!`,
                    },
                    { name: "쥬륵..", value: `아쉽지만 다음 게임에 만납시다!` }
                  )
                  .setTimestamp();
                console.log(channel);
                // await response.channel.send({ embeds: endEmbed });
              }

              if (
                newGameDoc.game_maxUserCount < userList[0].current_users.length
              ) {
                const shaffleArray = userList[0].current_users.sort(
                  () => 0.5 - Math.random()
                );
                newUserList = shaffleArray.slice(
                  0,
                  newGameDoc.game_maxUserCount
                );
              } else {
                newUserList = userList[0].current_users;
              }

              const user = newUserList.map((i) => `<@${i}>`);

              const endEmbed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("모집이 종료되었습니다")
                .setDescription(
                  `[ ${newGameDoc.game_type} ] 모집이 완료되었습니다`
                )
                .addFields(
                  {
                    name: "모집 인원 결과",
                    value: `${userList[0].current_users.length}/${newGameDoc.game_maxUserCount} 명입니다!`,
                  },
                  {
                    name: "이번 참여자는 두구두구...",
                    value: `${user.map((i) => `${i}`)} 입니다!`,
                  }
                )
                .setTimestamp();

              await prisma.realGames.create({
                data: {
                  gameOpensGame_id: newGameDoc.game_id,
                  real_users: newUserList,
                },
              });
              console.log(channel);
            });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  },
};
