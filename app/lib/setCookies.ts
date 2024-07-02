'use server'
import { cookies } from 'next/headers'

export async function setCookies(id: string) {

    //.log('Ran with', id)
    cookies().set('auth_session', id, {
        secure: false,
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 2592000
    })

}