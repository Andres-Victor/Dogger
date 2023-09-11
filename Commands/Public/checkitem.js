const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("¡Revisare la información relevante de un articulo por ti!")
    .addStringOption(option => option.setName('url').setDescription('Url del articulo que quieres que revise').setRequired(true)),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction)
    {
        await interaction.deferReply()

        const url = interaction.options.getString('url');
        const answ = await global.watcher.CheckArticlePage(url);

        if(answ > 100)
        {
            interaction.editReply({
                content:'¡Ups! Parece que no puedo acceder a esa pagina... Puede que solo sea un error ¡Woof!',
            })
        }

        else
        {
            let auctionPlus = '';

            if(answ.auction)
            {
                auctionPlus += `**Tipo: **Subasta\n **Restante: **${answ.auction_time_left}\n`
            }

            const embed = new EmbedBuilder()
            .setColor('#90F2C1')
            .setTitle(answ.name.slice(0, 35)+'...')
            .setDescription(`**Estado: **${answ.state}\n${auctionPlus}**Precio: **${answ.price}\n**Envio: **${answ.shipping}\n**Reembolsable: **${answ.refundable}`)
            .setURL(answ.url)
            .setImage(answ.imageUrl)
            .setFooter({
                iconURL: answ.vendorInfo.porfilePicture,
                text:`${answ.vendorInfo.username} ${answ.vendorInfo.extraInfo}\n${answ.vendorInfo.userUrl}`
            })
            interaction.editReply({
                content: '¡Esto es lo que encontre en la pagina! ¡Woof! ¡Woof!',
                embeds: [embed]          
            });
        }
    }
};