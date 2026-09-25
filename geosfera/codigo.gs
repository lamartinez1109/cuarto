/* =====================================================================
   ¡LA GEÓSFERA!  ·  codigo.gs  (Google Apps Script)
   ---------------------------------------------------------------------
   Recibe las maquetas que envían los alumnos desde la aplicación y las
   guarda en una carpeta de Google Drive (un archivo .json y una imagen .png).

   No hay base de datos ni servidor propio: todo queda en tu Drive.

   PASOS (resumen; el detalle está en README.md):
   1. Entrá a https://script.google.com y creá un proyecto nuevo.
   2. Pegá este código en Código.gs.
   3. Escribí abajo el nombre de la carpeta (o su ID).
   4. Implementar > Nueva implementación > Tipo: Aplicación web
        - Ejecutar como: yo (tu cuenta)
        - Quién tiene acceso: cualquier persona
   5. Copiá la URL que termina en /exec y pegala en CONFIG.URL_APPS_SCRIPT
      dentro de script.js.
   ===================================================================== */

// ---- CONFIGURACIÓN (editable) ----------------------------------------
var NOMBRE_CARPETA = 'Maquetas Geosfera';  // Se crea en "Mi unidad" si no existe
var ID_CARPETA = '';                       // Opcional: ID de una carpeta que ya tengas (tiene prioridad)
var CLAVE = '';                            // Opcional: si la escribís acá, también va en CONFIG.CLAVE_DOCENTE
var MAX_BYTES_IMAGEN = 8 * 1024 * 1024;    // Límite de seguridad para la imagen (8 MB)


/** Se ejecuta cuando la aplicación envía una maqueta (método POST). */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responder_({ ok: false, error: 'No llegaron datos.' });
    }
    var datos = JSON.parse(e.postData.contents);

    if (CLAVE && datos.clave !== CLAVE) {
      return responder_({ ok: false, error: 'Clave incorrecta.' });
    }
    if (!datos.escena || !datos.escena.escena || !datos.escena.escena.objetos) {
      return responder_({ ok: false, error: 'La maqueta no tiene el formato esperado.' });
    }

    var carpeta = obtenerCarpeta_();
    var base = armarNombreBase_(datos.alumno, datos.nombre);

    // 1) Archivo .json (sirve para volver a abrir la maqueta en 3D)
    var json = JSON.stringify(datos.escena, null, 2);
    var archivoJson = carpeta.createFile(base + '.json', json, 'application/json');

    // 2) Imagen .png con las 4 vistas (si vino)
    var urlImagen = '';
    if (datos.imagen) {
      var bytes = Utilities.base64Decode(datos.imagen);
      if (bytes.length <= MAX_BYTES_IMAGEN) {
        var blob = Utilities.newBlob(bytes, 'image/png', base + '.png');
        urlImagen = carpeta.createFile(blob).getUrl();
      }
    }

    return responder_({ ok: true, json: archivoJson.getUrl(), imagen: urlImagen });
  } catch (error) {
    return responder_({ ok: false, error: String(error) });
  }
}

/** Sirve para comprobar en el navegador que la implementación está activa. */
function doGet() {
  return responder_({ ok: true, mensaje: 'La Geósfera: el servicio está activo.' });
}


// ---- Funciones auxiliares ---------------------------------------------

/** Busca la carpeta configurada; si no existe la crea. */
function obtenerCarpeta_() {
  if (ID_CARPETA) return DriveApp.getFolderById(ID_CARPETA);
  var carpetas = DriveApp.getFoldersByName(NOMBRE_CARPETA);
  return carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(NOMBRE_CARPETA);
}

/** Ejemplo: "Lucia Perez - Capas de la Tierra - 2026-09-24 10-32". */
function armarNombreBase_(alumno, nombre) {
  var fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH-mm');
  var partes = [limpiar_(alumno) || 'Sin nombre', limpiar_(nombre) || 'Maqueta', fecha];
  return partes.join(' - ');
}

/** Quita caracteres que Drive no permite en nombres y recorta el largo. */
function limpiar_(texto) {
  return String(texto || '').replace(/[\\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 40);
}

function responder_(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
