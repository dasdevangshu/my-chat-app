

export default function ChatName(props: any) {

  const name = props.name
  const lastMessage = props.lastMessage
  const setCurChat = props.setCurChat
  const setShowSideBar = props.setShowSideBar
  const isSelected = props.isSelected
  const isNew = false

  // const nameStyle = isNew ? " text-teal-50 font-bold " : " text-teal-50 font-bold "
  // const messageStyle = isNew ? " text-teal-300 font-semibold animate-pulse " : " text-teal-400 font-normal "
  const isSelectedStyle = isSelected? " bg-teal-600 " : "  "
  const isSelectedHStyle = isSelected? ' text-teal-50 ' : ' group-hover:text-teal-50 text-slate-500 '
  const isSelectedPStyle = isSelected ? ' text-teal-50 ' : ' text-teal-500 dark:text-teal-400 '

  return (
    <div onClick={() => {setCurChat(name); setShowSideBar(false)}} className={" group hover:bg-teal-600 border-b border-slate-300 dark:border-slate-900 px-8 sm:px-4 py-2 flex items-center justify-between transition duration-150 ease-in-out" + isSelectedStyle}>
      <div>
        <h1 className={"text-lg select-none dark:text-teal-50 font-bold " + isSelectedHStyle}>{name}</h1>
        <p className={"text-xs select-none group-hover:text-teal-50 " + isSelectedPStyle}>{lastMessage}</p>
      </div>
      {/* {isNew && <div className="relative flex">
        <div className="size-2 flex-none bg-teal-400 rounded-full animate-ping "></div>
        <div className="size-2 flex-none bg-teal-400 rounded-full absolute"></div>
      </div>} */}
    </div>
  )
}
