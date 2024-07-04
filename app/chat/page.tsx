'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";

import { useCookies } from 'next-client-cookies';

import { set, z, ZodError } from 'zod';

import { getSocket, disconnectSocket } from '../lib/socket'
import { Socket } from 'socket.io-client';

import SwitchDarkLight from "../components/SwitchDarkLight";
import ChatName from "../components/ChatName"
import ChatRequest from "../components/ChatRequest";
import ChatWindow from "../components/ChatWindow";
import { deleteCookies } from "../lib/deleteCookies";
import Link from "next/link";

type User = {
  username: string,
}

type ConversationReq = {
  _id: string,
  to: string,
  from: string,
  status: string,
  lastMessage: string
}

type Message = {
  _id: string,
  to: string,
  from: string,
  message: string
}

const loadIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 animate-spin">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>

const logOutIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 hover:text-teal-400 dark:hover:text-teal-400 hover:scale-110 transition duration-300 ease-in-out">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
</svg>

const chevronUp = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 group-hover:text-teal-400 transition duration-300 ease-in-out">
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
</svg>

const chevronDown = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 group-hover:text-teal-400 hover:scale-110 transition duration-300 ease-in-out">
  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
</svg>

const backIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 hover:text-teal-400 dark:hover:text-teal-400 hover:scale-110 transition duration-300 ease-in-out">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
</svg>

export default function Chat() {


  const router = useRouter()
  const cookies = useCookies();

  const usernameSchema = z.string()
    .min(3, { message: "username must be at least 3 characters long" })
    .max(39, { message: "username must not exceed 39 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "username can only contain letters, numbers, dashes and underscores" });

  const [user, setUser] = useState<User | null>(null)
  //console.log('Got to chat', user)

  const [reqSendUsername, setReqSendUsername] = useState<string>('')
  const [reqSendUsernameValid, setReqSendUsernameValid] = useState(false)
  const [reqUsernameValidationMessage, setReqUsernameValidationMessage] = useState<string>('');

  const [loading, setLoading] = useState(true)
  const [showSideBar, setShowSideBar] = useState(true)

  const [showAddRequestBar, setShowAddRequestBar] = useState(false)
  const [acceptedConversationReqs, setAcceptedConversationReqs] = useState<ConversationReq[]>([])
  const [pendingConversationReqs, setPendingConversationReqs] = useState<ConversationReq[]>([])

  const [requestFetched, setRequestFetched] = useState(false)
  const [newAcceptedRequest, setNewAcceptedRequest] = useState({ isAdded: true, data: null })

  const [curChat, setCurChat] = useState('')
  const [allChats, setAllChats] = useState<any>()
  const [hasMoreChats, setHasMoreChats] = useState<any>()

  const messages = curChat === '' ? [] : allChats[curChat]
  const hasMoreInfo = curChat === '' ? {} : hasMoreChats[curChat]

  const leftStyle = showSideBar ? "" : " hidden sm:flex "
  const rightStyle = showSideBar ? " hidden sm:flex " : " flex flex-col "
  const showAddRequestBarIcon = showAddRequestBar ? chevronDown : chevronUp
  const reqUsernameValidationMessageStyle = (reqUsernameValidationMessage === 'username is valid' || reqUsernameValidationMessage === 'request sent') ? " text-green-600 " : " text-red-600 "

  const smallScreenHeader = showSideBar ? <nav className='w-full py-2 dark:bg-slate-950 bg-slate-200 border-b border-teal-400 dark:border-teal-800 flex sm:hidden items-center justify-center'>
    <div className='flex px-8 flex-grow items-center justify-between'>
      <Link href='/'><h1 className='dark:text-teal-50 text-slate-500 select-none text-xl font-bold'>myChatApp</h1></Link>
      <SwitchDarkLight />
    </div>
  </nav> : <nav className='px-8 py-2 dark:bg-slate-950 bg-slate-200 border-b border-teal-400 dark:border-teal-800 flex sm:hidden items-center justify-center'>
    <div className='flex flex-grow items-center justify-between'>
      {curChat !== '' && <button onClick={() => { setShowSideBar(true); setCurChat('') }}>{backIcon}</button>}
      <h1 className='text-slate-500 dark:text-teal-50 select-none text-xl font-bold'>{curChat !== '' ? curChat : 'myChatApp'}</h1>
      <SwitchDarkLight />
    </div>
  </nav>

  const acceptedConversationReqsComp = acceptedConversationReqs?.map((item) => {
    const name = item.from === user?.username ? item.to : item.from
    const lastMessage = (allChats !== undefined && allChats[name] !== undefined) && allChats[name].length !== 0 ? `${allChats[name][allChats[name].length - 1].message}` : 'nothing for now...'
    return <ChatName key={item._id} name={name} lastMessage={lastMessage} isSelected={curChat === name} setCurChat={setCurChat} setShowSideBar={setShowSideBar} />
  })

  const pendingConversationReqsComp = pendingConversationReqs?.map((item) => {
    const name = item.from === user?.username ? item.to : item.from
    return <ChatRequest key={item._id} name={name} convoId={item._id} acceptConversationReq={acceptConversationReq} rejectConversationReq={rejectConversationReq} />
  })

  async function checkAuth() {
    // console.log('Checking Auth')
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
        method: 'GET',
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
        },
        credentials: 'include'
      });
      const res = await prom.json()
      if (res.user === null) {
        router.push('/')
      }
      setUser(res.user)
    }
    catch (e) {
      console.log(e)
    }
  }

  async function getInitialChats() {
    try {
      const allChats: any = {}
      const hasMoreChatsInfo: any = {}
      // console.log('Got here')
      for (const item of acceptedConversationReqs) {
        const name = item.from === user?.username ? item.to : item.from
        const promChat = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-messages?to=${name}`, {
          headers: {
            'Authorization': `${cookies.get('auth_session')}`,
          },
          credentials: 'include'
        })
        const resChat = await promChat.json()
        const resChatData = resChat.data
        resChatData.reverse()

        //console.log('Found this has more:', resChat.hasMore, resChat.lastId)

        allChats[name] = resChatData
        hasMoreChatsInfo[name] = { hasMore: resChat.hasMore, lastId: resChat.lastId }
      }

      //console.log('Setting these:', allChats)

      setAllChats(allChats)
      setHasMoreChats(hasMoreChatsInfo)
    }
    catch (e) {
      console.log(e)
    }
  }

  async function getMoreChats(to: string, lastId: string) {
    try {

      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-more-messages/?to=${to}&lastId=${lastId}`, {
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
        },
        credentials: 'include'
      })
      const res = await prom.json()
      setAllChats((prev: any) => {
        let newChatData = { ...prev }
        newChatData[to] = [...[...res.data].reverse(), ...prev[to]]
        return newChatData
      })
      setHasMoreChats((prev: any) => {
        let newHasMoreData = { ...prev }
        newHasMoreData[to] = { hasMore: res.hasMore, lastId: res.lastId }
        return newHasMoreData
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  function validateUsername() {
    try {
      usernameSchema.parse(reqSendUsername);
      setReqSendUsernameValid(true);
      setReqUsernameValidationMessage('username is valid');
    } catch (e) {
      setReqSendUsernameValid(false)
      if (e instanceof ZodError) {
        setReqUsernameValidationMessage(e.errors[0].message); // Return the validation error message
      }
      else {
        setReqUsernameValidationMessage('unknown error');
      }
    }
  };

  async function handleSendMessage(to: string, message: string) {
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send-message/`, {
        method: 'POST',
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
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
      setAllChats((prev: any) => {
        let newData: any = JSON.parse(JSON.stringify(prev));
        newData[to] = [...prev[to], data]
        return newData;
      })
      handleSendMessageSocket(res.data)
    }
    catch (e) {
      console.log(e)
    }
  }

  function handleSendMessageSocket(data: any) {
    // console.log('Called Socket too', data)
    const socketInstance: Socket = getSocket();
    socketInstance.emit('send_message_to_user', data);
  }

  async function handleSendConversationReq() {
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-request/`, {
        method: 'POST',
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: reqSendUsername,
        }),
        credentials: 'include'
      });

      if (!prom.ok) {
        const errorResponse = await prom.json();
        throw new Error(errorResponse.message || 'Request failed with status ' + prom.status);
      }

      const res = await prom.json()
      if (res.sent === true) {
        handleSendConversationReqSocket(res.data)
      }
    }
    catch (e: any) {
      setReqUsernameValidationMessage(e.message)
    }
  }

  function handleSendConversationReqSocket(data: any) {
    const socketInstance: Socket = getSocket();
    socketInstance.emit('send_convo_req', data);
    setReqSendUsername('');
    setReqUsernameValidationMessage('request sent')
  }

  async function getAcceptedConversationReqs() {
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-accepted-requests`, {
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
        },
        credentials: 'include'
      });
      const res = await prom.json()
      //console.log('Got these accepted conversation reqs:', res)
      setAcceptedConversationReqs(res)

    }
    catch (e) {
      console.log(e)
    }
  }

  async function getPendingConversationReqs() {
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-pending-requests`, {
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
        },
        credentials: 'include'
      });
      const res = await prom.json()
      setPendingConversationReqs(res)
    }
    catch (e) {
      console.log(e)
    }
  }

  async function acceptConversationReq(convoId: string) {
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accept-request/`, {
        method: 'POST',
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: convoId,
        }),
        credentials: 'include'
      });
      const res = await prom.json()
      setPendingConversationReqs((prev) => {
        return prev.filter((item) => item._id !== convoId)
      })
      setAcceptedConversationReqs((prev) => [...prev, res.data])

      setHasMoreChats((prev: any) => {
        let newHasMoreData = { ...prev }
        newHasMoreData[res.data.from] = { hasMore: false, lastId: null }
        return newHasMoreData
      })

      setAllChats((prev: any) => {
        let newData: any = JSON.parse(JSON.stringify(prev));
        newData[res.data.from] = []
        return newData;
      })
      acceptConversationReqSocket(res.data.from, res.data)

    }
    catch (e) {
      console.log(e)
    }
  }

  async function acceptConversationReqSocket(to: string, data: string) {
    const socketInstance: Socket = getSocket();
    //console.log('Calling Socket for: ', to, data)
    socketInstance.emit('accepted_req', { to: to, data: data });
  }

  async function rejectConversationReq(convoId: string) {
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reject-request/`, {
        method: 'POST',
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: convoId,
        }),
        credentials: 'include'
      });
      const res = await prom.json()
      //console.log('Got this res after rejection:', res)
      setPendingConversationReqs((prev) => {
        return prev.filter((item) => item._id !== convoId)
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  async function sendLogOut() {
    try {
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const res = await prom.json()
      // console.log('Logged Out:', res)
      deleteCookies()
      checkAuth()
    }
    catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    async function checkAuthAsync() {
      await checkAuth()
    }

    try {
      setLoading(true)
      checkAuthAsync()
    }
    catch (e) {
      console.log(e)
    }
    // finally {
    //   setLoading(false)
    // }

  }, [])

  useEffect(() => {
    async function getInitialChatsAsync() {
      await getInitialChats()
    }

    if (requestFetched) {
      try {
        setLoading(true)
        getInitialChatsAsync()
      }
      catch (e) {
        console.log(e)
      }
      // finally {
      //   console.log('Making loading false..., ', allChats, hasMoreChats)

      //   setLoading(false)
      // }
    }
  }, [requestFetched])

  useEffect(() => {
    // console.log('Running for', allChats, hasMoreChats, loading)
    if (allChats && hasMoreChats) {
      setLoading(false)
    }
  }, [allChats, hasMoreChats, loading])

  // Socket Stuff

  useEffect(() => {
    async function GetRequests() {
      await getPendingConversationReqs();
      await getAcceptedConversationReqs();
      setRequestFetched(true)
    }

    if (user) {
      const socketInstance: Socket = getSocket();

      // Setup event listeners
      socketInstance.on('connect', () => {
        //console.log('Socket connected with ID:', socketInstance.id);
        socketInstance.emit('give_name', { name: user.username, id: socketInstance.id, message: 'Hello, lolz!' });
      });

      socketInstance.on('disconnect', (reason) => {
        //console.log('Disconnected from socket server:', reason);
      });

      socketInstance.on('receive_new_message', (data) => {
        //console.log('New message from:', data.from, data)
        setAllChats((prev: any) => {
          let newData = { ...prev};
          newData[data.from] = [...prev[data.from], data]
          return newData
        })
      })

      socketInstance.on('receive_new_req', (data) => {
        //console.log('New convo req:', data)
        setPendingConversationReqs(prev => [...prev, data])
      })

      socketInstance.on('update_accepted_req', (data) => {
        //console.log('Convo Req accepted:', data)



        setHasMoreChats((prev: any) => {
          let newHasMoreData = { ...prev }
          newHasMoreData[data.data.to] = { hasMore: false, lastId: null }
          // console.log('Has More Data', prev, data, newHasMoreData)
          return newHasMoreData
        })

        setAllChats((prev: any) => {
          // let newData: any = JSON.parse(JSON.stringify(prev));
          let newData = { ...prev }
          newData[data.data.to] = []
          //console.log('All Chat Data', prev, data, newData)
          return newData;
        })

        setNewAcceptedRequest({ isAdded: false, data: data.data })
      })

      try {
        setLoading(true)
        GetRequests()
      }
      catch (e) {
        console.log(e)
      }
      // finally {
      //   setLoading(false)
      // }
      // Cleanup function to disconnect the socket on unmount
      return () => {
        disconnectSocket();
      };
    }
  }, [user]);

  useEffect(() => {
    // console.log('Changed so called', newAcceptedRequest, allChats, hasMoreChats)

    if (!newAcceptedRequest.isAdded) {
      // console.log('Adding to Acceppted Req')
      setAcceptedConversationReqs(prev => [...prev, newAcceptedRequest.data as any])

    }
    setNewAcceptedRequest({ isAdded: true, data: null })

  }, [allChats, hasMoreChats])

  useEffect(() => {
    validateUsername()
  }, [reqSendUsername])

  if (loading) {
    return (<div className="w-full h-full flex items-center justify-center gap-2">
      {loadIcon}
      <h1 className="text-2xl text-slate-500 dark:text-teal-50 font-bold ">Loading...</h1>
    </div>)
  }

  return (
    <div className='w-full h-full flex'>
      {/* LEFTSIDE */}
      <div className={"dark:bg-slate-950 bg-slate-200 sm:border-r border-slate-300 dark:border-slate-900 w-full sm:w-2/6 sm:max-w-96 sm:min-w-72 flex flex-col justify-between" + leftStyle}>
        <div className="overflow-hidden flex flex-col">
          {smallScreenHeader}
          <div className="overflow-y-auto flex-grow">
            {acceptedConversationReqsComp}
            {pendingConversationReqsComp}
          </div>
        </div>

        <div className="flex flex-col border-t border-slate-300 dark:border-slate-900">

          <div className="pt-8 pb-4 px-4 flex flex-col gap-4 items-center relative">
            <button className="border bg-slate-200 group border-slate-300 dark:border-slate-900 hover:scale-110 dark:bg-slate-950 size-14 absolute -top-8 rounded-full flex items-center justify-center transition duration-300 ease-in-out" onClick={() => setShowAddRequestBar((prev) => !prev)}>
              {showAddRequestBarIcon}
            </button>
            <p className="text-md sm:text-sm text-center text-slate-500 dark:text-teal-50">Want to text someone? {showAddRequestBar ? 'Just add them with their username.' : 'Just open the menu and add them.'}</p>

            {showAddRequestBar ? <div className="flex gap-2 w-4/5">
              <input className="w-full focus:outline focus:outline-teal-600 p-2 rounded bg-teal-50 dark:bg-slate-900 text-sm text-slate-500 dark:text-teal-50 placeholder:text-slate-400 dark:placeholder:text-slate-700" placeholder="type a username..." value={reqSendUsername} onChange={(e) => { setReqSendUsername(e.target.value); }} />
              <button className="rounded disabled:dark:text-slate-600 disabled:text-slate-400 text-slate-500 dark:text-teal-50 hover:text-teal-50 disabled:hover:text-slate-500 hover:bg-teal-600 disabled:hover:bg-slate-300 bg-slate-300 dark:bg-slate-900 hover:dark:bg-teal-600 disabled:hover:dark:bg-slate-900 font-bold px-4 transition duration-150 ease-in-out" disabled={!reqSendUsernameValid} onClick={() => handleSendConversationReq()}>Add</button>
            </div> : null}

            {showAddRequestBar && <p className={"text-md sm:text-sm text-center animate-pulse" + reqUsernameValidationMessageStyle}>{reqUsernameValidationMessage}</p>}
          </div>

          <div className=" flex items-center gap-2 py-2 px-4 border-t border-slate-300 dark:border-slate-900 justify-between">
            <div className="flex items-center gap-2 ">
              <div className="bg-teal-600 dark:bg-teal-800 select-none size-14 rounded-full flex font-bold text-xl items-center justify-center text-teal-50 flex-none">{user?.username[0]}</div>
              <h1 className="text-slate-500 dark:text-teal-50">{user?.username}</h1>
            </div>
            <div onClick={() => sendLogOut()}>
              {logOutIcon}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHTSIDE */}
      <div className={" flex-grow " + rightStyle}>
        {smallScreenHeader}
        <ChatWindow name={curChat} messages={messages} hasMoreInfo={hasMoreInfo} sendMessage={handleSendMessage} getMoreChats={getMoreChats} />
      </div>


    </div>
  )
}

