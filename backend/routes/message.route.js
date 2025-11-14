import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import {getMessage, sendMessage, deleteMessage} from '../controllers/message.controller.js';

const router = express.Router();
router.route('/send/:id').post(isAuthenticated,sendMessage);
router.route('/all/:id').get(isAuthenticated,getMessage);
router.route('/delete/:messageId').delete(isAuthenticated,deleteMessage);

export default router;