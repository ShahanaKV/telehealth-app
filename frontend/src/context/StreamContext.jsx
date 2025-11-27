import React, { createContext, useState } from 'react';

export const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [streamToken, setStreamToken] = useState(null);

  return (
    <StreamContext.Provider value={{ user, setUser, streamToken, setStreamToken }}>
      {children}
    </StreamContext.Provider>
  );
};
