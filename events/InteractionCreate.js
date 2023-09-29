const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error("No command matching")
    }

    try {
      await command.execute(interaction)
    } catch(error) {
      console.error(`error ${interaction.commandName}`)
      console.error(error)
    }
  },
};
