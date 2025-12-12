const express = require("express");
const { StreamChat } = require("stream-chat");
const protect = require("../middlewares/protect");

const router = express.Router();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Verify credentials exist
if (!apiKey || !apiSecret) {
  console.error("❌ Missing Stream credentials in streamRoutes");
  throw new Error("Stream API Key and Secret are required");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);
console.log("✅ Stream Routes initialized");

router.get("/get-token", protect, async (req, res) => {
  try {
    const { id, username } = req.user || {};

    if (!id || !username) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    const user = { 
      id, 
      name: username,
      role: "admin"
    };

    // Create/update user in Stream
    await streamClient.upsertUser(user);

    // Add to general chat channel
    const channel = streamClient.channel("messaging", "my_general_chat");
    await channel.addMembers([id]);

    // Generate token
    const token = streamClient.createToken(id);
    
    res.status(200).json({ 
      token, 
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Stream token generation error:", error);
    res.status(500).json({ error: "Failed to generate Stream token" });
  }
});

router.post("/token", async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userName = name || "Anonymous";
    const user = { id: userId, name: userName, role: "admin" };

    await streamClient.upsertUser(user);

    // Add user to my_general_chat channel
    const channel = streamClient.channel("messaging", "my_general_chat");
    await channel.addMembers([userId]);

    const token = streamClient.createToken(userId);

    res.status(200).json({
      token,
      user: {
        id: userId,
        name: name,
        role: "admin",
        image: `https://getstream.io/random_png/?name=${name}`,
      },
    });
  } catch (error) {
    console.error("Public token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

module.exports = router;