const { fileRead, fileWrite } = require("./fileManager");
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
    //historial de ejecuciones
let executedHistory = 
{
    lastSubCheck: null,
    normalClipCheck: null,
    premiumClipCheck: null
}
fileRead("WatcherResources/data/execution/executedHistory.his").then( res => {if(res !== 500) {executedHistory = res;} else saveExecutedHistory()});

function getCurrentTime() {
    const now = new Date();
    const currentTime = 
    {
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
        day: now.getUTCDate(),
        hour: now.getUTCHours(),
        minutes: now.getUTCMinutes()
    }
    return currentTime;
}
    //compara el tiempo y da un resumen de cuanto ha pasado desde previus a current
function checkSuperiorTime(previusTime, currentTime)
{
    let info = 
    {
        yearDif: currentTime.year - previusTime.year,
        monthDif: currentTime.month - previusTime.month,
        dayDif: currentTime.day - previusTime.day,
        hourDif: currentTime.hour - previusTime.hour,
        minuteDif: currentTime.minutes - previusTime.minutes
    }
    if (info.minuteDif < 0) {
        info.minuteDif += 60;
        info.hourDif -= 1;
    }
    if (info.hourDif < 0) {
        info.hourDif += 24;
        info.dayDif -= 1;
    }
    if (info.dayDif < 0) {
        const daysInMonth = new Date(currentTime.year, currentTime.month, 0).getDate();
        info.dayDif += daysInMonth;
        info.monthDif -= 1;
    }
    if (info.monthDif < 0) {
        info.monthDif += 12;
        info.yearDif -= 1;
    }
    return info;
}
    //revisa las acciones pendientes y las ejecuta de ser necesario
function checkActions(offers, clipCheck) {
    const currentTime = getCurrentTime();
    // console.log(`Revisando Acciones pendientes en ${currentTime.hour}:${currentTime.minutes}`);
    try {
        if (offers === undefined || clipCheck === undefined) return;
        if (executedHistory.lastSubCheck === null) {
            offers();
            clipCheck();
            executedHistory.normalClipCheck = currentTime;
            executedHistory.premiumClipCheck = currentTime;
            executedHistory.lastSubCheck = currentTime;
            saveExecutedHistory();
            return;
        }

        const toCheck = {
            offersCheck: checkSuperiorTime(executedHistory.lastSubCheck, currentTime).dayDif > 0,
            clipCheck: checkSuperiorTime(executedHistory.normalClipCheck, currentTime).hourDif >= 2,
            proClipCheck: checkSuperiorTime(executedHistory.premiumClipCheck, currentTime).minuteDif >= 30 || checkSuperiorTime(executedHistory.premiumClipCheck, currentTime).hourDif > 0
        }

        if (toCheck.offersCheck) {
            console.log("Check Daily Sub Trigged");
            offers();
            executedHistory.lastSubCheck = currentTime;
            executedHistory.lastSubCheck.hour = 18;
            saveExecutedHistory();
        }
        if (toCheck.clipCheck) {
            console.log("Check Hour clip Trigged");
            setTimeout(()=>clipCheck(), randomNumber(2000,5000))
            executedHistory.normalClipCheck = currentTime;
            saveExecutedHistory();
        }
        if (toCheck.proClipCheck) {
            console.log("Check 30 minutes clip Pro Trigged");
            setTimeout(()=>clipCheck(true), randomNumber(2000,5000))
            executedHistory.premiumClipCheck = currentTime;
            saveExecutedHistory();
        }
    } catch (error) {
        console.log("Ocurrio un error al revisar las tareas pendientes: " + error);
    }
}
    //Guarda el executed history en un .json
function saveExecutedHistory()
{
    fileWrite("WatcherResources/data/execution/executedHistory.his", executedHistory);
}
module.exports = 
{
    checkActions,
}