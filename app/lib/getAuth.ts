export default async function getAuth() {
    //console.log('Cookies:', document.cookie);
    const prom = await fetch('http://localhost:4000', {credentials: 'include'});  
    //console.log('Got this prom:', prom)
    const res = await prom.json()
    //console.log('Got this res:', res)
    return res;
}