import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type PackageRecord = {
  id: string;
  slug: string; // Unique identifier for the package link
  modelIds: string[]; // Array of model IDs in the package
  clientName?: string;
  clientEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  openedAt?: string; // When the package was first opened
  lastOpenedAt?: string; // When the package was last opened
  opened: boolean; // Whether the package has been opened
  openedCount: number; // Number of times the package has been opened
};

type StoreShape = {
  packages: PackageRecord[];
};

const STORE_PATH = path.join(process.cwd(), "data/packages-store.json");

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const store = JSON.parse(raw) as StoreShape;
    // Migrate existing packages to include openedCount and lastOpenedAt
    let needsMigration = false;
    for (const pkg of store.packages) {
      if (typeof (pkg as any).openedCount === "undefined") {
        (pkg as any).openedCount = pkg.opened ? 1 : 0;
        needsMigration = true;
      }
      if (pkg.opened && !(pkg as any).lastOpenedAt && pkg.openedAt) {
        (pkg as any).lastOpenedAt = pkg.openedAt;
        needsMigration = true;
      }
    }
    if (needsMigration) {
      await writeStore(store);
    }
    return store;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { packages: [] };
    }
    throw error;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

const sanitizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Generate a unique slug for packages
function generateUniqueSlug(store: StoreShape): string {
  const baseSlug = `package-${Date.now()}`;
  let slug = baseSlug;
  let increment = 1;
  while (store.packages.some((pkg) => pkg.slug === slug)) {
    slug = `${baseSlug}-${increment++}`;
  }
  return slug;
}

export async function listPackages() {
  const store = await readStore();
  return store.packages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPackageById(id: string) {
  const store = await readStore();
  return store.packages.find((pkg) => pkg.id === id) ?? null;
}

export async function getPackageBySlug(slug: string) {
  const store = await readStore();
  return store.packages.find((pkg) => pkg.slug === slug) ?? null;
}

type CreatePackageInput = {
  modelIds: string[];
  clientName?: string;
  clientEmail?: string;
  notes?: string;
  slug?: string;
};

export async function createPackage(input: CreatePackageInput) {
  const store = await readStore();
  
  if (!input.modelIds || input.modelIds.length === 0) {
    throw new Error("At least one model ID is required");
  }

  const slug = input.slug 
    ? sanitizeSlug(input.slug)
    : generateUniqueSlug(store);

  // Ensure slug is unique
  let finalSlug = slug;
  let increment = 1;
  while (store.packages.some((pkg) => pkg.slug === finalSlug)) {
    finalSlug = `${slug}-${increment++}`;
  }

  const now = new Date().toISOString();
  const packageRecord: PackageRecord = {
    id: randomUUID(),
    slug: finalSlug,
    modelIds: input.modelIds,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    opened: false,
    openedCount: 0,
  };

  store.packages.push(packageRecord);
  await writeStore(store);
  return packageRecord;
}

type UpdatePackageInput = {
  modelIds?: string[];
  clientName?: string;
  clientEmail?: string;
  notes?: string;
};

export async function updatePackage(id: string, updates: UpdatePackageInput) {
  const store = await readStore();
  const packageRecord = store.packages.find((pkg) => pkg.id === id);

  if (!packageRecord) {
    return null;
  }

  if (updates.modelIds !== undefined) {
    if (updates.modelIds.length === 0) {
      throw new Error("At least one model ID is required");
    }
    packageRecord.modelIds = updates.modelIds;
  }

  if (updates.clientName !== undefined) {
    packageRecord.clientName = updates.clientName;
  }

  if (updates.clientEmail !== undefined) {
    packageRecord.clientEmail = updates.clientEmail;
  }

  if (updates.notes !== undefined) {
    packageRecord.notes = updates.notes;
  }

  packageRecord.updatedAt = new Date().toISOString();
  await writeStore(store);
  return packageRecord;
}

export async function markPackageAsOpened(id: string) {
  const store = await readStore();
  const packageRecord = store.packages.find((pkg) => pkg.id === id);

  if (!packageRecord) {
    return null;
  }

  const now = new Date().toISOString();
  
  // Increment opened count
  packageRecord.openedCount = (packageRecord.openedCount || 0) + 1;

  // Only mark as opened if it hasn't been opened before
  if (!packageRecord.opened) {
    packageRecord.opened = true;
    packageRecord.openedAt = now;
  }
  
  // Always update last opened time
  packageRecord.lastOpenedAt = now;
  packageRecord.updatedAt = now;
  await writeStore(store);

  return packageRecord;
}

export async function markPackageAsOpenedBySlug(slug: string) {
  const store = await readStore();
  const packageRecord = store.packages.find((pkg) => pkg.slug === slug);

  if (!packageRecord) {
    return null;
  }

  const now = new Date().toISOString();
  
  // Increment opened count
  packageRecord.openedCount = (packageRecord.openedCount || 0) + 1;

  // Only mark as opened if it hasn't been opened before
  if (!packageRecord.opened) {
    packageRecord.opened = true;
    packageRecord.openedAt = now;
  }
  
  // Always update last opened time
  packageRecord.lastOpenedAt = now;
  packageRecord.updatedAt = now;
  await writeStore(store);

  return packageRecord;
}

export async function deletePackage(id: string) {
  const store = await readStore();
  const index = store.packages.findIndex((pkg) => pkg.id === id);
  
  if (index === -1) {
    return null;
  }

  const [removed] = store.packages.splice(index, 1);
  await writeStore(store);
  return removed;
}

