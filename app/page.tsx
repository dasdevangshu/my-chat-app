import { cookies } from 'next/headers'
import Link from "next/link";
import SwitchDarkLight from "./components/SwitchDarkLight";
import { redirect } from 'next/navigation';

export default async function page() {
  const cookieStore = cookies()
  const cookie = cookieStore.get('auth_session')
  const sessionId = cookie ? cookie.value : null

  console.log('Here Page!')

  const pStyle = ' dark:text-teal-50 text-slate-500 text-sm '
  const buttonStyle = ' rounded text-slate-500 dark:text-teal-50 p-2 mt-2 text-slate-500 hover:text-teal-50 disabled:hover:text-slate-500 hover:bg-teal-600 disabled:hover:bg-slate-300 bg-slate-300 dark:bg-slate-900 hover:dark:bg-teal-600 disabled:hover:dark:bg-slate-900 font-bold px-4 transition duration-150 ease-in-out '

  const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
    method: 'GET',
    headers: {
      'Authorization': `${sessionId}`,
    },
    credentials: 'include'
  });
  const res = await prom.json()
  console.log('User:', res)

  if (res.user) {
    redirect('/chat')
  }

  return <div className="h-full flex flex-col items-center w-full ">

    <nav className='w-full py-2 dark:bg-slate-950 bg-slate-200 border-b border-teal-400 dark:border-teal-800 flex sm:hidden items-center justify-center'>
      <div className='flex px-8 flex-grow items-center justify-between'>
        <Link href='/'><h1 className='dark:text-teal-50 text-slate-500 select-none text-xl font-bold'>myChatApp</h1></Link>
        <SwitchDarkLight />
      </div>
    </nav>

    <div className="flex-grow gap-4 flex flex-col justify-center items-center">
      <div>
        <h1 className='text-xl font-bold text-slate-500 dark:text-teal-50 select-none'>myChatApp</h1>
        <p className='select-none text-teal-500 text-[10px]'>A MESSAGING WEBAPP</p>
      </div>

      <div className=" mt-4 w-full flex flex-col items-center">
        <p className={pStyle}>It seems you are not logged in...</p>
        <p className={pStyle}>Already have an account?</p>
        <Link href='/login'>
          <button className={buttonStyle}>LogIn</button>
        </Link>
      </div>

      <div className=" w-full flex flex-col items-center">
        <p className={pStyle}>Don&apos;t have an account?</p>
        <Link href='/signup'>
          <button className={buttonStyle}>SignUp</button>
        </Link>
      </div>

    </div>
  </div>

}
