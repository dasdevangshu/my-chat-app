'use server'
import { cookies } from 'next/headers'

export async function deleteCookies() {
    cookies().delete('auth_session')
}