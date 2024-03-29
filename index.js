// Imports
const {Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const fs = require("node:fs");
const path = require("node:path");

const db = require('./database');
const database = new db();

// Import token from private config file
const {token} = require('./config.json');

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});
client.commands = new Collection();

// Import commands
const commandPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.log('[WARNING] The command at ${filePath} is missing a required "data" or "execute property!');
    }
}

// Event on startup
client.once(Events.ClientReady, c => {
    console.log("Team 2.8 bot is now online!");
    console.log("Logged in as " + c.user.tag);

	database.setup();
});

// Run the desired command
client.on(Events.InteractionCreate, async interaction => {
	// Run autocomplete methods
	if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction, database);
		} catch (error) {
			console.error(error);
		}
	}
	if (interaction.isButton()) {
		const roleID = await database.getRoleIDByButtonID(interaction.customId);
		if (roleID !== "No id found!"){
			const member = interaction.member;
			const role = interaction.guild.roles.cache.find(role => role.id == roleID);
			if (!member.roles.cache.has(role.id)) {
				await member.roles.add(role);
				await interaction.reply({ content: 'Role ' + role.name + ' added', ephemeral:true });
			} else {
				await member.roles.remove(role);
				await interaction.reply({ content: 'Role ' + role.name + ' removed', ephemeral:true });
			}
			await wait(4000);
			await interaction.deleteReply();
		}
	}
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, database);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(token);