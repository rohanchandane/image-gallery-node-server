const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path'); // Required for static file serving
const fs = require('fs'); // File system access
// const http = require('http'); // Required for Socket.IO server
// const { Server } = require('socket.io'); // Socket.IO server

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// Middleware settings
// Enable CORS for all origins
app.use(cors());
// Configure static file serving for the 'uploads' directory
const imageUploadPath = path.join(__dirname, 'uploads');
app.use('/images', express.static(imageUploadPath));

// Configure Multer storage
const storage = multer.diskStorage({
    destination: 'uploads/', // Folder to store uploaded images
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.').pop(); // Get extension (if any)
      cb(null, `${file.fieldname}-${Date.now()}.${ext}`); // Generate unique filename
    },
  });
const upload = multer({ storage }); // Create multer instance

// Create HTTP server (required for Socket.IO)
// const server = http.createServer(app);

// Create Socket.IO server instance
// const io = new Server(server);

// Route for handling image upload
app.post('/upload', upload.any(), (req, res) => {
  if (!req.files[0].filename) {
    return res.status(400).send('No image uploaded');
  }

  const baseUrl = 'http://localhost:3000/images/'; // Adjust for your base URL
  const imageName = req.files[0].filename;
  const imageUrl = `${baseUrl}${imageName}`;

  console.log(`Image uploaded: ${imageUrl}`);

  // Generate image data object (replace with your data structure)
  const imageData = {
    name: imageName,
    url: imageUrl
  };

  // Emit 'new-image' event with image data to connected clients
//   io.emit('new-image', imageData);

  res.status(200).send({
    message:'Image uploaded successfully',
    imageData
});
});

app.get('/images', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Default limit of 10
    const skip = parseInt(req.query.skip) || 0; // Default skip of 0
    // const directoryPath = 'your_image_directory'; // Replace with your directory path
    // const response = {
    //     data: [{
    //         id: 1,
    //         name: 'Image 1',
    //         url: 'http://localhost:3000/images/image-1717949232693.jpg',
    //     },{
    //         id: 2,
    //         name: 'Image 2',
    //         url: 'http://localhost:3000/images/image-1717952329578.jpg',
    //     },{
    //         id: 3,
    //         name: 'Image 3',
    //         url: 'http://localhost:3000/images/image-1717952334260.jpg',
    //     },{
    //         id: 4,
    //         name: 'Image 4',
    //         url: 'http://localhost:3000/images/image-1717952336415.jpg', 
    //     },{
    //         id: 5,
    //         name: 'Image 5',
    //         url: 'http://localhost:3000/images/image-1717952337765.jpg',
    //     },{
    //         id: 6,          
    //         name: 'Image 6',
    //         url: 'http://localhost:3000/images/image-1717952341067.jpg', 
    //     },{
    //         id: 7,
    //         name: 'Image 7',
    //         url: 'http://localhost:3000/images/image-1717952342219.jpg',
    //     },{
    //         id: 8,
    //         name: 'Image 8',
    //         url: 'http://localhost:3000/images/image-1717952343243.jpg',
    //     },{
    //         id: 9,
    //         name: 'Image 9',
    //         url: 'http://localhost:3000/images/image-1717949240494.jpg',
    //     },{
    //         id: 10,
    //         name: 'Image 10',
    //         url: 'http://localhost:3000/images/image-1717952344244.jpg',
    //     },{
    //         id: 11,
    //         name: 'Image 11',
    //         url: 'http://localhost:3000/images/image-1717952345817.jpg',
    //     }, {
    //         id: 12,
    //         name: 'Image 12',
    //         url: 'http://localhost:3000/images/image-1717952346886.jpg',
    //     } ],
    //     total: 12,
    // };

// Read directory contents
    const files = await fs.promises.readdir(imageUploadPath);

    // Filter for files (exclude hidden files or directories)
    const images = files.filter((file) => !file.startsWith('.'));

    // Pagination logic
    const paginatedImages = images.slice(skip, skip + limit);

    // Construct image information
    const imageData = paginatedImages.map((image) => ({
        name: image, // Use filename as name for now
        url: `http://localhost:3000/images/${image}`, // Adjust for your base URL
    }));

    const total = images.length;

    const response = { data: imageData, total };

    res.status(200).json(response);
});

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//     console.log('Client connected');
// });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
