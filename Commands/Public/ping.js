const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js")

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("woof")
    .setDescription("¡Woof Woof!"),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute(interaction)
    {
        interaction.reply({
            content:"¡Woof!",
            ephemeral: true
        });
    }
};