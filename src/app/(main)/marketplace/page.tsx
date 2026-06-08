import { getMarketplaceListings } from '@/lib/data';
import { MarketplaceClient } from './MarketplaceClient';

export default function MarketplacePage() {
  const listings = getMarketplaceListings();
  return <MarketplaceClient listings={listings} />;
}
