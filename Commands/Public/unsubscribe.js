const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js")

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("unsub")
    .setDescription("Comando para cancelar la suscripcion a una categoria")
    .addStringOption(option => option.setName('category').setDescription('Categoria a la que te quieres desuscribir').setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute(interaction)
    {
        const category = interaction.options.getString('category');

        const answ = global.watcher.unsubscribe(category, interaction.user.id);

        interaction.reply( answ === true ? {content:`Está bién... dejare de avisarte acerca de ${category}.. woof (pero triste) 😢`, ephemeral: true} :  
        {content:`Parece que no estas suscrito a ninguna categoria llamada ${category}, ¡¿Quieres que te suscriba a una?! ¡Vamos solo dilo con /sub! ¡Woof!`, ephemeral: true});
    }
};