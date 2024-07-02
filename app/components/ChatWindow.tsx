'use client'
import { useState } from 'react'

export default function ChatWindow(props: any) {

    const [curMessage, setCurMessage] = useState('')
    //console.log('ChatWindow props', props)
    const name = props.name
    const messages = props.messages
    const hasMore = props.hasMoreInfo.hasMore
    const lastId = props.hasMoreInfo.lastId
    const sendMessage = props.sendMessage
    const getMoreChats = props.getMoreChats

    const sendIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 group-disabled:text-slate-400 group-disabled:hover:text-slate-400 dark:group-disabled:text-slate-700 dark:group-disabled:hover:text-slate-700 group-disabled:hover:scale-100 group-enabled:hover:text-teal-400 hover:scale-110 transition duration-300 ease-in-out">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>

    const messagesComp = messages.map((message: any) => {
        const sideStyle = message.to === name ? ' bg-teal-600 text-teal-50 mr-2 ml-32 ' : ' dark:text-teal-50 text-slate-500 bg-slate-300 dark:bg-slate-900 ml-2 mr-32 '

        return (
            <div key={message._id} className={'p-2 rounded' + sideStyle}>
                <p className='text-sm '>{message.message}</p>
            </div>
        )
    })

    function handleSendMessage() {
        sendMessage(name, curMessage)
        setCurMessage('')
    }

    if (name === '') {
        return <div className="flex-grow flex flex-col items-center justify-center">
            <h1 className='text-xl font-bold text-slate-500 dark:text-teal-50 select-none'>myChatApp</h1>
            <p className='select-none text-teal-500 text-[10px]'>A MESSAGING WEBAPP</p>
        </div>
    }

    return (
        <div className='flex flex-col flex-grow overflow-hidden'>
            <div className='flex-grow flex flex-col-reverse p-2 gap-2 overflow-y-auto'>
                {[...messagesComp].reverse()}
                <button className="dark:text-teal-50 text-slate-500  p-2 text-center bg-slate-300 dark:bg-slate-900 rounded" disabled={!hasMore} onClick={() => getMoreChats(name, lastId)}>{hasMore ? 'See more messages...': 'No more messages...'}</button>
            </div>

            <div className='flex items-center py-4 justify-center border-t border-slate-300 dark:border-slate-900'>
                <div className='flex w-5/6 gap-4'>
                    <input className='flex-grow focus:outline focus:outline-teal-600 p-2 rounded bg-teal-50 dark:bg-slate-900 text-sm text-slate-500 dark:text-teal-50 placeholder:text-slate-400 dark:placeholder:text-slate-700' placeholder='type a message...' onChange={(e) => setCurMessage(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter' && curMessage!== '') {handleSendMessage()}}} value={curMessage} />
                    <button className='group' onClick={() => handleSendMessage()} disabled={curMessage === ''} >
                        {sendIcon}
                    </button>
                </div>
            </div>
        </div>
    )
}