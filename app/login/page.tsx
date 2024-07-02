'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import { useCookies } from 'next-client-cookies';

import { z, ZodError } from 'zod';

import { sendLogInServer } from "../lib/sendLoginServer";
import SwitchDarkLight from "../components/SwitchDarkLight"

type User = {
    username: string,
}

const loadIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 animate-spin">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>

export default function LogIn() {

    const router = useRouter();
    const cookies = useCookies();

    const usernameSchema = z.string()
        .min(3, { message: "username must be at least 3 characters long" })
        .max(39, { message: "username must not exceed 39 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/, { message: "username can only contain letters, numbers, dashes and underscores" });

    const passwordSchema = z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(39, { message: "password must not exceed 39 characters" })
        .regex(/[A-Z]/, { message: "password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "password must contain at least one number" })
        .regex(/^[a-zA-Z0-9_-]+$/, { message: "password can only contain letters, numbers, dashes and underscores" });


    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState("")
    const [usernameValid, setUsernameValid] = useState(false)
    const [usernameValidationMessage, setUsernameValidationMessage] = useState("")
    const [password, setPassword] = useState("")
    const [passwordValid, setPasswordValid] = useState(false)
    const [passwordValidationMessage, setPasswordValidationMessage] = useState("")
    const [logInMessage, setLogInMessage] = useState("enter your username and password and log in!")

    async function checkAuth() {
        try {
            const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${cookies.get('auth_session')}`,
                },
                credentials: 'include'
            });
            const res = await prom.json()
            setUser(res.user)
            if (res.user !== null) {
                router.push('/chat')
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    function validateUsername() {
        try {
            usernameSchema.parse(username);
            setUsernameValid(true);
            setUsernameValidationMessage('username is valid');
        } catch (e) {
            setUsernameValid(false)
            if (e instanceof ZodError) {
                setUsernameValidationMessage(e.errors[0].message); // Return the validation error message
            }
            else {
                setUsernameValidationMessage('unknown error');
            }
        }
    };

    function validatePassword() {
        try {
            passwordSchema.parse(password);
            setPasswordValid(true);
            setPasswordValidationMessage('password is valid');
        } catch (e) {
            setPasswordValid(false)
            if (e instanceof ZodError) {
                setPasswordValidationMessage(e.errors[0].message); // Return the validation error message
            }
            else {
                setPasswordValidationMessage('unknown error');
            }
        }
    };

    async function sendLogIn() {
        try {
            const res = await sendLogInServer(username, password)
            //console.log(res)
            if (res.loggedIn === 'true') {
                setLogInMessage(res.message)
                checkAuth()
                // router.push('/')
            }
            else {
                setLogInMessage(res.message)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        setLogInMessage("enter your username and password and log in!")
    }, [username, password])

    useEffect(() => {
        validateUsername()
    }, [username])

    useEffect(() => {
        validatePassword()
    }, [password])

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

    if (loading) {
        return (<div className="w-full h-full flex items-center justify-center gap-2">
            {loadIcon}
            <h1 className="text-2xl text-slate-500 dark:text-teal-50 font-bold ">Loading...</h1>
        </div>)
    }

    const pStyle = ' dark:text-teal-50 text-slate-500 text-sm '
    const buttonStyle = ' w-full disabled:dark:text-slate-600 disabled:text-slate-400 text-slate-500 dark:text-teal-50 rounded p-2 mt-2 text-slate-500 hover:text-teal-50 disabled:hover:text-slate-500 hover:bg-teal-600 disabled:hover:bg-slate-300 bg-slate-300 dark:bg-slate-900 hover:dark:bg-teal-600 disabled:hover:dark:bg-slate-900 font-bold px-4 transition duration-150 ease-in-out '
    const inputStyle = ' w-full autofill:shadow-[inset_0_0_0px_1000px_rgb(13,148,136)] focus:outline focus:outline-teal-600 p-2 rounded bg-teal-50 dark:bg-slate-900 text-sm text-slate-500 dark:text-teal-50 placeholder:text-slate-400 dark:placeholder:text-slate-700 '
    const usernameValidationStyle = usernameValid ? ' text-green-600 ' : ' text-red-600 '
    const passwordValidationStyle = passwordValid ? ' text-green-600 ' : ' text-red-600 '
    const logInValidationStyle = (logInMessage === 'enter your username and password and log in!' || logInMessage === 'you are logged in') ? ' text-green-600 ' : ' text-red-600 '

    if (!user) {
        return (
            <div className="w-full h-full flex flex-col items-center sm:justify-center gap-2">


                <nav className='w-full mb-12 sm:mb-0 py-2 dark:bg-slate-950 bg-slate-200 border-b border-teal-400 dark:border-teal-800 flex sm:hidden items-center justify-center'>
                    <div className='flex px-8 flex-grow items-center justify-between'>
                    <Link href='/'><h1 className='dark:text-teal-50 text-slate-500 select-none text-xl font-bold'>myChatApp</h1></Link>
                        <SwitchDarkLight />
                    </div>
                </nav>

                <div className=" border rounded-md border-slate-300 dark:border-slate-900 p-8 gap-8 w-4/5 max-w-80 flex flex-col justify-center items-center">
                    <div>
                        <h1 className='text-xl font-bold text-slate-500 dark:text-teal-50 select-none'>myChatApp</h1>
                        <p className='select-none text-teal-500 text-[10px]'>A MESSAGING WEBAPP</p>
                    </div>

                    <div className=" w-full flex gap-2 flex-col items-center">
                        <h1 className='text-xl font-bold text-slate-500 dark:text-teal-50 select-none'>LogIn</h1>
                        <p className={'text-sm text-center h-12 animate-pulse' + logInValidationStyle}>{logInMessage}</p>
                        <p className={'text-md sm:text-sm h-10 text-center animate-pulse' + usernameValidationStyle}>{usernameValidationMessage}</p>
                        <input className={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="enter your username" />
                        <p className={'text-md sm:text-sm h-10 text-center animate-pulse' + passwordValidationStyle}>{passwordValidationMessage}</p>
                        <input className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="enter your password" />
                        <button className={buttonStyle} onClick={() => sendLogIn()} disabled={!usernameValid || !passwordValid}>LogIn</button>
                        <button className={buttonStyle} onClick={() => { router.push(`${process.env.NEXT_PUBLIC_API_URL}/login/github`) }}>LogIn using Github</button>
                    </div>

                    <div className=" w-full flex flex-col items-center">
                        <p className={pStyle}>Don&apos;t have an account?</p>
                        <Link className="w-full" href='/signup'>
                            <button className={buttonStyle}>SignUp</button>
                        </Link>
                    </div>

                </div>
            </div>
        )
    }
}