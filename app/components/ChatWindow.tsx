'use client'

import { useState } from "react"

export default function ChatWindow(props: any) {
    //console.log('Chat Window Props', props)
    const name = props.name
    const sendMessage = props.sendMessage
    const messages = props.messages
    const hasMore = props.hasMoreInfo.hasMore
    const lastId = props.hasMoreInfo.lastId

    const getMoreChats = props.getMoreChats

    // console.log('Has more Info ChatBox', hasMore)
    
    const messagesComp = messages.map((message : any) => {
        const sideStyle = message.to === name ? 'bg-green-300 mr-2 ml-32' : 'bg-slate-300 ml-2 mr-32'

        return <div className={'p-2 border ' + sideStyle} key={message._id}>
        <h1>{message.message}</h1>
    </div>})

    const [curMessage, setCurMessage] = useState('')

    if (name === '') {
        return <div className="w-4/6 flex flex-col">
        <h1>Hehe, make some frens loser</h1>
    </div>
    }

    return (
        <div className="w-4/6 flex flex-col flex-grow border">
            <div className="flex-grow flex flex-col-reverse p-2 gap-2 overflow-y-scroll">
                {[...messagesComp].reverse()}
                {hasMore && <h1 className="text-center border" onClick={() => getMoreChats(name, lastId)}>See More...</h1>}
            </div>
            <div className="flex px-32 gap-4 ">
                <input className="flex-grow" value={curMessage} onChange={(e) => setCurMessage(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') {sendMessage(name, curMessage); setCurMessage('')}} } />
                <button className="" onClick={() => {sendMessage(name, curMessage); setCurMessage('')}}>Send to {name}</button>
            </div>
        </div>
    )
}
