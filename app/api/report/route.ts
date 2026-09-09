import { json } from '@/lib/server';
export async function POST() {
  return json(
    { error: 'Reports are now generated in your browser. Reload the calculator page.' },
    410,
  );
}
