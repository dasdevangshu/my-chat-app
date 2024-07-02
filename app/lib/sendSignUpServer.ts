'use server'
import { cookies } from 'next/headers'

export async function sendSignUpServer(username: string, password: string) {

  try {
    //console.log('Username and password: ', username, password)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    console.log("got this", appUrl)
    const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup/credentials`, {
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

    //.log('Got this Cookie: s',sessionCookie)

    cookies().set(sessionCookie.name, sessionCookie.value, {...sessionCookie.attributes, httpOnly: false})

    return {signedUp: 'true', message: res.message}
  }
  catch (e: any) {
    return {signedUp: 'false', message: e.message}
  }
}



// async function sendSignUp() {
//     try{
//         const prom = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup/credentials`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 username: username,
//                 password: password,
//             }),
//             credentials: 'include'
//         });
//         if (!prom.ok) {
//             const errorResponse = await prom.json();
//             throw new Error(errorResponse.message || 'Request failed with status ' + prom.status);
//           }
//         const res = await prom.json()
//         router.push('/')
//         // console.log('Got this res:', res)
//     }
//     catch(e: any) {
//         setSignUpMessage(e.message)
//     }
// }