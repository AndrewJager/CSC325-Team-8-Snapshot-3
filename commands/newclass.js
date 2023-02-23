const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits  } = require('discord.js');
const Course = require('../course');
// const Color = require('color');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newclass')
		.setDescription('Create a class')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) => option.setName('dept').setDescription('The class dept (without the class number)').setRequired(true))
		.addStringOption((option) => option.setName('classcode').setDescription('The class number (without the dept)').setRequired(true))
		.addStringOption((option) => option.setName('semester').setDescription('The class semester (example: "Fall 2022"').setRequired(true))
        .addStringOption((option) => option.setName('cohabitate').setDescription('Select a class to cohabitate with').setRequired(true)
        .setAutocomplete(true)),
	async execute(interaction, database) {
		const dept = interaction.options.getString('dept').toUpperCase();
		const course = interaction.options.getString('classcode');
		const semester = interaction.options.getString('semester');

        //Save course to database
        const courseObj = new Course(dept, course, semester);
        database.saveCourse(courseObj);

        const studentsRole = course + " Students";
        const veteranRole = course + " Veteran";
        
        /* testing colors but it ain't working atm so ignore for now
        const colorOriginal = Color('rbg(255, 255, 255');
        const colorDarken = colorOriginal.darken(0.5);            */

        if (interaction.guild.roles.cache.find(role => role.name == studentsRole) && 
            interaction.guild.roles.cache.find(role => role.name == veteranRole)) {
                await interaction.reply({ content: 'Sorry, but that class already exists.', ephemeral: true});
        } else {
            
            await interaction.guild.roles.create({
                name: studentsRole,
                permissions: [PermissionsBitField.Flags.SendMessages,
                              PermissionsBitField.Flags.ViewChannel,
                              PermissionsBitField.Flags.ReadMessageHistory,
                              PermissionsBitField.Flags.ChangeNickname,
                              PermissionsBitField.Flags.AddReactions, 
                              PermissionsBitField.Flags.AttachFiles],
                color: Math.floor(Math.random() * (0xFFFFFF + 1))
            });
            await interaction.guild.roles.create({
                name: veteranRole,
                permissions: [PermissionsBitField.Flags.SendMessages,
                              PermissionsBitField.Flags.ViewChannel,
                              PermissionsBitField.Flags.ReadMessageHistory,,
                              PermissionsBitField.Flags.ChangeNickname,
                              PermissionsBitField.Flags.AddReactions, 
                              PermissionsBitField.Flags.AttachFiles],
                color: Math.floor(Math.random() * (0xFFFFFF + 1))
            });

            const studentID = interaction.guild.roles.cache.find(role => role.name === studentsRole).id;

            const profChannelPerms = [{id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel]},
                                {id: studentID,
                                allow: [PermissionsBitField.Flags.ViewChannel],
                                deny: [PermissionsBitField.Flags.SendMessages,
                                    PermissionsBitField.Flags.CreateInstantInvite,
                                    PermissionsBitField.Flags.CreatePrivateThreads,
                                    PermissionsBitField.Flags.CreatePublicThreads]}];

            interaction.guild.channels.create({
                name: dept + ' ' + course + ' - ' + semester,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [{
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]},

                    {id: studentID,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                    deny: [PermissionsBitField.Flags.CreateInstantInvite]}]})
            .then(category => {
                interaction.guild.channels.create({
                    name: 'announcements-' + course,
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: profChannelPerms
                });
                interaction.guild.channels.create({
                    name: 'zoom-meeting-info-' + course,
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: profChannelPerms
                });
                interaction.guild.channels.create({
                    name: 'how-to-make-a-video',
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: profChannelPerms
                });
                interaction.guild.channels.create({
                    name: 'introduce-yourself',
                    type: ChannelType.GuildText,
                    parent: category.id
                });
                interaction.guild.channels.create({
                    name: 'chat',
                    type: ChannelType.GuildText,
                    parent: category.id
                });
            });
            
            await interaction.reply({ content: 'Created class ' + dept
                            + ' ' + course + ' in semester ' + semester, ephemeral: true });
            }
	},
    async autocomplete(interaction, database) {
		const focusedValue = interaction.options.getFocused();

        database.getAllCourses().then(courses => {
			const classes = [];
            classes.push('None');
			courses.forEach(course => {
                classes.push(course.dept + ' ' + course.code);
			});
			const filtered = classes.filter(course => course.startsWith(focusedValue));

            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
		});
	},
};