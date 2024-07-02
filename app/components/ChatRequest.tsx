
const acceptIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 hover:text-green-600 text-teal-50 hover:scale-110 transition duration-300 ease-in-out">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

const rejectIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 hover:text-red-600 text-teal-50 hover:scale-110 transition duration-300 ease-in-out">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>


export default function ChatRequest(props: any) {

    const name = props.name
    const convoId = props.convoId
    const acceptConversationReq = props.acceptConversationReq
    const rejectConversationReq = props.rejectConversationReq

    return (
        <div className=" border-b border-slate-900 px-8 sm:px-4 py-2 flex items-center justify-between transition duration-150 ease-in-out">
            <div>
                <h1 className={"text-sm select-none "}><span className="font-bold text-teal-50">{name}</span><span className="text-teal-400"> wants to message you...</span></h1>
                <div className="flex items-center justify-start gap-4">
                    <div onClick={() => acceptConversationReq(convoId)}>
                        {acceptIcon}
                    </div>
                    <div onClick={() => rejectConversationReq(convoId)}>
                        {rejectIcon}
                    </div>
                </div>
            </div>
            <div className="relative flex">
                <div className="size-2 flex-none bg-teal-400 rounded-full animate-ping"></div>
                <div className="size-2 flex-none bg-teal-400 rounded-full absolute"></div>
            </div>
        </div>
    )
}
