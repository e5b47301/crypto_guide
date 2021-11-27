import React, {useState, useEffect} from 'react';

// yoinked from https://stackoverflow.com/a/48161723
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);                    

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function HashIt() {

  const [message, setMessage] = useState();
  const [hash, setHash] = useState();

  useEffect(() => {
    (async () => {
      const hashMsg = await sha256(message);
      setHash(hashMsg);
    })();
  }, [message]);

  return (<>
    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" />
    <p>Hash: {hash}</p>
  </>);

}