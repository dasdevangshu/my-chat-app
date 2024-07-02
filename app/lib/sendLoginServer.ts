'use server'
import { cookies } from 'next/headers'

export async function sendLogInServer(username: string, password: string) {

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    console.log("got this", appUrl)
    //console.log('Username and password: ', username, password)
    const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login/credentials`, {
      method: 'POST',
      headers: {
        'Origin': appUrl,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: 'include'
    });

    if (!prom.ok) {
      const errorResponse = await prom.json();
      throw new Error(errorResponse.message || 'Request failed with status ' + prom.status);
    }

    const res = await prom.json()
    const sessionCookie = res.cookie
    //console.log('Got this Cookie: s',sessionCookie)

    cookies().set(sessionCookie.name, sessionCookie.value, {...sessionCookie.attributes, httpOnly: false})

    return {loggedIn: 'true', message: res.message}
  }
  catch (e: any) {
    return {loggedIn: 'false', message: e.message}
  }
}