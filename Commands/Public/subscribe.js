const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js")

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("sub")
    .setDescription("Comando para suscribirse a una categoria y recibir recomendaciones diarias")
    .addStringOption(option => option.setName('category').setDescription('Categoria de interes').setRequired(true))
    .addNumberOption(option => option.setName('budget').setDescription('Costo maximo de los articulos que te muestre (Esto no incluye costo de envio)').setRequired(true))
    .addStringOption(option => option.setName('filter').setDescription('Palabras que no quieres que aparezcan en los articulos (ejemplo: dañado repuesto carcasa)')),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute(interaction)
    {
        const category = interaction.options.getString('category');
        const budget = interaction.options.getNumber('budget');
        const filters = interaction.options.getString('filter');

        const answ = global.watcher.subscribe(interaction.user.id, category, filters, budget);

        interaction.reply( answ === false ? 
        {content:`¡Listo ${interaction.user.displayName} ahora te avisare si encuentro algo interesante de **${category}**! ¡Woof!`, ephemeral: true} : 
        {content:`¡He mejorado tus preferencias en la categoria: **${category}**! ¡Woof!`, ephemeral: true});

        console.log(`El usuario ${interaction.user.tag} Se ha suscrito a la categoria ${category} con un presupuesto de ${budget} y con los siguientes filtros ${filters}`);
    }
};