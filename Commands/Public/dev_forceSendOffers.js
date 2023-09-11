const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js")

module.exports = 
{
    developer: true,
    data: new SlashCommandBuilder()
    .setName("fso")
    .setDescription("FSO"),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute(interaction)
    {
        interaction.reply({
            content:"FSO Force",
            ephemeral: true
        });
        global.watcher.sendOffers();
    }
};