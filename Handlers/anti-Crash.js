const { EmbedBuilder, WebhookClient } = require('discord.js');
const { inspect } = require('util');
const webhook = new WebhookClient(
    {
        url: "https://discord.com/api/webhooks/1141579152357589012/T1oXOKC3kaX30DeUxDinwKF3jXLYkwPhwoHMcr9Yavn67qRy_ZPR3EDL4zkaDZ5PT7dT"
    }
);

module.exports = (client) => {
    const embed = new EmbedBuilder().setColor('Red');

    client.on('error', err => {
        embed.setTitle("Discord API Error")
        .setDescription(`\`\`\ ${inspect(err, {depth: 0}).slice(0,1000)}\`\``)
        .setTimestamp();

        return webhook.send({embeds: [embed]});
    });

    process.on('unhandledRejection', (reason, promise) =>
    {
        console.log(reason+"\n"+promise);

        embed.setTitle("ERROR CRASH")
        .addFields({
            name: "Reason",
            value: `\`\`\ ${inspect(reason, {depth: 0}).slice(0,1000)}\`\``
        },
        {
            name: "Promise",
            value: `\`\`\ ${inspect(promise, {depth: 0}).slice(0,1000)}\`\``
        })
        .setTimestamp();
    
        return(webhook.send({embeds: [embed]}))
    });

    process.on('uncaughtException', (err, origin) =>
    {
        console.log(err+"\n"+origin);

        embed.setTitle("ERROR CRASH")
        .addFields({
            name: "ERR",
            value: `\`\`\ ${inspect(err, {depth: 0}).slice(0,1000)}\`\``
        },
        {
            name: "Origin",
            value: `\`\`\ ${inspect(origin, {depth: 0}).slice(0,1000)}\`\``
        })
        .setTimestamp();
    
        return(webhook.send({embeds: [embed]}))
    });

    
    process.on('uncaughtExceptionMonitor', (err, origin) =>
    {
        console.log(err+"\n"+origin);

        embed.setTitle("ERROR CRASH")
        .addFields({
            name: "ERR",
            value: `\`\`\ ${inspect(err, {depth: 0}).slice(0,1000)}\`\``
        },
        {
            name: "Origin",
            value: `\`\`\ ${inspect(origin, {depth: 0}).slice(0,1000)}\`\``
        })
        .setTimestamp();
    
        return(webhook.send({embeds: [embed]}))
    });

    process.on('warning', (warn) =>
    {
        console.log(warn);

        embed.setTitle("ERROR WARNING")
        .addFields(
        {
            name: "Warning",
            value: `\`\`\ ${inspect(warn, {depth: 0}).slice(0,1000)}\`\``
        })
        .setTimestamp();
    
        return(webhook.send({embeds: [embed]}))
    });
}
