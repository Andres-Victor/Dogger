const fs = require("fs");
const path = require("path");

//lectura y escritura de archvios
module.exports = {
  async fileWrite(ruta, contenido) {
    const directorio = path.dirname(ruta);
    if (!fs.existsSync(directorio)) {
      fs.mkdirSync(directorio, { recursive: true });
    }
    fs.writeFileSync(ruta, JSON.stringify(contenido));
    return true;
  },
  async fileRead(ruta) {
    try {
      if (fs.existsSync(ruta)) {
        const contenido = fs.readFileSync(ruta, "utf-8");
        if (contenido.trim() === "") {
          return 500; // or any other value to indicate empty file
        }
        return JSON.parse(contenido);
      } else {
        return 500;
      }
    } catch (error) {
      console.error(error);
      return 500;
    }
  },
};
