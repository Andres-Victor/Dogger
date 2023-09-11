const { EmbedBuilder } = require("discord.js");
const {
  CheckArticlePage,
  loadFinders,
  CheckSubscribers,
  CompareArticles,
} = require("./watcher_http");
const {
  addTheme,
  addClip,
  removeSubFromTheme,
  getUserThemesList,
  getThemesInfo,
  getClipedItems,
  updateClip,
  unsubClip,
  getUserClips,
} = require("./data_manager");
const { checkActions } = require("./actions_timer");

loadFinders();
//Suscribe al usuario a un tema, para que luego sendOffers() le envie ofertas
function subscribe(userId, theme, filters, budget) {
  const done = addTheme(theme, userId, budget, filters);
  return done;
}
//Desuscribe al usuario del tema
function unsubscribe(theme, userId) {
  const done = removeSubFromTheme(theme, userId);
  return done;
}
//Obtiene la lista de temas a los que se ha suscrito el usuario
function getUserThemeList(userID) {
  const list = getUserThemesList(userID);
  return list;
}
//Revisa los clips de los usuarios(premiuns?) y les envia a cada uno cualquier cambio sucedido
async function checkClips(onlyPremium = false) {
  const client = global.discordClient;
  const clips = getClipedItems();
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const previusClipResult = clip.lastItemResult;
    let subs = clip.subscribers;
    if (onlyPremium) subs = subs.filter((sub) => sub.isPremium === true);
    if (subs.length < 0) continue;

    let currentResult = await CheckArticlePage(clip.itemUrl);

    const diference = CompareArticles(clip.lastItemResult, currentResult);

    updateClip(clip.itemUrl, currentResult);

    if (!diference.hasChange) continue;

    const embed = new EmbedBuilder();

    if (diference.ended) {
      embed
        .setTitle(previusClipResult.name)
        .setColor("Red")
        .setDescription(
          "Este objeto probablemente ha sido vendido, cancelado o borrado, tambien puede ser un error en mi busqueda, por favor entra al enlace del producto"
        )
        .setURL(previusClipResult.url)
        .setImage(previusClipResult.imageUrl);
    } else {
      embed
        .setTitle(clip.lastItemResult.name)
        .setColor("Orange")
        .setDescription(
          `**Cambios detectados**${diference.nameChanged}${diference.stateChanged}${diference.priceComparation}${diference.timeFormat}`
        )
        .setURL(clip.lastItemResult.url)
        .setImage(clip.lastItemResult.imageUrl);
    }

    for (let e = 0; e < subs.length; e++) {
      const sub = subs[e].messageId;
      client.users.fetch(sub, false).then((user) => {
        user.send({
          content: `🔶¡${user.displayName}! ¡Algo ha cambiado en uno de tus articulos ven a ver el resumen!🔶`,
          embeds: [embed],
        });
      });
    }
  }
}
//Busca cada tema y se lo manda a todos los usuarios individualmente basandose en sus preferencias (filtros presupuesto)
async function sendOffers() {
  const client = global.discordClient;

  console.log("Revision de ofertas iniciada");

  const arrayOfData = await CheckSubscribers(getThemesInfo());
  if (arrayOfData.length < 1) return;

  console.log("Se ha conseguido una lista de ofertas");

  arrayOfData.forEach((offer) => {
    if (offer.length < 1) {
      console.log("Error en la oferta");
      return;
    }
    client.users.fetch(offer.user, false).then((user) => {
      user.send(
        "¡Woof! ¡Woof!, digo.. ¡Hola " +
          user.displayName +
          "! He escarbado y encontre algunos resultados que te pueden gustar de **" +
          offer.themeName +
          "** ¡Espero que te gusten! ¡Woof!"
      );
    });

    let puchaseEmbeds = [];
    let auctionEmbeds = [];

    offer.items[0].forEach((item) => {
      let title = item.name;
      if (title.length > 50) {
        title = title.substring(0, 50) + "...";
      }
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setURL(item.url)
        .setColor("#90C8F2")
        .setDescription(
          `**Estado**: ${item.state}\n**Precio**: ${item.price}\n**Envío**: ${item.shipping}`
        )
        .setThumbnail(item.imgUrl)
        .setTimestamp(Date.now())
        .setFooter({ text: item.vendor });
      puchaseEmbeds.push(embed);
    });
    offer.items[1].forEach((item) => {
      let title = item.name;
      if (title.length > 50) {
        title = title.substring(0, 50) + "...";
      }
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setURL(item.url)
        .setColor("#90F2C1")
        .setDescription(
          `**Tipo**: Subasta\n**Estado-Subasta**: ${item.auction_state.replace(
            "bids",
            "ofertas"
          )}\n**Estado**: ${item.state}\n**Precio**: ${
            item.price
          }\n**Envío**: ${item.shipping}`
        )
        .setThumbnail(item.imgUrl)
        .setTimestamp(Date.now())
        .setFooter({ text: item.vendor });
      auctionEmbeds.push(embed);
    });
    client.users.fetch(offer.user, false).then((user) => {
      user.send({ embeds: puchaseEmbeds });
      user.send({ embeds: auctionEmbeds });
    });
  });

  console.log(
    "Se han enviado todas las ofertas con exito, Revision de ofertas finalizada"
  );
}

setTimeout(() => checkActions(sendOffers, checkClips), 20000);
setInterval(() => checkActions(sendOffers, checkClips), 600000);

module.exports = {
  subscribe,
  unsubscribe,
  sendOffers,
  getUserThemeList,
  CheckArticlePage,
  addClip,
  unsubClip,
  getUserClips,
};

//#endregion
