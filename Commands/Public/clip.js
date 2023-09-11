const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, hyperlink } = require("discord.js")

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName("clip")
    .setDescription("Con este comando te avisare siempre que haya un cambio en el articulo que me indiques, ¡Woof!")
    .addStringOption(option => option.setName('url').setDescription('Url del articulo').setRequired(true)),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction)
    {
        await interaction.deferReply({ephemeral:true});
        
        const url = interaction.options.getString('url');

        const added = await global.watcher.addClip(url, interaction.user.id);
        if(added > 100)
        {
            interaction.editReply({
                content: "¡Lo siento! Hubo un error al inentar guardar este clip, probablemente es que no puedo acceder a esa pagina, ¡Woof!"
            });
            return;
        }

        let auctionPlus = '';

        if(added.lastItemResult.auction)
        {
            auctionPlus += `**Tipo: **Subasta\n **Restante: **${added.lastItemResult.auction_time_left}\n`
        }

        const embed = new EmbedBuilder()
        .setColor('#90F2C1')
        .setTitle(added.lastItemResult.name.slice(0, 35)+'...')
        .setDescription(`**Estado: **${added.lastItemResult.state}\n${auctionPlus}**Precio: **${added.lastItemResult.price}\n**Envio: **${added.lastItemResult.shipping}\n**Reembolsable: **${added.lastItemResult.refundable}`)
        .setURL(added.lastItemResult.url)
        .setThumbnail(added.lastItemResult.imageUrl)
        .setFooter({
            iconURL: added.lastItemResult.vendorInfo.porfilePicture,
            text:`${added.lastItemResult.vendorInfo.username} ${added.lastItemResult.vendorInfo.extraInfo}\n${added.lastItemResult.vendorInfo.userUrl}`
        })
        interaction.editReply({
            content: '¡Listo, ahora te avisare cada vez que ocurra un cambio en el siguiente articulo!',
            embeds: [embed]          
        });
    }
};