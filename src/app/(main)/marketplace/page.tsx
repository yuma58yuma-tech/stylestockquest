import { getMarketplaceListings } from '@/lib/data';
import { MarketplaceClient } from './MarketplaceClient';

export default async function MarketplacePage() {
  const listings = await getMarketplaceListings();
  return <MarketplaceClient listings={listings} />;
}
