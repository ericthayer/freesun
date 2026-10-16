/** Where a tile's data came from. Rendered as a provenance chip on every tile. */
export type DataSource =
  | { kind: 'live'; label: string; fetchedAt: string }
  | { kind: 'snapshot'; label: string; capturedAt: string }
  | { kind: 'example'; label: string };

export interface Sourced<T> {
  value: T;
  source: DataSource;
}

export type CrewRole = 'Pilot' | 'Ground Crew';
export type Availability = 'available' | 'busy' | 'unavailable';

export interface CrewMember {
  name: string;
  role: CrewRole;
  experienceYears: number;
  flights: number;
  specialty: string;
  bio: string;
  /** Only set for photos hosted in the club's own storage; stock photos are dropped. */
  photoUrl: string | null;
  availability: Availability;
}

export interface Balloon {
  name: string;
  type: string;
  volume: string;
  capacity: string;
  burner: string;
  status: 'active' | 'retired' | 'maintenance';
  description: string;
}

export interface ScheduleItem {
  title: string;
  kind: 'flight' | 'event';
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** 24h local time, HH:mm, when known */
  time: string | null;
  location: string;
  description: string;
}

export interface FlightLog {
  logNumber: string;
  date: string;
  durationMinutes: number;
  site: string;
  notes: string;
  status: string;
}

export interface WeatherHour {
  time: string;
  windMph: number;
  gustMph: number;
  tempF: number;
}

export interface WeatherReport {
  observedAt: string;
  tempF: number;
  humidity: number;
  windMph: number;
  gustMph: number;
  windDirDeg: number;
  cloudCover: number;
  weatherCode: number;
  elevationM: number;
  sunrise: string;
  sunset: string;
  nextSunrise: string;
  hours: WeatherHour[];
}

export interface HistoryEvent {
  when: string;
  title: string;
  detail: string;
}

export interface ChatMessage {
  author: string;
  time: string;
  text: string;
  mine?: boolean;
}

export interface BaconSummary {
  goalLb: number;
  totalLb: number;
  crewTags: string[];
  trackerUrl: string;
}

export interface DashboardData {
  crew: Sourced<CrewMember[]>;
  fleet: Sourced<Balloon[]>;
  schedule: Sourced<ScheduleItem[]>;
  logs: Sourced<FlightLog[]>;
  weather: Sourced<WeatherReport>;
  history: Sourced<HistoryEvent[]>;
  chat: Sourced<ChatMessage[]>;
  bacon: Sourced<BaconSummary>;
}

export type DashboardKey = keyof DashboardData;
