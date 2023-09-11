const https = require("https");

//Obtiene el html de una pagina https
async function getHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, function (res) {
        // console.log(res.statusCode);
        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", function (chunk) {
          rawData += chunk;
        });
        res.on("end", function () {
          resolve(rawData);
        });
      })
      .on("error", function (err) {
        reject(err);
      });
  });
}
//Finders (parametros para la busqueda en cada web)
let finders = [];
//Carga los archivos de los finders, de esa forma no hay que declarar nuevas dependencias cada vez
async function loadFinders() {
  const { loadFiles } = require("../Functions/fileLoader");
  const Files = await loadFiles("WatcherResources/finders");
  const ascii = require("ascii-table");
  const table = new ascii().setHeading("Loader", "Status");

  Files.forEach((file) => {
    const loader = require(file);

    finders.push(loader);

    table.addRow(loader.domain, "✅");
  });

  return console.log(table.toString(), "\n¡Loaders Cargados!");
}
//Busca el finder correcto para la url basandose en el dominio
function getFinder(url) {
  return finders.find((finder) => {
    if (url.includes(finder.domain)) return finder;
  });
}
//Extrae los datos de la pagina de un articulo, como nombre, estado, reputación del vendedor, etc
async function CheckArticlePage(url) {
  const finder = getFinder(url);
  if (finder === undefined) return 404;
  return await finder.check(url);
}
//Busca todos los articulos mas nuevos (Osea la primera pagina) que coincidan con el toFind, y (si esta disponible), busca también subastas
async function FindArticles(domain, toFind, auction = false) {
  const finder = getFinder(domain);
  if (finder === undefined) return 404;
  return await finder.find(toFind, auction);
}
//Compara un articulo con otro y retorna las diferencias en un reporte (Se usa para vigilar articulos)
function CompareArticles(itemOld, itemNew) {
  let registers = {
    priceComparation: "",
    stateChanged: "",
    nameChanged: "",
    timeFormat: "",
    hasChange: false,
    ended: false,
  };

  if (!isNaN(itemNew)) {
    registers.hasChange = true;
    registers.ended = true;
    return registers;
  }

  if(itemOld.auction)
  {
    const timeFormat = 
    {
      old: itemOld.auction_time_left.split('').filter(i => isNaN(parseFloat(i)) && i !== ' '),
      new: itemNew.auction_time_left.split('').filter(i => isNaN(parseFloat(i)) && i !== ' ')
    }
    
    if(timeFormat.old.toString() !== timeFormat.new.toString())
    {
      registers.hasChange = true;
      registers.timeFormat = `\n\n**FORMATO HORARIO:** **De** ${itemOld.auction_time_left} **a** ${itemNew.auction_time_left}`;
    }
  }

  if (itemOld.name !== itemNew.name) {
    registers.hasChange = true;
    registers.nameChanged = `\n\n**NOMBRE:** **De** ${itemOld.name} **a** ${itemNew.name}`;
  }

  if (itemOld.state !== itemNew.state) {
    registers.hasChange = true;
    registers.stateChanged = `\n\n**ESTADO FISICO:** **De** ${itemOld.state} **a** ${itemNew.state}`;
  }

  if (itemOld.price !== itemNew.price) {
    registers.hasChange = true;
    registers.priceComparation = `\n\n**PRECIO:** **De** ${itemOld.price} **a** ${itemNew.price}`;
  }

  return registers;
}
//Funcion para organizar articulos de subasta y filtrarlos
function sortList(lista, filterWords, price_) {
  // Remove duplicates
  const uniqueList = [
    ...new Set(lista.map((item) => JSON.stringify(item))),
  ].map((item) => JSON.parse(item));

  // Filter out items that contain filter words in itemName or state
  const filteredList = uniqueList.filter((item) => {
    const itemName = item.name.toLowerCase();
    const state = item.state.toLowerCase();

    for (const word of filterWords) {
      if (itemName.includes(word) || state.includes(word)) {
        return false;
      }
    }

    return true;
  });

  // Sort by vendor rating and time remaining
  const sortedList = filteredList.sort((a, b) => {
    if (a.vendor === "" || b.vendor === "") return 0;

    const aRating = parseInt(a.vendor.match(/\d+/)[0]);
    const bRating = parseInt(b.vendor.match(/\d+/)[0]);
    if (aRating !== bRating) {
      return bRating - aRating;
    }

    const aTime = a.auction_state.match(/\d+/g);
    const bTime = b.auction_state.match(/\d+/g);

    if (aTime[0] !== bTime[0]) {
      return aTime[0] - bTime[0];
    }

    if (aTime[1] !== bTime[1]) {
      return aTime[1] - bTime[1];
    }

    return aTime[2] - bTime[2];
  });

  // Filter out items with price over $300 and convert price to float
  const filteredPriceList = sortedList.filter((item) => {
    const price = parseFloat(item.price.replace("$", ""));
    return price <= price_;
  });

  // Return first 5 items with most bids and last 5 items with least time remaining
  const top5Bids = filteredPriceList
    .sort((a, b) => {
      if (a.auction_state === " " || b.auction_state === " ") return 0;
      const aBids = parseInt(a.auction_state.match(/\d+/)[0]);
      const bBids = parseInt(b.auction_state.match(/\d+/)[0]);

      return bBids - aBids;
    })
    .slice(0, 5);

  const last5Time = filteredPriceList
    .sort((a, b) => {
      if (a.auction_state === " " || b.auction_state === " ") return 0;
      const aTime = a.auction_state.match(/\d+/g);
      const bTime = b.auction_state.match(/\d+/g);

      if (aTime[0] !== bTime[0]) {
        return bTime[0] - aTime[0];
      }

      if (aTime[1] !== bTime[1]) {
        return bTime[1] - aTime[1];
      }

      return bTime[2] - aTime[2];
    })
    .slice(-5);

  // Combine and return the two lists
  return [...top5Bids, ...last5Time];
}
//Funcion para organizar articulos de compra directa y filtrarlos
function sortBList(lista, filterWords, price_) {
  // Remove duplicates
  const uniqueList = [
    ...new Set(lista.map((item) => JSON.stringify(item))),
  ].map((item) => JSON.parse(item));

  // Filter out items that contain filter words in itemName or state
  const filteredList = uniqueList.filter((item) => {
    const itemName = item.name.toLowerCase();
    const state = item.state.toLowerCase();

    for (const word of filterWords) {
      if (itemName.includes(word) || state.includes(word)) {
        return false;
      }
    }

    return true;
  });

  // Filter out items with price over $300 and convert price to float
  const filteredPriceList = filteredList.filter((item) => {
    const price = parseFloat(item.price.replace("$", ""));
    return price <= price_;
  });

  // Return first 5 items
  return filteredPriceList.slice(0, 5);
}
//Retorna una lista con las mejores ofertas para cada usuario
async function CheckSubscribers(themesInfo) {
  const ofertas = [];
  await Promise.all(
    themesInfo.map(async (theme) => {
      (p_find = await FindArticles("ebay", theme.themeName)),
        (s_find = await FindArticles("ebay", theme.themeName, true));

      if (p_find.length > 0 || s_find.length > 0) {
        theme.subscribers.forEach((sub) => {
          const offert = {
            themeName: theme.themeName,
            user: sub.messageData,
            items: [],
          };
          const filteredListP = sortBList(p_find, sub.filters, sub.money);
          const filteredListS = sortList(s_find, sub.filters, sub.money);
          if (filteredListP.length > 0) offert.items.push(filteredListP);
          if (filteredListS.length > 0) offert.items.push(filteredListS);

          if (filteredListP.length < 0 && filteredListS.length < 0) {
            console.log(
              "Se encontraron ofertas pero no son validas para el usuario"
            );
          }
          ofertas.push(offert);
        });
      } else {
        console.log(
          "No se encontraron resultados nuevos en las ofertas de " +
            theme.themeName
        );
      }
    })
  );
  return ofertas;
}

module.exports = {
  CheckArticlePage,
  FindArticles,
  CheckSubscribers,
  getHtml,
  loadFinders,
  getFinder,
  CompareArticles,
};
