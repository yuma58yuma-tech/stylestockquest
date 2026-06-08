import { getClosetItems } from '@/lib/data';
import { ClosetClient } from './ClosetClient';

export default function ClosetPage() {
  const items = getClosetItems();
  return <ClosetClient items={items} />;
}
