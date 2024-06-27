import { io, Socket } from 'socket.io-client';

// Define types for the socket instance and the connection URL
type SocketInstance = Socket | null;

let socket: SocketInstance = null;

// Function to get the socket instance
export const getSocket = (): Socket => {
    if (!socket) {
        socket = io('http://localhost:4000', {
            // Include options if needed, for example:
            // withCredentials: true,
            // transports: ['websocket', 'polling'],
        });
    }
    return socket;
};

// Function to disconnect the socket
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Export the current socket instance directly
export { socket };
