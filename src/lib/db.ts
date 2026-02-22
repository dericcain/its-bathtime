import Dexie, { type Table } from 'dexie';

export interface Kid {
  id: string;
  name: string;
  avatarBlob?: Blob;
  createdAt: number;
}

export interface Session {
  id: string;
  timestamp: number;
  kidOrder: string[]; // array of kid IDs
  luckyUsed: boolean;
  luckyByKidId?: string;
}

export interface AppState {
  id: string; // "singleton"
  rotationIndex: number;
  currentOrder?: string[];
  currentLuckyUsed?: boolean;
  currentLuckyByKidId?: string;
}

export class BathtimeDB extends Dexie {
  kids!: Table<Kid, string>;
  sessions!: Table<Session, string>;
  state!: Table<AppState, string>;

  constructor() {
    super('bathtimeDB');
    this.version(1).stores({
      kids: 'id, name, createdAt', // avatarBlob is not indexed
      sessions: 'id, timestamp',
      state: 'id' // we only store one record with id = "singleton"
    });
  }
}

export const db = new BathtimeDB();

// Initialize the singleton state if it doesn't exist
export async function initializeAppState() {
  const existing = await db.state.get('singleton');
  if (!existing) {
    await db.state.put({
      id: 'singleton',
      rotationIndex: 0,
      currentLuckyUsed: false
    });
  }
}
