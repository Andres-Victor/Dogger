const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require("discord.js")

function generateEmbedInfo(list)
{
    let descrip = "";

    list.forEach(categoryData => 
    {
        const toAdd = `**Categoria: **${categoryData.themeName} \n**Presupuesto: **${categoryData.budget} \n**Filtros: **${categoryData.filters.length > 0 ? categoryData.filters : "Ninguno"}\n\n`;   
        descrip += toAdd;
    });

    const embed = new EmbedBuilder()
    .setColor('#90F2C1')
    .setDescription(descrip);

    return embed;
}

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("sublist")
    .setDescription("Comando para obtener tu lista de suscripciones"),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute(interaction)
    {
        const list = global.watcher.getUserThemeList(interaction.user.id);
        interaction.reply(list !== undefined && list.length > 0 ? { content:`¡Woof! ¡Hola ${interaction.user.displayName}, estas son las categorias a las que estas suscrito!`, embeds: [generateEmbedInfo(list)], ephemeral: true} : {content: "No estas suscrito a ninguna categoria 😢", ephemeral: true});
    }
};