
import React, { createContext, useContext, useState } from 'react';

interface StreamUrlContextType {
  streamUrl: string;
  setStreamUrl: (url: string) => void;
  twitchChannel: string;
  setTwitchChannel: (channel: string) => void;
}

const StreamUrlContext = createContext<StreamUrlContextType | undefined>(undefined);

export function StreamUrlProvider({ children }: { children: React.ReactNode }) {
  const [streamUrl, setStreamUrl] = useState("");
  const [twitchChannel, setTwitchChannel] = useState("");

  return (
    <StreamUrlContext.Provider value={{ streamUrl, setStreamUrl, twitchChannel, setTwitchChannel }}>
      {children}
    </StreamUrlContext.Provider>
  );
}

export function useStreamUrl() {
  const context = useContext(StreamUrlContext);
  if (context === undefined) {
    throw new Error('useStreamUrl must be used within a StreamUrlProvider');
  }
  return context;
}
