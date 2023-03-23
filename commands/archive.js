const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField } = require('discord.js');
//developed by Sarah Luetz
module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Archives a class cluster')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)//check if user has permission to manage roles
		.addChannelOption(option =>//select the class category to archive
		option.setName('cluster')
		.setDescription('Channel cluster to archive')
		.setRequired(true)
		.addChannelTypes(ChannelType.GuildCategory)
		)
		.addIntegerOption( option =>
			option.setName('class-num')
			.setDescription('Class number')
			.setRequired(true)
		),
		
		async execute(interaction) {
			const number = interaction.options.getInteger('class-num');
			const cluster = interaction.options.getChannel('cluster');
			const classStu = interaction.guild.roles.cache.find(role => role.name === `${number}` + ' Students'); //swap with role id with prof permission?
			const classVet = interaction.guild.roles.cache.find(role => role.name === `${number}` + ' Veteran');
			
			if (!classVet) {interaction.guild.roles.create({name: `${number}` + ' Veteran'})}
			if (!classStu) {await interaction.reply({content: 'There is no matching student role for that class number: ' + number, ephemeral: true});}
			
			const list = await interaction.guild.members.fetch();
			var rolesChanged = 0;
			//this could probably be optimized by using .filter, look into it later 
			for(i = 0; i < list.size; i++){ //loop through all students who have the classStu role
				var member = list.at(i); 
				if (member.roles.cache.some(role => role === classStu)) {
					member.roles.add(classVet); //add class-veteran role
					member.roles.remove(classStu);//remove classStu role
					rolesChanged = rolesChanged + 1
				}
			}
			cluster.permissionOverwrites.delete(classStu);//remove permission from classStu to access class cluster
			cluster.children.cache.forEach(channel => channel.permissionOverwrites.delete(classStu)); //remove permission from individual channels within the cluster
			await interaction.reply({content: 'Archived class ' + channel.name + '\n' + 'Users updated from student to veteran role: '
				+ rolesChanged, ephemeral: true});
		}
}