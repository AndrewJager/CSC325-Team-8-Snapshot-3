const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits, GuildChannel, CategoryChannelChildManager, CategoryChannel } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
         .setName('delete-channels')
         .setDescription('This command will delete channels under a specific category.')
         .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
         .addStringOption((option) => option.setName('dept').setDescription('The class dept (without the class number)').setRequired(true))
	     .addStringOption((option) => option.setName('classcode').setDescription('The class number (without the dept)').setRequired(true))
	     .addStringOption((option) => option.setName('semester').setDescription('The class semester (example: "Fall 2022"').setRequired(true)),
         
    async execute(interaction, database) {
        const dept = interaction.options.getString('dept').toUpperCase();
        const course = interaction.options.getString('classcode');
        const semester = interaction.options.getString('semester');

        const studentsRole = course + " Students";
        const veteranRole = course + " Veteran";
        const catName = dept + ' ' + course + ' - ' + semester;

        const category = interaction.guild.channels.cache.find(cat => cat.name.toLowerCase() === catName.toLowerCase());

    if (category) {
        //delete children
        category.children.cache.forEach(channel => channel.delete());
        //delete category itself
        category.delete();

        // Delete course from database
        database.deleteCourse(dept, course, semester);

        await interaction.reply({ content: 'Channels deleted', ephemeral: true});
        
    } else { 
            await interaction.reply({ content: 'Content does not exist.', ephemeral: true});
        }              
    },
};