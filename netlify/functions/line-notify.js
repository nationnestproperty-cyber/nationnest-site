export default async (request, context) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const body = await request.json().catch(()=>({}));
  const token = process.env.LINE_NOTIFY_TOKEN;
  if(!token) return new Response('LINE token missing', { status: 500 });
  const params = new URLSearchParams();
  params.append('message', body.message || 'New event');
  if(body.url) params.append('message', `\nURL: ${body.url}`);
  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: { 'Authorization':`Bearer ${token}`, 'Content-Type':'application/x-www-form-urlencoded' },
    body: params
  });
  return new Response(await res.text(), { status: res.status });
};