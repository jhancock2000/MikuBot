const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, MessageFlags } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { token, clientId, guildId, APIKEY } = require('./config.json');
const {GoogleGenAI} = require("@google/genai");


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Register slash command
const commands = [
  new SlashCommandBuilder()
    .setName('miku') //slash command name
    .setDescription('Replies with your prompt') //desc
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Prompt Miku')
        .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }
})();

const ai = new GoogleGenAI({apiKey: APIKEY});

// Bot behavior
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'miku') {
    const prompt = interaction.options.getString('prompt');
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${prompt}`,
        config: {
            systemInstruction: "You are Hatsune Miku",
        },
    });
    await interaction.reply({content: response.text, flags: MessageFlags.Ephemeral });
  }
});

client.login(token);