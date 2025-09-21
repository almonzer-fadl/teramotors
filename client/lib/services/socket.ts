import { io } from 'socket.io-client';

// Make sure to use NEXT_PUBLIC_ for client-side environment variables
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('[socket] Connected to server');
});

socket.on('disconnect', () => {
  console.log('[socket] Disconnected from server');
});
