import { readFileSync, writeFileSync } from 'fs';

const COORD_PHOTOS = [
  'photo-1515886657613-9f3515b0c78f',
  'photo-1539109136881-3be0616acf4b',
  'photo-1552374196-1ab2a1c593e8',
  'photo-1529139574466-a303027c1d8b',
  'photo-1485968579580-b6d095142e6e',
  'photo-1496747611176-843222e1e57c',
  'photo-1469334031218-e382a71b716b',
  'photo-1445205170230-053b83016050',
  'photo-1509631179647-0177331693ae',
  'photo-1490481651871-ab68de25d43d',
  'photo-1483985988355-763728e1935b',
  'photo-1434389677669-e08b4cac3105',
  'photo-1558769132-cb1aea458c5e',
  'photo-1524638431109-93d95c968f03',
  'photo-1567401893414-76b7b1e5a7a5',
  'photo-1541101767792-f9b2b1c4f127',
  'photo-1618354691373-d851c5c3a990',
  'photo-1550614000-4895a10e1bfd',
  'photo-1591047139829-d91aecb6caea',
  'photo-1617127365659-c47fa864d8bc',
];

const AVATAR_PHOTOS = [
  'photo-1494790108377-be9c29b29330',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1438761681033-6461ffad8d80',
  'photo-1500648767791-00dcc994a43e',
  'photo-1544005313-94ddf0286df2',
  'photo-1531746020798-e6953c6e8e04',
  'photo-1506794778202-cad84cf45f1d',
  'photo-1534528741775-53994a69daeb',
  'photo-1517841905240-472988babdf9',
  'photo-1492562080023-ab3db95bfbce',
];

const ITEM_PHOTOS = [
  'photo-1542291026-7eec264c27ff',
  'photo-1542219550-37153d387c27',
  'photo-1503342394128-c104d54dba01',
  'photo-1591047139829-d91aecb6caea',
  'photo-1560769629-975ec94e6a86',
  'photo-1585386959984-a4155224a1ad',
  'photo-1556906781-9a412961a28d',
  'photo-1595950653106-6c9ebd614d3a',
  'photo-1547949003-9792a18a2601',
  'photo-1515347619252-60a4bf4fff4f',
  'photo-1564557287817-3785e38ec1f5',
  'photo-1600185365483-26d7a4cc7519',
  'photo-1549298916-b41d501d3772',
  'photo-1578932750294-f5075e85f44a',
  'photo-1608231387042-66d1773d3028',
];

const BASE = 'C:\Users\yuma5\stylestockquest\src\mock';

// coordinates.ts
let f = readFileSync(BASE + '\coordinates.ts', 'utf8');
for (let i = 0; i < COORD_PHOTOS.length; i++) {
  const n = String(i + 1).padStart(2, '0');
  f = f.replaceAll(
    `https://picsum.photos/seed/coord${n}/600/800`,
    `https://images.unsplash.com/${COORD_PHOTOS[i]}?w=600&h=800&fit=crop&auto=format`
  );
}
writeFileSync(BASE + '\coordinates.ts', f);
console.log('✓ coordinates.ts');

// users.ts
let u = readFileSync(BASE + '\users.ts', 'utf8');
for (let i = 0; i < AVATAR_PHOTOS.length; i++) {
  const n = String(i + 1).padStart(2, '0');
  u = u.replaceAll(
    `https://picsum.photos/seed/user${n}/200/200`,
    `https://images.unsplash.com/${AVATAR_PHOTOS[i]}?w=200&h=200&fit=crop&auto=format`
  );
}
writeFileSync(BASE + '\users.ts', u);
console.log('✓ users.ts');

// closet.ts
let c = readFileSync(BASE + '\closet.ts', 'utf8');
for (let i = 0; i < 15; i++) {
  const n = String(i + 1).padStart(2, '0');
  c = c.replaceAll(
    `https://picsum.photos/seed/cl_c${n}/400/400`,
    `https://images.unsplash.com/${ITEM_PHOTOS[i % ITEM_PHOTOS.length]}?w=400&h=400&fit=crop&auto=format`
  );
}
writeFileSync(BASE + '\closet.ts', c);
console.log('✓ closet.ts');

// marketplace.ts (makeClosetItemのimageurlはseedがcloset_01など)
let m = readFileSync(BASE + '\marketplace.ts', 'utf8');
// makeClosetItem の imageUrl は `https://picsum.photos/seed/${id}/400/400` で id = closet_01〜15
for (let i = 1; i <= 15; i++) {
  const pad = String(i).padStart(2, '0');
  m = m.replaceAll(
    `https://picsum.photos/seed/closet_${pad}/400/400`,
    `https://images.unsplash.com/${ITEM_PHOTOS[(i - 1) % ITEM_PHOTOS.length]}?w=400&h=400&fit=crop&auto=format`
  );
}
writeFileSync(BASE + '\marketplace.ts', m);
console.log('✓ marketplace.ts');
