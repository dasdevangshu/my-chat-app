'use client'
import React, { useEffect, useState } from 'react'
import { getSocket, disconnectSocket } from '../lib/socket'
import { Socket } from 'socket.io-client';
import ChatWindow from '../components/ChatWindow';

type User = {
    username: string,
}

type ConversationReq = {
    _id: string,
    to: string,
    from: string,
    status: string
}

type Message = {
    _id: string,
    to: string,
    from: string,
    message: string
}

type Chat = {
    username: Message[]
}


export default function Chat() {
    const [user, setUser] = useState<User | null>(null)
    const [toUsername, setToUsername] = useState('')
    const [conversationReqs, setConversationReqs] = useState<ConversationReq[]>([])
    const [acceptedConversationReqs, setAcceptedConversationReqs] = useState<ConversationReq[]>([])

    const [curChat, setCurChat] = useState('')
    const [allChats, setAllChats] = useState<any>()
    const [hasMoreChats, setHasMoreChats] = useState<any>()

    const messages = curChat === '' ? [] : allChats[curChat]
    const hasMoreInfo = curChat === '' ? {} : hasMoreChats[curChat]

    const conversationReqsComp = conversationReqs?.map((item) => {
        return <div className='border' key={item._id}>
            <h1>Request from {item.from}</h1>
            <div className='flex justify-center gap-2'>
                <button className='border' onClick={() => acceptConversationReq(item._id)}>Accept</button>
                <button className='border' onClick={() => rejectConversationReq(item._id)}>Reject</button>
            </div>
        </div>
    })

    const acceptedConversationReqsComp = acceptedConversationReqs?.map((item) => {
        const name = item.from === user?.username ? item.to : item.from

        return <div onClick={() => setCurChat(name)} className='border p-4' key={item._id}>
            <h1>{name}</h1>
        </div>
    })

    async function checkAuth() {
        try {
            const prom = await fetch('http://localhost:4000', { credentials: 'include' });
            const res = await prom.json()
            //console.log(res.user)
            setUser(res.user)
        }
        catch (e) {
            console.log(e)
        }
    }

    async function getInitialChats() {
        try{
            const allChats: any = {}
            const hasMoreChatsInfo: any = {}

            acceptedConversationReqs.forEach(async(item) => {
                const name = item.from === user?.username ? item.to : item.from
                const promChat = await fetch('http://localhost:4000/get-messages?to=' + name, {
                    credentials: 'include'
                })
                const resChat = await promChat.json()
                const resChatData = resChat.data
                resChatData.reverse()
                // console.log('With hasMore', resChat.hasMore)
                // console.log('Last Id', resChat.lastId)

                allChats[name] = resChatData
                hasMoreChatsInfo[name] = {hasMore: resChat.hasMore, lastId: resChat.lastId}
            })
            setAllChats(allChats)
            setHasMoreChats(hasMoreChatsInfo)
            // console.log('All Chats: ', allChats)
            //console.log('Has More Chats: ', hasMoreChats)
        }
        catch (e) {
            console.log(e)
        }
    }

    async function getMoreChats(to: string, lastId: string) {
        try {
            
            const prom = await fetch('http://localhost:4000/get-more-messages/?to=' + to + '&lastId=' + lastId, {
                credentials: 'include'
            })
            const res = await prom.json()
            setAllChats((prev: any) => {
                let newChatData = {...prev}
                newChatData[to] = [...[...res.data].reverse(), ...prev[to]]
                console.log('Chat New Data: ', newChatData)
                return newChatData
            })
            setHasMoreChats((prev: any) => {
                let newHasMoreData = {...prev }
                newHasMoreData[to] = {hasMore: res.hasMore, lastId: res.lastId}
                console.log('Chat Has More Data: ', newHasMoreData)
                return newHasMoreData
            })

            console.log('More Chats: ', res, allChats, hasMoreChats)
        }
        catch (e) {
            console.log(e)
        }
    }

    async function getPendingConversationReqs() {
        try {
            const prom = await fetch('http://localhost:4000/get-pending-requests', { credentials: 'include' });
            const res = await prom.json()
            //console.log('Got this res: ', res)
            setConversationReqs(res)
        }
        catch (e) {
            console.log(e)
        }
    }

    async function getAcceptedConversationReqs() {
        try {
            const prom = await fetch('http://localhost:4000/get-accepted-requests', { credentials: 'include' });
            const res = await prom.json()
            //console.log('Got this res: ', res)
            setAcceptedConversationReqs(res)
        }
        catch (e) {
            console.log(e)
        }
    }

    async function acceptConversationReq(convoId: string) {
        try {
            const prom = await fetch('http://localhost:4000/accept-request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: convoId,
                }),
                credentials: 'include'
            });
            const res = await prom.json()
            //console.log('Got this res:', res)
            setConversationReqs((prev) => {
                return prev.filter((item) => item._id !== convoId)
            })
            console.log('Accepted Conversation Request: ', res)
            // acceptConversationReqSocket()
            setAcceptedConversationReqs((prev) => [...prev, res.data])
            acceptConversationReqSocket(res.data.from, res.data)

        }
        catch (e) {
            console.log(e)
        }
    }

    async function acceptConversationReqSocket(to: string, data: string) {
        const socketInstance: Socket = getSocket();
        console.log('Calling Socket for: ', to, data)
        socketInstance.emit('accepted_req', {to: to, data: data});
    }

    async function rejectConversationReq(convoId: string) {
        try {
            const prom = await fetch('http://localhost:4000/reject-request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: convoId,
                }),
                credentials: 'include'
            });
            const res = await prom.json()
            //console.log('Got this res:', res)
            setConversationReqs((prev) => {
                return prev.filter((item) => item._id !== convoId)
            })
        }
        catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            const socketInstance: Socket = getSocket();

            // Setup event listeners
            socketInstance.on('connect', () => {
                console.log('Socket connected with ID:', socketInstance.id);
                socketInstance.emit('give_name', { name: user.username, id: socketInstance.id, message: 'Hello, lolz!' });
            });

            socketInstance.on('disconnect', (reason) => {
                console.log('Disconnected from socket server:', reason);
            });

            socketInstance.on('receive_new_message', (data) => {
                console.log('New message from:', data.from, data)
                setAllChats((prev: any) => {const newData={prev, [data.from]: [...prev[data.from], data]}; return newData})
            })

            socketInstance.on('receive_new_req', (data) => {
                console.log('New convo req:', data)
                setConversationReqs(prev => [...prev, data])
            })

            socketInstance.on('update_accepted_req', (data) => {
                console.log('Convo Req accepted:', data)
                setAcceptedConversationReqs(prev => [...prev, data.data])
            })

            getPendingConversationReqs();
            getAcceptedConversationReqs();

            // Cleanup function to disconnect the socket on unmount
            return () => {
                disconnectSocket();
            };
        }
    }, [user]);

    useEffect(() => {
        if (acceptedConversationReqs.length > 0) {
            getInitialChats()
        }
    }, [acceptedConversationReqs])

    async function handleSendMessage(to : string, message: string) {
        try {
            const prom = await fetch('http://localhost:4000/send-message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: to,
                    message: message,
                }),
                credentials: 'include'
            });
            const res = await prom.json()
            const data = res.data
            console.log('Got this res:', res)
            console.log('And this data', data)
            setAllChats((prev: any) => {const newData={prev, [data.to]: [...prev[data.to], data]}; return newData})
            handleSendMessageSocket(res.data)
        }
        catch (e) {
            console.log(e)
        }
    }

    function handleSendMessageSocket(data: any) {
        const socketInstance: Socket = getSocket();
        socketInstance.emit('send_message_to_user', data);
    }

    async function handleSendConversationReq() {
        const prom = await fetch('http://localhost:4000/add-request/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: toUsername,
            }),
            credentials: 'include'
        });
        const res = await prom.json()
        //console.log('Got this res:', res)
        if (res.sent === true) {
            handleSendConversationReqSocket(res.data)
        }
    }

    function handleSendConversationReqSocket(data: any) {
        const socketInstance: Socket = getSocket();
        socketInstance.emit('send_convo_req', data);
        setToUsername('');
    }

    return (
        <div className='h-screen flex flex-col border border-red-500'>
            <h1>{!user ? 'loading...' : user?.username}</h1>
            <div className='flex flex-grow overflow-hidden bg-slate-300'>
                <div className='bg-slate-500 w-2/6'>
                    {acceptedConversationReqsComp}
                    {conversationReqsComp}
                    <div className='border p-2'>
                        <h1>To Username: {toUsername}</h1>
                        <input className='border w-full' value={toUsername} onChange={(e) => setToUsername(e.target.value)} />
                        <button className='border' onClick={() => handleSendConversationReq()}>Send Req</button>
                    </div>
                </div>
                <ChatWindow name={curChat} sendMessage={handleSendMessage} getMoreChats={getMoreChats} messages={messages} hasMoreInfo={hasMoreInfo}/>
            </div>
        </div>
    )
}
