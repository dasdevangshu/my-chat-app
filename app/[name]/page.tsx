'use client'
import { useState, useEffect } from'react';
import { getSocket, disconnectSocket } from '../lib/socket'
import { Socket } from 'socket.io-client';
import { Hanalei } from 'next/font/google';

export default function page(props: {params: any}) {

  const params = props.params;
  const name = params.name;

  const [curMessage, setCurMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  
  const messagesComp = messages.map((item) => <div>
    <h1 className='text-xl'>{item.name}</h1>
    <p className='text-md'>{item.message}</p>
  </div>)

  useEffect(() => {
    const socketInstance: Socket = getSocket();

    // Setup event listeners
    socketInstance.on('connect', () => {
        console.log('Socket connected with ID:', socketInstance.id);
        socketInstance.emit('give_name', { name: name, id:socketInstance.id,  message: 'Hello, lolz!' });
      });

    socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
    });

    socketInstance.on('new_message', (data) => {
        console.log('New message from server:', data);
        setMessages(messages => [...messages, data]);
    });

    // Cleanup function to disconnect the socket on unmount
    return () => {
        disconnectSocket();
    };
  }, []);

  function handleSendMessage() {
    const socketInstance: Socket = getSocket();
    socketInstance.emit('send_message', { name: name, id:socketInstance.id,  message: curMessage });
    setMessages(messages => [...messages, { name: name, message: curMessage }]);
    setCurMessage('');
  }



  return (
    <div className='flex flex-col h-screen'>
        <h1>Hello {name}!</h1>
        <div className='flex flex-row h-full bg-slate-300'>
          <div className='bg-rose-300 w-full'>
            {messagesComp}
          </div>
          <div className='bg-indigo-300 w-full'>
            
          </div>
        </div>
        <div className='flex flex-row mx-20'>
        <input value={curMessage} onChange={(e) => setCurMessage(e.target.value)} className='w-full border border-black'></input>
        <button onClick={() => handleSendMessage()}>Send</button>
        </div>
    </div>
  )
}
