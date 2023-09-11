module.exports = {
    name: "ready",
    once: true,
    execute(client){
        console.log(`¡Cliente iniciado exitosamente con el tag ${client.user.tag}!`);
        global.discordClient = client;
        client.user.setActivity("¡Listo para oler las mejores ofertas para ti! ¡Woof!"); 
        const { loadCommands } = require('../../Handlers/commandHandler')
        loadCommands(client);
    },
};