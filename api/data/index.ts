import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Bridge, Inspection, Disease, Maintenance, Patrol, InspectionPlan, DisposalTask } from '../../src/types';
import { generateMockData } from './mockDataGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname);
const DATA_FILES = {
  bridges: path.join(DATA_DIR, 'bridges.json'),
  inspections: path.join(DATA_DIR, 'inspections.json'),
  diseases: path.join(DATA_DIR, 'diseases.json'),
  maintenances: path.join(DATA_DIR, 'maintenances.json'),
  patrols: path.join(DATA_DIR, 'patrols.json'),
  inspectionPlans: path.join(DATA_DIR, 'inspectionPlans.json'),
  disposalTasks: path.join(DATA_DIR, 'disposalTasks.json'),
};

let cache: {
  bridges: Bridge[];
  inspections: Inspection[];
  diseases: Disease[];
  maintenances: Maintenance[];
  patrols: Patrol[];
  inspectionPlans: InspectionPlan[];
  disposalTasks: DisposalTask[];
} | null = null;

function initData() {
  if (!fs.existsSync(DATA_FILES.bridges)) {
    const data = generateMockData();
    Object.entries(data).forEach(([key, value]) => {
      fs.writeFileSync(DATA_FILES[key as keyof typeof DATA_FILES], JSON.stringify(value, null, 2));
    });
  }
}

function readData<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T[];
}

function writeData<T>(filePath: string, data: T[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  cache = null;
}

export function loadAllData() {
  if (cache) return cache;
  initData();
  cache = {
    bridges: readData<Bridge>(DATA_FILES.bridges),
    inspections: readData<Inspection>(DATA_FILES.inspections),
    diseases: readData<Disease>(DATA_FILES.diseases),
    maintenances: readData<Maintenance>(DATA_FILES.maintenances),
    patrols: readData<Patrol>(DATA_FILES.patrols),
    inspectionPlans: readData<InspectionPlan>(DATA_FILES.inspectionPlans),
    disposalTasks: readData<DisposalTask>(DATA_FILES.disposalTasks),
  };
  return cache;
}

export function saveBridges(data: Bridge[]) {
  writeData(DATA_FILES.bridges, data);
}

export function saveInspections(data: Inspection[]) {
  writeData(DATA_FILES.inspections, data);
}

export function saveDiseases(data: Disease[]) {
  writeData(DATA_FILES.diseases, data);
}

export function saveMaintenances(data: Maintenance[]) {
  writeData(DATA_FILES.maintenances, data);
}

export function savePatrols(data: Patrol[]) {
  writeData(DATA_FILES.patrols, data);
}

export function saveInspectionPlans(data: InspectionPlan[]) {
  writeData(DATA_FILES.inspectionPlans, data);
}

export function saveDisposalTasks(data: DisposalTask[]) {
  writeData(DATA_FILES.disposalTasks, data);
}

export function regenerateMockData() {
  const data = generateMockData();
  saveBridges(data.bridges);
  saveInspections(data.inspections);
  saveDiseases(data.diseases);
  saveMaintenances(data.maintenances);
  savePatrols(data.patrols);
  saveInspectionPlans(data.inspectionPlans);
  saveDisposalTasks(data.disposalTasks);
  return data;
}
