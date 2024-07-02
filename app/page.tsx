'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import { useCookies } from 'next-client-cookies';

import SwitchDarkLight from "./components/SwitchDarkLight";

type User = {
  username: string,
}

const loadIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 animate-spin">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>

export default function Home() {
  const router = useRouter();
  const cookies = useCookies();

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function checkAuth() {
    try {
      // setLoading(true)
      const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
        method: 'GET',
        headers: {
          'Authorization': `${cookies.get('auth_session')}`,
        },
        credentials: 'include'
      });
      // console.log('Prom: ',prom)
      const res = await prom.json()
      // console.log('Res: ',res)
      setUser(res.user)
      if (res.user !== null) {
        // console.log('going to chat here...')
        router.push('/chat')
      }else {
        // console.log('else here...')
        router.refresh()
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    async function load() {
      try{
        setLoading(true)
        await checkAuth()
      }
      catch(e){
        console.log(e)
      }
      finally{
        setLoading(false)
      }
    }

    load()
  }, [])

  const pStyle = ' dark:text-teal-50 text-slate-500 text-sm '
  const buttonStyle = ' rounded text-slate-500 dark:text-teal-50 p-2 mt-2 text-slate-500 hover:text-teal-50 disabled:hover:text-slate-500 hover:bg-teal-600 disabled:hover:bg-slate-300 bg-slate-300 dark:bg-slate-900 hover:dark:bg-teal-600 disabled:hover:dark:bg-slate-900 font-bold px-4 transition duration-150 ease-in-out '

  if (loading) {
    return (<div className="w-full h-full flex items-center justify-center gap-2">
      {loadIcon}
      <h1 className="text-2xl text-slate-500 dark:text-teal-50 font-bold ">Loading...</h1>
    </div>)
  }
  
  if (!user) {
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
}