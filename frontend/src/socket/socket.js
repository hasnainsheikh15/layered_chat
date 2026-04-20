import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  if (socket) return socket;

  socket = io("http://localhost:3000", {
    withCredentials: true, 
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};