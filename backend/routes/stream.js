import express from 'express';
import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const { userId, username } = req.body;

    const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

    // Optional: create user if not exists
    await serverClient.upsertUser({ id: userId, name: username });

    // Generate token for frontend
    const token = serverClient.createToken(userId);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
