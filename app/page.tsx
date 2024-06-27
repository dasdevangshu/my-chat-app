'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [toUsername, setToUsername] = useState('')

  async function checkAuth() {
    console.log('Cookies: ', document.cookie)
    const prom = await fetch('http://localhost:4000', { credentials: 'include', cache: 'no-store' });
    const res = await prom.json()
    console.log('Got this res:', res)
  }

  async function sendLogIn() {
    const prom = await fetch('http://localhost:4000/login/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: 'include'
    });
    const res = await prom.json()
    console.log('Got this res:', res)
    
  }

  async function sendLogOut() {
    const prom = await fetch('http://localhost:4000/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    const res = await prom.json()
    console.log('Got this res:', res)
  }

  async function sendSignUp() {
    const prom = await fetch('http://localhost:4000/signup/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: 'include'
    });
    const res = await prom.json()
    console.log('Got this res:', res)
  }

  async function sendReq() {
    const prom = await fetch('http://localhost:4000/add-request/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toUsername,
      }),
      credentials: 'include'
    });
    const res = await prom.json()
    console.log('Got this res:', res)
  }

  return (
    <div className="mt-4 flex flex-col gap-2 mx-40">
      <button className="border" onClick={() => { checkAuth() }}>Check Auth</button>
      <button className="border" onClick={() => { router.push('http://localhost:4000/login/github') }}>SignIn Github</button>
      <h1>Username: {username}</h1>
      <input className="border" value={username} onChange={(e) => { setUsername(e.target.value) }} />
      <h1>Password: {password}</h1>
      <input className="border" value={password} onChange={(e) => { setPassword(e.target.value) }} />
      <button className="border" onClick={() => sendLogIn()}>LogIn</button>
      <button className="border" onClick={() => sendSignUp()}>SignUp</button>
      <button className="border" onClick={() => sendLogOut()}>LogOut</button>
      <h1>ToUsername: {toUsername}</h1>
      <input className="border" value={toUsername} onChange={(e) => { setToUsername(e.target.value) }} />
      <button className="border" onClick={() => sendReq()}>Send Request</button>
    </div>);
}