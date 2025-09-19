import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

interface BotStatusEvent {
  botId: string;
  isOnline: boolean;
  timestamp: Date;
}

interface SocketEvents {
  botStatusChanged: (data: BotStatusEvent) => void;
}

export function useSocket(events: Partial<SocketEvents> = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to socket server
    socketRef.current = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Register event handlers
    if (events.botStatusChanged) {
      socket.on('botStatusChanged', events.botStatusChanged);
    }

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
}