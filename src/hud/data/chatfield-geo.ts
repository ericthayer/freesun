import type { LatLon } from '../lib/geo';

/**
 * Stylized Chatfield State Park geography, traced from Esri World Imagery at zoom 13.
 * Good to a few hundred feet: a backdrop for the HUD, not a navigation chart.
 */

export const LAUNCH_SITE: LatLon = [39.5448, -105.0874];
export const FIELD_ELEV_FT = 5449;

export const RESERVOIR: readonly LatLon[] = [
  [39.5503, -105.0803], [39.5552, -105.0739], [39.5584, -105.0694], [39.5594, -105.0666],
  [39.558, -105.063], [39.5559, -105.0566], [39.5545, -105.0503], [39.5496, -105.0475],
  [39.544, -105.0466], [39.5422, -105.0489], [39.5433, -105.0539], [39.5454, -105.0594],
  [39.5458, -105.0621], [39.5426, -105.0666], [39.5384, -105.0721], [39.5328, -105.0735],
  [39.5272, -105.0748], [39.5215, -105.0775], [39.5205, -105.0839], [39.5251, -105.0871],
  [39.5321, -105.0875], [39.5384, -105.0871], [39.5426, -105.0857], [39.5468, -105.0821],
];

export interface LineFeature {
  name: string;
  kind: 'river' | 'road';
  points: readonly LatLon[];
  /** Index of the segment the label sits on. */
  labelAt?: number;
}

export const LINES: readonly LineFeature[] = [
  {
    name: 'South Platte River',
    kind: 'river',
    labelAt: 1,
    points: [[39.4724, -105.0885], [39.4921, -105.0894], [39.504, -105.0857], [39.5145, -105.083], [39.5205, -105.083]],
  },
  {
    name: 'South Platte River',
    kind: 'river',
    points: [[39.5552, -105.0485], [39.5665, -105.0439], [39.5763, -105.0403], [39.5882, -105.0375], [39.6015, -105.0357]],
  },
  {
    name: 'Plum Creek',
    kind: 'river',
    labelAt: 2,
    points: [[39.478, -104.9975], [39.5005, -105.0157], [39.518, -105.0294], [39.5321, -105.0394], [39.5398, -105.0448], [39.5426, -105.0485]],
  },
  {
    name: 'C-470',
    kind: 'road',
    labelAt: 6,
    points: [
      [39.5847, -105.1448], [39.5707, -105.1312], [39.5608, -105.1139], [39.5566, -105.0975], [39.5566, -105.0839],
      [39.5644, -105.0703], [39.5679, -105.0475], [39.5636, -105.0248], [39.5608, -104.9885],
    ],
  },
  { name: 'US 85', kind: 'road', labelAt: 1, points: [[39.5552, -105.043], [39.5251, -105.0248], [39.504, -105.0066], [39.4794, -104.9885]] },
  { name: 'Wadsworth Blvd', kind: 'road', labelAt: 0, points: [[39.5994, -105.0903], [39.5777, -105.0866], [39.558, -105.083]] },
];

/** Crest of the Dakota Hogback; the terrain model builds the foothills off this line. */
export const HOGBACK: readonly LatLon[] = [
  [39.5847, -105.1557], [39.551, -105.1339], [39.5251, -105.1157], [39.5005, -105.1021], [39.4794, -105.0921],
];

export interface PlaceLabel {
  name: string;
  at: LatLon;
  kind: 'water' | 'terrain' | 'town';
}

export const PLACES: readonly PlaceLabel[] = [
  { name: 'Chatfield Reservoir', at: [39.5515, -105.0625], kind: 'water' },
  { name: 'Dakota Hogback', at: [39.538, -105.1265], kind: 'terrain' },
  { name: 'Highlands Ranch', at: [39.538, -105.012], kind: 'town' },
  { name: 'Littleton', at: [39.585, -105.065], kind: 'town' },
  { name: 'Sterling Ranch', at: [39.511, -105.052], kind: 'town' },
];
