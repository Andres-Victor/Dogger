const { ChatInputCommandInteraction, SlashCommandBuilder, hyperlink} = require("discord.js")

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("cliplist")
    .setDescription("Retorna una lista con tus clips"),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute(interaction)
    {
        const list = global.watcher.getUserClips(interaction.user.id);
        let actualList = '';

        list.forEach(list => {
            actualList += hyperlink(list.lastItemResult.name, list.itemUrl)+'\n'
        });


        interaction.reply({
            content:actualList !== ''?'¡Woof! ¡Woof! Esta es la lista de articulos que reviso por tí:\n'+actualList : '¡Parece que no tienes nignun clip!, ¡Woof!',
            ephemeral: true
        });
    }
};