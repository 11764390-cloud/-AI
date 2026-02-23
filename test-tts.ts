import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello' })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
