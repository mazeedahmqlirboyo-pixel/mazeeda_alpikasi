import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    const res = await fetch('https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam');
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return json(data);
  } catch (err) {
    console.error('Server-side gold fetch error:', err);
    return json({ success: false, error: 'Failed to fetch gold price' }, { status: 500 });
  }
}
