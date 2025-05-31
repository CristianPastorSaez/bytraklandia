const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const archiver = require('archiver');

const app = express();
const PORT = 443; // HTTPS

// Redirección de HTTP a HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { Location: 'https://www.bytraklandia.com' });
  res.end();
}).listen(80, () => {
  console.log('Redirección HTTP activa en puerto 80 hacia https://www.bytraklandia.com');
});

// Certificados SSL
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/bytraklandia.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/bytraklandia.com/fullchain.pem')
};

// Middleware para redirigir cualquier host no deseado
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host && host !== 'www.bytraklandia.com') {
    return res.redirect(301, 'https://www.bytraklandia.com');
  }
  next();
});

// Middleware adicional
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Servidor HTTPS activo en https://www.bytraklandia.com`);
});

// Ruta del directorio de mods
const modsDirectory = '/home/ubuntu/minecraft-server-1.18.2/mods';

// Endpoint para listar los mods
app.get('/list-mods', (req, res) => {
  fs.readdir(modsDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo leer el directorio' });
    }

    const mods = files.map(file => {
      const filePath = path.join(modsDirectory, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        mtime: stats.mtime
      };
    });

    const now = new Date();
    const thresholdDays = 5;
    const nuevos = mods.filter(mod => (now - new Date(mod.mtime)) < thresholdDays * 24 * 60 * 60 * 1000);
    const antiguos = mods.filter(mod => (now - new Date(mod.mtime)) >= thresholdDays * 24 * 60 * 60 * 1000);
    res.json({ nuevos, antiguos });
  });
});

// Endpoint para descargar un mod
app.get('/download-mod/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(modsDirectory, filename);

  if (!fs.existsSync(filePath) || path.dirname(filePath) !== modsDirectory) {
    return res.status(404).send('Archivo no encontrado');
  }

  res.download(filePath, filename);
});

// Endpoint para descargar todos los mods como ZIP
app.get('/download-all/:type', (req, res) => {
  const type = req.params.type;
  const now = new Date();
  const thresholdDays = 7;

  fs.readdir(modsDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo leer el directorio' });
    }

    const mods = files.map(file => {
      const filePath = path.join(modsDirectory, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        mtime: stats.mtime,
        path: filePath
      };
    });

    const filteredMods = mods.filter(mod => {
      const isRecent = (now - new Date(mod.mtime)) < thresholdDays * 24 * 60 * 60 * 1000;
      return type === 'nuevos' ? isRecent : !isRecent;
    });

    if (filteredMods.length === 0) {
      return res.status(404).send('No hay mods para descargar');
    }

    const zipFilename = `${type}-mods.zip`;
    res.setHeader('Content-Disposition', `attachment; filename=${zipFilename}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    filteredMods.forEach(mod => {
      archive.file(mod.path, { name: mod.name });
    });

    archive.finalize();
  });
});

// Endpoint para obtener el uptime
app.get('/uptime', (req, res) => {
  const uptimeFile = '/home/ubuntu/minecraft-server-1.18.2/uptime.txt';
  fs.readFile(uptimeFile, 'utf8', (err, data) => {
    if (err) {
      return res.json({ uptime: null });
    }

    const startTime = new Date(data.trim());
    const now = new Date();
    const diffMs = now - startTime;

    if (isNaN(diffMs) || diffMs < 0) {
      return res.json({ uptime: null });
    }

    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
    let uptimeStr = '';
    if (dias > 0) uptimeStr += dias + 'd ';
    uptimeStr += horas + 'h ' + minutos + 'm';
    res.json({ uptime: uptimeStr });
  });
});
