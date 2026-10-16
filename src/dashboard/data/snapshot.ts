import type { DashboardData } from './types';

/**
 * Bundled fallback data. Crew, fleet, schedule and log rows were captured from the
 * club's public site backend (rockymountainfly.com); history comes from the
 * Chatfield Balloon Port history poster. Live sources replace these at runtime
 * when the network allows (see sources.ts).
 */
const CAPTURED_AT = '2026-10-16T17:15:00-06:00';
const SITE = 'rockymountainfly.com';

export const BACON_TRACKER_URL = 'https://claude.ai/artifact/CodWhe9W1w5o6oABCRXuZ1';

export const CHATFIELD = {
  name: 'Chatfield State Park',
  field: 'Montgolfier Balloon Port',
  lat: 39.5448,
  lon: -105.0874,
  timezone: 'America/Denver',
} as const;

export const snapshot: DashboardData = {
  crew: {
    source: { kind: 'snapshot', label: SITE, capturedAt: CAPTURED_AT },
    value: [
      {
        name: 'Doug Lorenz',
        role: 'Pilot',
        experienceYears: 46,
        flights: 2800,
        specialty: 'Pilot in Charge, Emergency Recovery',
        bio: 'A master of the mountain winds, David has navigated nearly every peak in the Rockies and leads our safety training seminars.',
        photoUrl: null,
        availability: 'available',
      },
      {
        name: 'Josh Dalbey',
        role: 'Pilot',
        experienceYears: 5,
        flights: 0,
        specialty: 'Pilot Track',
        bio: 'New crew member',
        photoUrl: null,
        availability: 'available',
      },
      {
        name: 'Eric Thayer',
        role: 'Ground Crew',
        experienceYears: 5,
        flights: 315,
        specialty: 'System Administration',
        bio: 'Eric is the system administrator and Super Admin for the FreeSun Hot Air Ballooning Club, managing user accounts and system operations.',
        photoUrl: null,
        availability: 'available',
      },
      {
        name: 'Andy Crabb',
        role: 'Ground Crew',
        experienceYears: 5,
        flights: 0,
        specialty: 'Ground Crew',
        bio: 'New crew member',
        photoUrl: null,
        availability: 'busy',
      },
      {
        name: 'Eric Michael',
        role: 'Ground Crew',
        experienceYears: 3,
        flights: 0,
        specialty: '',
        bio: '',
        photoUrl: null,
        availability: 'available',
      },
    ],
  },
  fleet: {
    source: { kind: 'snapshot', label: SITE, capturedAt: CAPTURED_AT },
    value: [
      {
        name: 'Free Sun',
        type: 'Firefly',
        volume: '425k cu ft',
        capacity: '3 Pax',
        burner: 'PowerPlus',
        status: 'active',
        description: 'The giant of the Rockies. Reserved for special events and large corporate gatherings.',
      },
      {
        name: 'Free Reason',
        type: 'Firefly',
        volume: '250k cu ft',
        capacity: '3 Pax',
        burner: 'Quad-Shadow',
        status: 'retired',
        description: 'Our flagship vessel for group flights. Known for its incredible stability and vibrant sunburst pattern.',
      },
    ],
  },
  schedule: {
    source: { kind: 'snapshot', label: SITE, capturedAt: CAPTURED_AT },
    value: [
      {
        title: 'Chatfield sunrise flight',
        kind: 'flight',
        date: '2026-02-15',
        time: '06:30',
        location: 'Montgolfier',
        description: 'Early morning sunrise flight over Chatfield. Launch from Montgolfier field. Expected flight duration 1.5 hours.',
      },
      {
        title: 'Rockies Safety Summit',
        kind: 'event',
        date: '2026-02-05',
        time: null,
        location: 'Littleton hangar',
        description: 'A full day of lectures from industry leaders on high-altitude recovery techniques.',
      },
      {
        title: 'Vintage Hangar Soiree',
        kind: 'event',
        date: '2026-01-15',
        time: null,
        location: 'Littleton hangar',
        description: 'Cocktails and jazz among restored 19th-century ballooning artifacts.',
      },
    ],
  },
  logs: {
    source: { kind: 'snapshot', label: SITE, capturedAt: CAPTURED_AT },
    value: [
      { logNumber: '841', date: '2024-05-24', durationMinutes: 105, site: 'Land Site Delta', notes: 'Smooth landing, light crosswinds on approach.', status: 'SIGNED OFF' },
      { logNumber: '840', date: '2024-05-23', durationMinutes: 80, site: 'Valley Creek', notes: 'Excellent visibility. Passengers enjoyed the vineyard tour.', status: 'SIGNED OFF' },
    ],
  },
  weather: {
    source: { kind: 'snapshot', label: 'Open-Meteo', capturedAt: CAPTURED_AT },
    value: {
      observedAt: '2026-10-16T17:15',
      tempF: 54.4,
      humidity: 41,
      windMph: 4.3,
      gustMph: 5.4,
      windDirDeg: 339,
      cloudCover: 0,
      weatherCode: 0,
      elevationM: 1661,
      sunrise: '2026-10-16T07:11',
      sunset: '2026-10-16T18:19',
      nextSunrise: '2026-10-17T07:12',
      hours: [
        ['2026-10-17T05:00', 5.2, 10.1, 37.3], ['2026-10-17T06:00', 7.6, 11.6, 37.4],
        ['2026-10-17T07:00', 7.9, 11.6, 37.5], ['2026-10-17T08:00', 7.4, 11.0, 39.2],
        ['2026-10-17T09:00', 6.0, 8.9, 46.1], ['2026-10-17T10:00', 3.5, 7.4, 55.1],
        ['2026-10-17T11:00', 1.4, 6.0, 62.4], ['2026-10-17T12:00', 2.2, 6.7, 66.7],
      ].map(([time, windMph, gustMph, tempF]) => ({
        time: time as string,
        windMph: windMph as number,
        gustMph: gustMph as number,
        tempF: tempF as number,
      })),
    },
  },
  history: {
    source: { kind: 'snapshot', label: 'Club site + Balloon Port poster', capturedAt: CAPTURED_AT },
    value: [
      { when: '1978', title: 'FreeSun takes off', detail: 'A small circle of friends and a single envelope start chasing Colorado sunrises.' },
      { when: '1983', title: 'Montgolfier launch site', detail: 'The Chatfield launch site is dedicated to 200 years of manned flight, 1783 to 1983.' },
      { when: 'Jul 23, 1989', title: 'Balloon Port dedicated', detail: 'About 15 balloons, pilots and families celebrate after eight years of fundraising and hands-on building.' },
      { when: '2000–2008', title: 'Rocky Mountain Balloon Festival', detail: 'Nine festivals at Chatfield, with up to 70 balloons launching over the reservoir.' },
      { when: 'May 19, 2018', title: 'Reopened, raised for flood protection', detail: 'The launch area returns after the Chatfield Storage Reallocation Project.' },
    ],
  },
  chat: {
    source: { kind: 'example', label: 'WhatsApp not connected' },
    value: [
      { author: 'Pilot', time: '05:02', text: 'Winds look light at the port. Meet at the gate 5:45, envelope out by 6:15.' },
      { author: 'Chase lead', time: '05:06', text: 'Truck is fueled. Bringing the long tie-down and extra radios.' },
      { author: 'Crew', time: '05:09', text: 'Coffee duty covered. Who is on bacon this round?', mine: true },
      { author: 'Pilot', time: '05:11', text: 'Log it in the tracker this time, the meter is still at zero.' },
    ],
  },
  bacon: {
    source: { kind: 'snapshot', label: 'Bacon Tracker', capturedAt: CAPTURED_AT },
    value: { goalLb: 100, totalLb: 0, crewTags: ['Oinker', 'Eric', 'Flynn'], trackerUrl: BACON_TRACKER_URL },
  },
};
