import { json } from '@/lib/server';
export async function GET() {
  return json({ error: 'Database maintenance is no longer required.' }, 410);
}
export const POST = GET;
