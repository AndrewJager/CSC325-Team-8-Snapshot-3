const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits, UserFlagsBitField  } = require('discord.js');
const Course = require('../obj/course');
const Color = require('color');
const fs = require('fs');
const { LIMIT_LENGTH } = require('sqlite3');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newclass')
		.setDescription('Create a class')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) => option.setName('dept').setDescription('The class dept (without the class number)').setRequired(true))
		.addStringOption((option) => option.setName('classcode').setDescription('The class number (without the dept)').setRequired(true))
		.addStringOption((option) => option.setName('semester').setDescription('The class semester (example: "Fall 2022"').setRequired(true))
        
        .addBooleanOption((option) => option.setName('videos').setDescription('Does this class require videos (Zoom Video recordings, or other) to be created? (True/False)').setRequired(true))
        //meet day selection
        .addStringOption((option) => option.setName('meet-day').setDescription('Input the day(s) to which the class meets').setRequired(false)
            .addChoices( {name: 'mon', value:'Monday'}, {name: 'tue', value:'Tuesday'}, {name: 'wed', value:'Wednesday'}, {name: 'thur', value:'Thursday'}, {name: 'fri', value:'Friday'}))
        .addStringOption((option) => option.setName('second-day').setDescription('Input the day(s) to which the class meets').setRequired(false)
            .addChoices( {name: 'mon', value:'Monday'}, {name: 'tue', value:'Tuesday'}, {name: 'wed', value:'Wednesday'}, {name: 'thur', value:'Thursday'}, {name: 'fri', value:'Friday'}))
        //time
        .addStringOption((option) => option.setName('times').setDescription('Input the meeting times (Start Time (AM/PM) - End Time (AM/PM)').setRequired(false))
        //zoom
        .addStringOption((option) => option.setName('zoom').setDescription('Paste the Zoom link for the class').setRequired(false))
        .addStringOption((option) => option.setName('cohabitate').setDescription('Select a class to cohabitate with').setRequired(false)
        .setAutocomplete(true)),
	async execute(interaction, database) {
		const dept = interaction.options.getString('dept').toUpperCase();
		const course = interaction.options.getString('classcode');
		const semester = interaction.options.getString('semester');
        //video parameter
        const video =  interaction.options.getBoolean('videos');
        //zoom parameters
        const dayOne = interaction.options.getString('meet-day');
        const dayTwo = interaction.options.getString('second-day');
        const time = interaction.options.getString('times');
        const link = interaction.options.getString('zoom');
        const cohabitate = interaction.options.getString('cohabitate');

        //howto array
        const howArray = fs.readFileSync('./howto.txt').toString().split("\n");

        // Any message that should not cause the class creation to abort should be added to this variable
        let warning = "";
        
        const dbv = await database.courseExists(dept, course, semester);
        if (dbv) {
                await interaction.reply({ content: 'Sorry, but class ' + dept + course + ' - ' + semester + ' already exists.', ephemeral: true});
        } else {
            
            const studentsRole = course + " Students";
            const veteranRole = course + " Veteran";

            
            // Create student role, if it doesn't already exist
            if (!interaction.guild.roles.cache.find(role => role.name == studentsRole)) {
                let studentColor = await database.getAvailableColor();
                if (studentColor === "No available color") {
                    studentColor = "#ffffff";
                    warning += 'All colors in the database have been used! Defaulting student role color to #FFFFFF' + '\n';
                }

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

                database.setColorUsed(studentColor);
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



            // template permissions and student id
            const studentRoleID = interaction.guild.roles.cache.find(role => role.name === studentsRole).id;

            if (cohabitate) {
                const cohabitateGroup = interaction.guild.channels.cache.find(channel => channel.name.startsWith('CSC'));
                warning += 'Cohabitating with ' + cohabitate + '. No channels have been created! ' + '\n';

                // Set permissions in category
                cohabitateGroup.permissionOverwrites.edit(studentRoleID, { ViewChannel: true, CreateInstantInvite: false });

                // Set permissions in child channels (the ones that need it)
                const announcementsChannel = cohabitateGroup.children.cache.find(c => c.name.startsWith("announcements"));
                announcementsChannel.permissionOverwrites.edit(studentRoleID, { ViewChannel: true, 
                    SendMessages: false, CreateInstantInvite: false, CreatePrivateThreads: false,
                    CreatePublicThreads: false });
                const zoomChannel = cohabitateGroup.children.cache.find(c => c.name.startsWith("zoom-meeting-info"));
                zoomChannel.permissionOverwrites.edit(studentRoleID, { ViewChannel: true, 
                    SendMessages: false, CreateInstantInvite: false, CreatePrivateThreads: false,
                    CreatePublicThreads: false });
                const videoChannel = cohabitateGroup.children.cache.find(c => c.name.startsWith("how-to-make-a-video"));
                if (videoChannel) {
                    videoChannel.permissionOverwrites.edit(studentRoleID, { ViewChannel: true, 
                        SendMessages: false, CreateInstantInvite: false, CreatePrivateThreads: false,
                        CreatePublicThreads: false });
                }
            }
            else {
                const profChannelPerms = [{id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]},
                    {id: studentRoleID,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                    deny: [PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.CreateInstantInvite,
                        PermissionsBitField.Flags.CreatePrivateThreads,
                        PermissionsBitField.Flags.CreatePublicThreads]}];

                //create channels => check for video parameters first
                if (video === true) {
                    interaction.guild.channels.create({
                        name: getCatName(dept, course, semester),
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
                        }).then(channel => {
                            channel.send("**Zoom Address**:         "+ link + "\n" + "**Class Days**: " + dayOne + ', ' + dayTwo + "\n" + "**Class Time**: " + time + "\n" + 'Note: You have to use SSO for UMICH when connecting to Zoom, using your UMICH ID')
                        })
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
                }
                else {
                    interaction.guild.channels.create({
                        name: getCatName(dept, course, semester),
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
                        }).then(channel => {
                            channel.send("**Zoom Address**:         "+ link + "\n" + "**Class Days**: " + dayOne + ', ' + dayTwo + "\n" + "**Class Time**: " + time + "\n" + 'Note: You have to use SSO for UMICH when connecting to Zoom, using your UMICH ID')
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
                }
            }
            //Save course to database
            const courseObj = new Course(dept, course, semester);
            database.saveCourse(courseObj);

            await interaction.reply({ content: warning + 'Created class ' + dept
                            + ' ' + course + ' in semester ' + semester, ephemeral: true });
	}},
    async autocomplete(interaction, database) {
		const focusedValue = interaction.options.getFocused();

        database.getAllCourses().then(courses => {
			const classes = [];
			courses.forEach(course => {
                classes.push(getCatName(course.dept, course.code, course.semester));
			});
			const filtered = classes.filter(course => course.startsWith(focusedValue));

            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
		});
	},
};

function getCatName(dept, code, semester) {
    return dept + ' ' + code + ' - ' + semester;
}