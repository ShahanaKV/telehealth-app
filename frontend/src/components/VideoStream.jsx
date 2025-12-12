import React, { useEffect, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-client";
import { StreamVideo, StreamCall } from "@stream-io/video-react-sdk";
import { useNavigate } from "react-router-dom";
import { useStream } from "./StreamContext";
import { MyUILayout } from "./MyUILayout";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

function VideoStream() {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const { user, token } = useStream();
  const navigate = useNavigate();

  useEffect(() => {
    let clientInstance;
    let callInstance;

    const setup = async () => {
      if (!apiKey || !user || !token) {
        console.log("Waiting for video setup...");
        return;
      }

      try {
        clientInstance = new StreamVideoClient({ 
          apiKey, 
          user: {
            id: user.id,
            name: user.name,
          }, 
          token 
        });

        callInstance = clientInstance.call("default", user.id);

        await callInstance.join({ create: true });

        setClient(clientInstance);
        setCall(callInstance);
        console.log("✅ Video call joined");
      } catch (error) {
        console.error("❌ Video setup error:", error);
      }
    };

    setup();

    return () => {
      if (callInstance) {
        callInstance.leave().catch(console.error);
      }
      if (clientInstance) {
        clientInstance.disconnectUser().catch(console.error);
      }
    };
  }, [user, token]);

  const handleLeaveCall = async () => {
    if (call) await call.leave();
    if (client) await client.disconnectUser();
    setCall(null);
    setClient(null);
    navigate("/dashboard");
  };

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-xl">❌ Missing Stream API Key</p>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Connecting to video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full p-2 sm:p-4 bg-gray-900">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MyUILayout />
        </StreamCall>
      </StreamVideo>

      <button
        onClick={handleLeaveCall}
        className="absolute top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transition font-semibold"
      >
        🚪 Leave Call
      </button>
    </div>
  );
}

export default VideoStream;