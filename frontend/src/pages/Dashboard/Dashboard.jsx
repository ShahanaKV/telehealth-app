import React, { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useStream } from "../../components/StreamContext";
import { useNavigate } from "react-router-dom";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

function Dashboard() {
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { user, token, Logout } = useStream();

  // Debug logs
  useEffect(() => {
    console.log("=== Dashboard Debug ===");
    console.log("API Key:", apiKey);
    console.log("User:", user);
    console.log("Token:", token ? "✅ Exists" : "❌ Missing");
    console.log("=====================");
  }, [user, token]);

  // Initialize chat client
  useEffect(() => {
    const initChat = async () => {
      if (!user || !token || !apiKey) {
        console.log("⏳ Waiting for:", {
          user: !!user,
          token: !!token,
          apiKey: !!apiKey
        });
        return;
      }

      try {
        console.log("🔄 Initializing Stream Chat...");
        
        // Create Stream Chat client
        const client = StreamChat.getInstance(apiKey);
        console.log("✅ Client instance created");

        // Connect user
        console.log("🔄 Connecting user:", user.id);
        await client.connectUser(
          {
            id: user.id,
            name: user.name || "Anonymous",
            image: `https://getstream.io/random_png/?name=${user.name || "user"}`,
          },
          token
        );
        console.log("✅ User connected successfully");

        // Create/join channel
        console.log("🔄 Creating/joining channel...");
        const newChannel = client.channel("messaging", "my_general_chat", {
          name: "General Chat",
          members: [user.id],
        });

        await newChannel.watch();
        console.log("✅ Channel joined successfully");

        setChatClient(client);
        setChannel(newChannel);
      } catch (error) {
        console.error("❌ Chat initialization error:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          statusCode: error.status
        });
        setError(error.message);
      }
    };

    initChat();

    // Cleanup
    return () => {
      if (chatClient) {
        console.log("🧹 Cleaning up chat client...");
        chatClient.disconnectUser()
          .then(() => console.log("✅ Chat client disconnected"))
          .catch((err) => console.error("❌ Disconnect error:", err));
      }
    };
  }, [user, token, apiKey]);

  const handleVideoCallClick = () => {
    navigate("/videoCall");
  };

  const handleLogout = async () => {
    if (chatClient) {
      await chatClient.disconnectUser();
    }
    await Logout();
    navigate("/login");
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state - waiting for user data
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Loading state - connecting to chat
  if (!chatClient || !channel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Connecting to chat...</p>
          <p className="text-sm text-gray-500 mt-2">Almost there</p>
          <button
            onClick={() => {
              console.log("Current state:", { user, token, chatClient, channel });
            }}
            className="mt-4 text-blue-600 underline text-sm"
          >
            Debug Info (Check Console)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex flex-wrap justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">Telehealth Dashboard</h1>
        <div className="flex gap-3 mt-2 sm:mt-0">
          <button
            onClick={handleVideoCallClick}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow"
          >
            📹 Start Video Call
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition shadow"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
}

export default Dashboard;
