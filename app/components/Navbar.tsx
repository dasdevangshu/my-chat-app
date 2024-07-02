import React from 'react'
import SwitchDarkLight from './SwitchDarkLight'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className='w-full py-2 dark:bg-slate-950 bg-slate-200 border-b border-teal-400 dark:border-teal-800 hidden sm:flex items-center justify-center'>
      <div className='w-3/5 flex items-center justify-between'>
        <Link href='/'><h1 className='dark:text-teal-50 text-slate-500 select-none text-xl font-bold'>myChatApp</h1></Link>
        <SwitchDarkLight/>
      </div>
    </nav>
  )
}
