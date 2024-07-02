'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation'
import { useCookies } from 'next-client-cookies';
import { setCookies } from '../lib/setCookies'

const loadIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-6 text-slate-500 dark:text-teal-50 animate-spin">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>

type User = {
    username: string,
}

export default function Github() {
    const router = useRouter();
    const cookies = useCookies();
    const searchParams = useSearchParams()
    const encodedId = searchParams.get('id')

    const [user, setUser] = useState<User | null>(null)

    async function checkAuth(encodedId: string | null) {
        try {
            //console.log('Checking Auth...')
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
            else {
                if (encodedId === null) {
                    router.push('/login')
                }
                else{
                    await setCookies(encodedId)
                    router.push('/chat')
                }
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    // async function CheckAndSet(encodedId: string) {
    //     const decodedId = decodeURIComponent(encodedId);
    //     console.log('Setting Cookie...', user, encodedId)
    //     await setCookies(decodedId)
    //     checkAuth()
    // }

    useEffect(() => {
        async function EffectWork() {
            await checkAuth(encodedId)
            // if (encodedId !== null && user === null) {
            //     await CheckAndSet(encodedId)
            // }
        }
        EffectWork()
    }, [])

    return (<div className="w-full h-full flex items-center justify-center gap-2">
        {loadIcon}
        <h1 className="text-2xl text-slate-500 dark:text-teal-50 font-bold ">Loading...</h1>
    </div>)
}
