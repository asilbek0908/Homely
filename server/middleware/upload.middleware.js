const multer = require('multer');
const path = require('path');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars'),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`),
});

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/documents'),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files (jpg, png, webp) are allowed'));
};

const docFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimePart = file.mimetype.split('/')[1];
  if (ext && allowed.test(mimePart)) return cb(null, true);
  cb(new Error('Only image or PDF files are allowed'));
};

const uploadAvatar = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadDocument = multer({ storage: documentStorage, fileFilter: docFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { uploadAvatar, uploadDocument };
