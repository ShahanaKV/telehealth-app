import React, { useContext, useEffect, useState } from 'react';
import { StreamContext } from '../context/StreamContext.jsx';
import { Chat, Channel, ChannelHeader, MessageList, MessageInput } from 'stream-chat-react';
import '@stream-io/stream-chat-css/dist/css/index.css';
import { StreamVideo, VideoConference } from '@stream-io/video-react-sdk';
import './Dashboard.css'; // optional CSS for styling

const Dashboard = () => {
  const { user, chatClient, setChatClient } = useContext(StreamContext);
  const [streamToken, setStreamToken] = useState(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const initStream = async () => {
      if (!user) return;

      // 1️⃣ Get Stream token from backend
      const res = await fetch('http://localhost:5000/api/stream/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, username: user.username }),
      });
      const data = await res.json();
      setStreamToken(data.token);

      // 2️⃣ Initialize Stream Chat
      const { StreamChat } = await import('stream-chat');
      const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
      await client.connectUser({ id: user._id, name: user.username }, data.token);
      setChatClient(client);

      setVideoReady(true); // ready to start video
    };

    initStream();
  }, [user]);

  if (!chatClient || !videoReady) return <div>Loading Telehealth Dashboard...</div>;

  // Single demo channel for chat
  const channel = chatClient.channel('messaging', 'telehealth', {
    name: 'Telehealth Chat',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      {/* Chat Section */}
      <div style={{ width: '35%', borderRight: '1px solid #ccc' }}>
        <Chat client={chatClient} theme="messaging light">
          <Channel channel={channel}>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Channel>
        </Chat>
      </div>

      {/* Video Section */}
      <div style={{ flex: 1, background: '#f5f5f5' }}>
        <StreamVideo apiKey={import.meta.env.VITE_STREAM_API_KEY} token={streamToken}>
          <VideoConference />
        </StreamVideo>
      </div>
    </div>
  );
};

export default Dashboard;
