import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Get the directory path of the current module
const modulePath = new URL(import.meta.url).pathname;
const imageUploadPath = path.join(path.dirname(modulePath), 'uploads');

app.use('/images', express.static(imageUploadPath));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage });

const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.post('/upload', upload.any(), (req, res) => {
  if (!req.files[0].filename) {
    return res.status(400).send('No image uploaded');
  }

  const baseUrl = 'http://localhost:3000/images/';
  const imageName = req.files[0].filename;
  const imageUrl = `${baseUrl}${imageName}`;

  console.log(`Image uploaded: ${imageUrl}`);

  const imageData = {
    name: imageName,
    url: imageUrl,
  };

  io.emit('new-image', imageData);

  res.status(200).send({
    message: 'Image uploaded successfully'
  });
});

app.get('/images', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  const images = await fs.promises.readdir(imageUploadPath);

  const paginatedImages = images.slice(skip, skip + limit);

  const imageData = paginatedImages.map((image) => ({
    name: image,
    url: `http://localhost:3000/images/${image}`,
  }));

  const total = images.length;

  const response = { data: imageData, total };

  res.status(200).json(response);
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});