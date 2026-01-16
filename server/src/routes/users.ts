import express from 'express';
import { getUsers, addUser, updateUser, deleteUser, login, signup, uploadPhoto } from '../controllers/userController.js';
import { auth, admin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile_pictures/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', auth, getUsers);
router.post('/', auth, admin, addUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, admin, deleteUser);
router.post('/signup', signup);
router.post('/login', login);
router.post('/:id/upload-photo', auth, upload.single('photo'), uploadPhoto);

export default router;
