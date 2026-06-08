import { getClosetItems } from '@/lib/data';
import { ClosetClient } from './ClosetClient';

export default async function ClosetPage() {
  const items = await getClosetItems();
  return <ClosetClient items={items} />;
}
