const { Client, Collection, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const dotenv = require('dotenv');
const schedule = require('node-schedule')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

dotenv.config();
const token = process.env.TOKEN;
const id = process.env.ID;

const client = new Client({
  intents: [7796],
});

client.login(process.env.TOKEN);

const eventsPath = './events';
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = `./${eventsPath}/${file}`;
  const event = require(filePath);
  if (event.once === true) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.commands = new Collection();

const commands_json = [];

const commandsCategoryPath = './commands';
const commandsCategoryFiles = fs.readdirSync(commandsCategoryPath);

for (const category of commandsCategoryFiles) {
  const commandsPath = `./commands/${category}`;
  const commandsFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));
  for (const file of commandsFiles) {
    const command = require(`./commands/${category}/${file}`);
    client.commands.set(command.data.name, command);
    commands_json.push(command.data);
  }
}

const rest = new REST({ version: '10' }).setToken(token);

rest
  .put(Routes.applicationCommands(id), { body: commands_json })
  .then((command) => console.log(`${command.length}개의 커맨드를 푸쉬했습니다`))
  .catch(console.error);