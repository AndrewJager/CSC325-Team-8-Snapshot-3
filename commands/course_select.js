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

		const role1 = interaction.options.getRole('role1');
		const role2 = interaction.options.getRole(`role2`);
		const role3 = interaction.options.getRole(`role3`);
		const role4 = interaction.options.getRole(`role4`);
		const role5 = interaction.options.getRole(`role5`);
		
		const roles = [];
		if (role1 !== null) {
			roles.push(new ButtonBuilder()
				.setCustomId('button1')
				.setLabel(`${role1.name}`)
				.setStyle(ButtonStyle.Secondary));
		}
		if (role2 !== null) {
			roles.push(new ButtonBuilder()
				.setCustomId('button2')
				.setLabel(`${role2.name}`)
				.setStyle(ButtonStyle.Secondary));
		}
		if (role3 !== null) {
			roles.push(new ButtonBuilder()
				.setCustomId('button3')
				.setLabel(`${role3.name}`)
				.setStyle(ButtonStyle.Secondary));
		}
		if (role4 !== null) {
			roles.push(new ButtonBuilder()
				.setCustomId('button4')
				.setLabel(`${role4.name}`)
				.setStyle(ButtonStyle.Secondary));
		}
		if (role5 !== null) {
			roles.push(new ButtonBuilder()
				.setCustomId('button5')
				.setLabel(`${role5.name}`)
				.setStyle(ButtonStyle.Secondary));
		}

		const buttonRow1 = new ActionRowBuilder()
			.addComponents(roles);
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

		collector.on('collect', async (i) => {
			const member = i.member;
			if (i.customId === 'button1') {
				if (!member.roles.cache.has(role1.id)) {
					member.roles.add(role1);
					await i.reply({ content: 'Role added', ephemeral:true });
	
				} else {
					member.roles.remove(role1);
					await i.reply({ content: 'Role removed', ephemeral:true });
				}
			}else if (i.customId === 'button2') {
				if (!member.roles.cache.has(role2.id)) {
					member.roles.add(role2);
					await i.reply({ content: 'Role added', ephemeral:true });
				} else {
					member.roles.remove(role2);
					await i.reply({ content: 'Role removed', ephemeral:true });
				}
			}else if (i.customId === 'button3') {
				if (!member.roles.cache.has(role3.id)) {
					member.roles.add(role3);
					await i.reply({ content: 'Role added', ephemeral:true });
				} else {
					member.roles.remove(role3);
					await i.reply({ content: 'Role removed', ephemeral:true });
				}
			}else if (i.customId === 'button4') {
				if (!member.roles.cache.has(role4.id)) {
					member.roles.add(role4);
					await i.reply({ content: 'Role added', ephemeral:true });
				} else {
					member.roles.remove(role4);
					await i.reply({ content: 'Role removed', ephemeral:true });
				}
			}else if (i.customId === 'button5') {
				if (!member.roles.cache.has(role5.id)) {
					member.roles.add(role5);
					await i.reply({ content: 'Role added', ephemeral:true });
				} else {
					member.roles.remove(role5);
					await i.reply({ content: 'Role removed', ephemeral:true });
				}
			}
			else {
				await i.reply({ content: 'nothing happened (this is an error)', ephemeral:true });
			}
			await wait(4000);
			await i.deleteReply();
		});
	},


};