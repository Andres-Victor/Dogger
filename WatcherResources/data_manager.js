const watcher_http = require('./watcher_http');
const { fileRead, fileWrite } = require('./fileManager');


let themesInfo = [];
let proUsers = []
let clipedItems = [];
const jsonStates = {theme:true, cliped: true}
  fileRead("WatcherResources/data/themeSubscribers.json").then((content)=>{if(content != 500)themesInfo = content});
  fileRead("WatcherResources/data/itemsClipped.json").then((content)=>{if(content != 500)clipedItems = content});
  fileRead("WatcherResources/data/UsersData/proUsers.json").then((content)=>{if(content != 500)proUsers = content});
function getThemesInfo()
{
    return themesInfo;
}
function getClipedItems()
{
    return clipedItems;
}
  //Obtiene todos los temas a los que un usuario esta suscrito
function getUserThemesList(userID)
{
  let list = [];
  themesInfo.forEach((theme, index) => {
    theme.subscribers.forEach(sub => {
        if(sub.messageData === userID)
        {
          const userTheme = 
          {
            themeName: theme.themeName,
            filters: sub.filters,
            budget: sub.money
          }
          list.push(userTheme);
        }
    });
  });

  return list;
}
  //obtiene todos los clips a los que un usuario esta suscrito
function getUserClips(userId)
{
  const clips = clipedItems.filter(clip => clip.subscribers.find(sub => sub.messageId === userId) !== undefined)
  return clips;
}
  //Remueve un usuario de un tema y si este tema ya no tiene usuarios, lo elimina
function removeSubFromTheme(themeName, subscriberID)
{
  let userRemoved = false;
  themesInfo.forEach((theme, index) => {
    if (theme.themeName.toLowerCase() === themeName.toLowerCase()) {
      theme.subscribers.forEach((sub, index) => {
        if(sub.messageData === subscriberID)
        {
          theme.subscribers.splice(index, 1);
          userRemoved = true;
        }
      });
      if(theme.subscribers.length < 1)
      {
        themesInfo.splice(index, 1);
      }
    }
  });
  
  
  
  saveThemes();
  return userRemoved;
}
  //Agrega un tema o un usuario a un tema, y si el usuario ya esta, actualiza sus datos como presupuesto por ejemplo
function addTheme(themeName, subscribers_, presupuesto, filters) {
    let themeFound = false;
    let userFound = false;
  
    const filtersList = filters !== undefined && filters !== null ? filters.split(" "): [];  

    const newSub = { messageData:subscribers_, money: presupuesto, filters: filtersList};
  
    themesInfo.forEach(theme => {
      if (theme.themeName.toLowerCase() === themeName.toLowerCase()) {
        themeFound = true;
        theme.subscribers.forEach(sub => {
            if(sub.messageData === newSub.messageData)
            {
                userFound = true;
                sub.money = newSub.money, sub.filters = filtersList;
            }
        });

        if(!userFound)theme.subscribers.push(newSub);
      }
    });
  
    if (!themeFound) {
        themesInfo.push({
        themeName: themeName,
        subscribers: [newSub]
      });
    }

    saveThemes();

    return userFound;
}
  //Agrega un clip para un usuario (O lo suscribe a uno existente)
async function addClip(clipUrl, userID)
{
  let clipFound, userFound = false;
  const user = {messageId: userID, isPremium: false}
  if(proUsers.find(user => {if(user === userID) return true;}) == true)
  {
    user.isPremium = true;
  }
  
  clipedItems.find(item => {
    if(item.itemUrl === clipUrl)
    {
      clipFound = item;
      return item.subscribers.find(sub => {
        if(sub.messageId === user.messageId)
        {  
          sub.isPremium = user.isPremium;
          return userFound = true;
        }
      });
    }
  });

  if(clipFound === undefined)
  {
    if(watcher_http.getFinder(clipUrl) === undefined)
    {
      console.log("Se ha intentado agregar un enlace no registrado: "+clipUrl);
      return 402;
    } 
    else
    {
      const itemFinded = await watcher_http.CheckArticlePage(clipUrl);

      if(itemFinded > 100) return 404;

      clipFound = {
        itemUrl: clipUrl,
        lastItemResult: itemFinded,
        subscribers: [user]
      };

      clipedItems.push(clipFound)

      console.log('Se ha agregado un clip para el usuario: '+user.messageId+' url: '+clipUrl.slice(0, 35)+'...')
    }
  }
  saveClipped();

  return clipFound;
}
  //Actualiza el resultado de un clip o lo elimina si el clip ya fue vendido
async function updateClip(url, findResult)
{
  while (!jsonStates.cliped) {
    await new Promise(resolve => setTimeout(resolve, 100)); // wait for 1 second
  }

  jsonStates.cliped = false;
  clipedItems.find(clip => clip.itemUrl === url).lastItemResult = findResult;
  clipedItems = clipedItems.filter(clip => isNaN(clip.lastItemResult));
  jsonStates.cliped = true;
  
  saveClipped();
}
  //Desuscribe al usuario del clip que contenga la url, y de ser necesario elimina el clip
function unsubClip(userId, clipUrl)
{
  clipUrl = clipUrl.split("?")[0];
  let hasUser = false;
  clipedItems.find(item => {
    if(item.itemUrl === clipUrl)
    {
      hasUser = item.subscribers.filter(sub => sub.messageId === userId).length > 0;
      return item.subscribers = item.subscribers.filter(sub => sub.messageId !== userId);
    }
  });
  clipedItems = clipedItems.filter(clip => clip.subscribers.length !== 0);
  saveClipped();
  return hasUser;
}
  //guarda los datos de los temas en un .json
async function saveThemes() {
    while (!jsonStates.theme) {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for 1 second
    }
    jsonStates.theme = false;
    const done = await fileWrite("WatcherResources/data/themeSubscribers.json", themesInfo);
    jsonStates.theme = done;
}
  //guarda los datos de los clips en un .json
async function saveClipped() {
  while (!jsonStates.cliped) {
      await new Promise(resolve => setTimeout(resolve, 100)); // wait for 1 second
  }
  jsonStates.cliped = false;
  const done = await fileWrite("WatcherResources/data/itemsClipped.json", clipedItems);
  jsonStates.cliped = done;
} 

  


module.exports = {addTheme, addClip, getThemesInfo, fileRead, fileWrite, removeSubFromTheme, getUserThemesList, getClipedItems, updateClip, unsubClip, getUserClips}