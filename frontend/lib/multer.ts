
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default upload;
