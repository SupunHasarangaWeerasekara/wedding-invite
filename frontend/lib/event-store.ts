import fs from 'fs';
import path from 'path';
import { WeddingEvent, GalleryPhoto } from './types';
import { defaultEvent, sampleGallery } from './dummy-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'event-settings.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery-settings.json');

// Memory caches
let cachedEvent: WeddingEvent = { ...defaultEvent };
let cachedGallery: GalleryPhoto[] = [...sampleGallery];
let isInitialized = false;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data dir:', err);
  }
}

function initStore() {
  if (isInitialized) return;
  isInitialized = true;
  ensureDataDir();

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      cachedEvent = { ...defaultEvent, ...JSON.parse(data) };
    } else {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultEvent, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Error reading event settings file, using defaults:', err);
  }

  try {
    if (fs.existsSync(GALLERY_FILE)) {
      const data = fs.readFileSync(GALLERY_FILE, 'utf-8');
      cachedGallery = JSON.parse(data);
    } else {
      fs.writeFileSync(GALLERY_FILE, JSON.stringify(sampleGallery, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Error reading gallery settings file, using defaults:', err);
  }
}

export function getEventSettings(): WeddingEvent {
  initStore();
  return cachedEvent;
}

export function updateEventSettings(updates: Partial<WeddingEvent>): WeddingEvent {
  initStore();
  cachedEvent = { ...cachedEvent, ...updates };

  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(cachedEvent, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing event settings file:', err);
  }

  return cachedEvent;
}

export function getGallery(): GalleryPhoto[] {
  initStore();
  return cachedGallery;
}

export function updateGallery(photos: GalleryPhoto[]): GalleryPhoto[] {
  initStore();
  cachedGallery = [...photos];

  try {
    ensureDataDir();
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(cachedGallery, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing gallery settings file:', err);
  }

  return cachedGallery;
}
