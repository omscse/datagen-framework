import { Pack, type DataGenerationPack } from '../../framework/core/index.js';
import type { Address } from '../models/address.js';

const STREETS  = ['Main St', 'Oak Ave', 'Maple Rd', 'Cedar Blvd', 'Elm Way', 'Park Lane'];
const CITIES   = ['Austin', 'Portland', 'Denver', 'Chicago', 'Seattle', 'Boston', 'Atlanta'];
const STATES   = ['TX', 'OR', 'CO', 'IL', 'WA', 'MA', 'GA'];
const ZIPS     = ['73301', '97201', '80201', '60601', '98101', '02101', '30301'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildAddress(): Address {
  const cityIndex = rand(0, CITIES.length - 1);
  return {
    id:      `addr-${uid()}`,
    street:  `${rand(1, 9999)} ${pick(STREETS)}`,
    city:    CITIES[cityIndex],
    state:   STATES[cityIndex],
    zip:     ZIPS[cityIndex],
    country: 'US',
  };
}

@Pack({ name: 'address', description: 'Generates US address test data with consistent city/state/zip' })
export class AddressPack implements DataGenerationPack<Address> {
  async createDefault(): Promise<Address> {
    return buildAddress();
  }

  async delete(_data: Address): Promise<void> {
    // no-op: in-memory generated data, nothing to clean up
  }
}
