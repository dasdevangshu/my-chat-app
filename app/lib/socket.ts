import { io, Socket } from 'socket.io-client';

type SocketInstance = Socket | null;

let socket: SocketInstance = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
            
        });
    }
    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export { socket };
