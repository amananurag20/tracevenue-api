const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const Media = require('../../models/Media');

class MediaController {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads/media');
    this.init();
  }

  // Initialize upload directory
  async init() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error initializing media directory:', error);
    }
  }

  // Helper function to format URL
  formatUrl(filename) {
    return `/media/${filename}`.replace(/\\/g, '/');
  }
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/media');
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uniqueId = uuidv4().slice(0, 8);
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const customName = req.body.customFileName || path.basename(originalName, extension);
    const finalName = `${timestamp}_${uniqueId}_${customName}${extension}`;
    
    // Store the custom name in the request for later use
    req.customName = customName;
    cb(null, finalName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

class MediaControllerImpl extends MediaController {
  constructor() {
    super();
  }

  // Handle file upload
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      const fileUrl = this.formatUrl(req.file.filename);

      // Create new media document
      const mediaDoc = new Media({
        filename: req.file.filename,
        displayName: req.customName,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user?._id, // If user authentication is implemented
        metadata: {
          uploadedAt: new Date().toISOString()
        }
      });

      await mediaDoc.save();

      const fileInfo = {
        name: req.file.filename,
        displayName: req.customName,
        url: fileUrl,
        size: req.file.size,
        type: req.file.mimetype,
        lastModified: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        data: fileInfo
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      // If database save fails, try to clean up the uploaded file
      try {
        await fs.unlink(path.join(this.uploadDir, req.file.filename));
      } catch (cleanupError) {
        console.error('Error cleaning up file after failed upload:', cleanupError);
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to upload file'
      });
    }
  }

  // List all media files
  async listFiles(req, res) {
    try {
      const mediaFiles = await Media.find({})
        .sort({ createdAt: -1 })
        .select('filename displayName url size mimeType createdAt updatedAt');

      const fileDetails = mediaFiles.map(file => ({
        name: file.filename,
        displayName: file.displayName,
        url: file.url,
        size: file.size,
        type: file.mimeType,
        lastModified: file.updatedAt.toISOString()
      }));

      return res.status(200).json({
        success: true,
        data: fileDetails
      });
    } catch (error) {
      console.error('Error listing files:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to list files'
      });
    }
  }

  // Delete a file
  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(this.uploadDir, filename);

      // First, try to delete from database
      const deletedFile = await Media.findOneAndDelete({ filename });
      if (!deletedFile) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // Then, try to delete the physical file
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
      } catch (fsError) {
        console.error('Error deleting physical file:', fsError);
        // Don't fail the request if physical file is already gone
      }

      return res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete file'
      });
    }
  }

  // Get multer middleware
  getUploadMiddleware() {
    return upload.single('file');
  }
}

module.exports = new MediaControllerImpl();