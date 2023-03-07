const { SlashCommandBuilder, EmbedBuilder, Embed, PermissionFlagsBits, ButtonStyle, ActionRowBuilder, ButtonBuilder, ActionRow, TeamMemberMembershipState } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('courses')
		.setDescription('Create a message to allow students to assign roles to themselves')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addRoleOption(option => option.setName('role1').setDescription('1st role you want to add.').setRequired(true))
		.addRoleOption(option => option.setName(`role2`).setDescription('2nd role you want to add.').setRequired(false))
		.addRoleOption(option => option.setName(`role3`).setDescription('3nd role you want to add.').setRequired(false))
		.addRoleOption(option => option.setName(`role4`).setDescription('4th role you want to add.').setRequired(false))
		.addRoleOption(option => option.setName(`role5`).setDescription('5th role you want to add.').setRequired(false)),

	async execute(interaction, client) {
		const roles = [];
		const buttons = [];

		// Declare a map to associate each button with a role
		const roleMap = new Map();

		for (i = 1; i <= 5; ++i) {
			roles.push(interaction.options.getRole(`role${i}`));
		}

		// Loop through the roles array and create a button for each role
		for (i = 0; i < roles.length; ++i) {
			if (roles[i] !== null) {
				buttons.push(
					new ButtonBuilder()
						.setCustomId(`button${i + 1}`)
						.setLabel(`${roles[i].name}`)
						.setStyle(ButtonStyle.Secondary)
				);
			}
		}

		// Set the roleMap entries with the button ids and the roles
		for (let i = 0; i < roles.length; ++i) {
			roleMap.set(`button${i + 1}`, roles[i]);
		}
		

		// if (role1 !== null) {
		// 	roles.push(new ButtonBuilder()
		// 		.setCustomId('button1')
		// 		.setLabel(`${role1.name}`)
		// 		.setStyle(ButtonStyle.Secondary));
		// }
		// if (role2 !== null) {
		// 	roles.push(new ButtonBuilder()
		// 		.setCustomId('button2')
		// 		.setLabel(`${role2.name}`)
		// 		.setStyle(ButtonStyle.Secondary));
		// }
		// if (role3 !== null) {
		// 	roles.push(new ButtonBuilder()
		// 		.setCustomId('button3')
		// 		.setLabel(`${role3.name}`)
		// 		.setStyle(ButtonStyle.Secondary));
		// }
		// if (role4 !== null) {
		// 	roles.push(new ButtonBuilder()
		// 		.setCustomId('button4')
		// 		.setLabel(`${role4.name}`)
		// 		.setStyle(ButtonStyle.Secondary));
		// }
		// if (role5 !== null) {
		// 	roles.push(new ButtonBuilder()
		// 		.setCustomId('button5')
		// 		.setLabel(`${role5.name}`)
		// 		.setStyle(ButtonStyle.Secondary));
		// }

		const buttonRow1 = new ActionRowBuilder()
			.addComponents(buttons)
		const embed = new EmbedBuilder()
			.setTitle('Course Selection Tutorial')
            .setDescription('Read the steps carefully to ensure you that you get into the right class that you are registered for.')
			.setColor('Yellow')
			.addFields([
				{
					name: 'Step 1',
					value: 'Verify what classes you have with Professor Spradling in SIS or your Class Schedule.',
				},
				{
					name: 'Step 2',
					value: 'View the courses below and verify that the ones you need match the ones you are registered in SIS with.',
				},
				{
					name: 'Step 3',
					value: 'Click the button that is labelled after the class that you need. You will receive a message that will say that the role was successfully added. Click the button again to remove the role.',
				},
				{
					name: 'Step 4',
					value: 'Verify that the channels you need access to were added to the sidebar after selecting the classes you need. You will see the left sidebar populate with channels after you click the buttons that are the classes you need.',
				},
			])

		await interaction.reply({ embeds: [embed], components: [buttonRow1] });

		const collector = await interaction.channel.createMessageComponentCollector();
			
		collector.on('collect', async i => {
			const member = i.member;
			let id = i.customId;

			// Get the role associated with the button id from the map
			let role = roleMap.get(id);
			if (role) {
				if (!member.roles.cache.has(role.id)) {
					await member.roles.add(role);
					await i.reply({ content: 'Role added', ephemeral:true });
				} else {
					await member.roles.remove(role);
					await i.reply({ content: 'Role removed', ephemeral:true });
				}
			await wait(4000);
			await i.deleteReply();
			} else {
				await i.reply({ content: 'nothing happened (this is an error)', ephemeral:true });
    			return;
			}
		});
	},


};