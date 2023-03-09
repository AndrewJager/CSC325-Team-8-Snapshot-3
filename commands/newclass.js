const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits, UserFlagsBitField  } = require('discord.js');
const Course = require('../course');
const Color = require('color');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newclass')
		.setDescription('Create a class')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) => option.setName('dept').setDescription('The class dept (without the class number)').setRequired(true))
		.addStringOption((option) => option.setName('classcode').setDescription('The class number (without the dept)').setRequired(true))
		.addStringOption((option) => option.setName('semester').setDescription('The class semester (example: "Fall 2022"').setRequired(true))
        .addStringOption((option) => option.setName('cohabitate').setDescription('Select a class to cohabitate with').setRequired(false)
        .setAutocomplete(true)),
	async execute(interaction, database) {
		const dept = interaction.options.getString('dept').toUpperCase();
		const course = interaction.options.getString('classcode');
		const semester = interaction.options.getString('semester');
        
        //howto array
        const howArray = fs.readFileSync('./howto.txt').toString().split("\n");

        // Any message that should not cause the class creation to abort should be added to this variable
        let warning = "";
        
        const dbv = await database.courseExists(dept, course, semester);
        if (dbv) {
                await interaction.reply({ content: 'Sorry, but class ' + dept + course + ' - ' + semester + ' already exists.', ephemeral: true});
        } else {
            //Save course to database
            const courseObj = new Course(dept, course, semester);
            database.saveCourse(courseObj);
            
            const studentsRole = course + " Students";
            const veteranRole = course + " Veteran";

            let studentColor = await database.getAvailableColor();
            if (studentColor === "No available color") {
                studentColor = "#ffffff";
                warning += 'All colors in the database have been used! Defaulting student role color to #FFFFFF' + '\n';
            }
            else {
                database.setColorUsed(studentColor);
            }

            
            // Create student role, if it doesn't already exist
            if (!interaction.guild.roles.cache.find(role => role.name == studentsRole)) {
                await interaction.guild.roles.create({
                    name: studentsRole,
                    permissions: [PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.ChangeNickname,
                                PermissionsBitField.Flags.AddReactions, 
                                PermissionsBitField.Flags.AttachFiles],
                    color: studentColor
                });

                
            }
            // Create veteran role, if it doesn't already exist
            if (!interaction.guild.roles.cache.find(role => role.name == veteranRole)) {
                await interaction.guild.roles.create({
                    name: veteranRole,
                    permissions: [PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.ReadMessageHistory,,
                                PermissionsBitField.Flags.ChangeNickname,
                                PermissionsBitField.Flags.AddReactions, 
                                PermissionsBitField.Flags.AttachFiles],
                    color: Color(studentColor).darken(0.4).hex()
                });
            }

            // Create the channels, and restrict them to the student role
            const studentRoleID = interaction.guild.roles.cache.find(role => role.name === studentsRole).id;
            const profChannelPerms = [{id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel]},
                                {id: studentRoleID,
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

                    {id: studentRoleID,
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
                }).then(channel => {
                        for(i in howArray) {
                            channel.send(howArray[i])
                        }
                    })
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
            
            await interaction.reply({ content: warning + 'Created class ' + dept
                            + ' ' + course + ' in semester ' + semester, ephemeral: true });
        }
	},
    async autocomplete(interaction, database) {
		const focusedValue = interaction.options.getFocused();

        database.getAllCourses().then(courses => {
			const classes = [];
            classes.push('None');
			courses.forEach(course => {
                classes.push(course.dept + ' ' + course.code + ' ' + course.semester);
			});
			const filtered = classes.filter(course => course.startsWith(focusedValue));

            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
		});
	},
};