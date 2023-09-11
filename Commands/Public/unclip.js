const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js")

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("unclip")
    .setDescription("Con este comando dejare de avisarte de los cambios que sucedan en el enlace que me indiques")
    .addStringOption(option => option.setName('url').setDescription('Url que se dejara de seguir').setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute(interaction)
    {
        const removed = global.watcher.unsubClip(interaction.user.id, interaction.options.getString('url'));

        interaction.reply({
            content:removed ? "A partir de ahora no te avisare cuando hayan cambios en este enlace, ¡Woof!" : "¡Parece que no tienes ningun clip con ese enlace!, Asegurate de escribirlo bien",
            ephemeral: true
        });
    }
};