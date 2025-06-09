import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
  auth: {
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null
  },
  autoConnect: false,
  transports: ['websocket']
});

export default socket;
