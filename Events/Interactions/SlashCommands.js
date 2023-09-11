const { ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute(interaction, client){
        if(!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if(!command) 
        return interaction.reply({
            content: "Este comando esta desactualizado",
            ephemeral: true,
        });

        if(command.developer && interaction.user.id !== process.env.DEV_ID)
        {
            interaction.reply({
                content: "Este comando es solo para desarrolladores, ¡Lo siento! ¡Woof!",
                ephemeral: true,
            })
        }

        command.execute(interaction, client);
    },
};