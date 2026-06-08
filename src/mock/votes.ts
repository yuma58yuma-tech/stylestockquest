import type { VoteType } from '@/types';

export interface VoteRecord {
  coordinateId: string;
  voteType: VoteType;
  count: number;
}

export const MOCK_VOTES: VoteRecord[] = [
  // coord_01
  { coordinateId: 'coord_01', voteType: 'Cool',            count: 42 },
  { coordinateId: 'coord_01', voteType: 'Clean',           count: 38 },
  { coordinateId: 'coord_01', voteType: 'Street',          count: 27 },
  { coordinateId: 'coord_01', voteType: 'GoodColor',       count: 19 },
  { coordinateId: 'coord_01', voteType: 'BestFit',         count: 15 },

  // coord_02
  { coordinateId: 'coord_02', voteType: 'Vintage',         count: 55 },
  { coordinateId: 'coord_02', voteType: 'Unique',          count: 33 },
  { coordinateId: 'coord_02', voteType: 'ExpensiveLooking', count: 28 },
  { coordinateId: 'coord_02', voteType: 'WantToBuy',       count: 21 },

  // coord_03
  { coordinateId: 'coord_03', voteType: 'BestFit',         count: 61 },
  { coordinateId: 'coord_03', voteType: 'Clean',           count: 47 },
  { coordinateId: 'coord_03', voteType: 'GoodColor',       count: 30 },
  { coordinateId: 'coord_03', voteType: 'WantToBuy',       count: 18 },

  // coord_04
  { coordinateId: 'coord_04', voteType: 'Street',          count: 70 },
  { coordinateId: 'coord_04', voteType: 'Cool',            count: 52 },
  { coordinateId: 'coord_04', voteType: 'Unique',          count: 40 },

  // coord_05
  { coordinateId: 'coord_05', voteType: 'ExpensiveLooking', count: 80 },
  { coordinateId: 'coord_05', voteType: 'BestFit',         count: 65 },
  { coordinateId: 'coord_05', voteType: 'Clean',           count: 44 },
  { coordinateId: 'coord_05', voteType: 'GoodColor',       count: 32 },
];

export function getVotesForCoordinate(coordinateId: string): VoteRecord[] {
  return MOCK_VOTES.filter((v) => v.coordinateId === coordinateId);
}
