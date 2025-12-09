import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type ModelImage = {
  id: string;
  url: string;
  caption?: string;
  order: number;
  createdAt: string;
};

export type AgencyPlacement = {
  id: string;
  city: string;
  agencyName: string;
  startDate: string; // ISO date string
  createdAt: string;
};

export type ModelRecord = {
  id: string;
  slug: string;
  name: string;
  firstName?: string;
  lastName?: string;
  division: string;
  city?: string;
  nationality?: string;
  citizenship?: string;
  languages?: string;
  instagram?: string;
  modelsComUrl?: string;
  tiktok?: string;
  email?: string;
  phonePrefix?: string;
  phone?: string;
  whatsapp?: string;
  birthday?: string;
  height?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  shoes?: string;
  eyes?: string;
  hair?: string;
  experience?: string;
  travelAvailability?: string;
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  bookUpdatedAt?: string;
  hidden?: boolean;
  images: ModelImage[];
  agencyPlacements?: AgencyPlacement[];
};

type StoreShape = {
  models: ModelRecord[];
};

const STORE_PATH = path.join(process.cwd(), "data/models-store.json");
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

async function ensureUploadsDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as StoreShape;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { models: [] };
    }
    throw error;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

const sortImages = (images: ModelImage[]) =>
  [...images].sort((a, b) => {
    if (a.order === b.order) {
      return a.createdAt.localeCompare(b.createdAt);
    }
    return a.order - b.order;
  });

const sortModel = (model: ModelRecord): ModelRecord => ({
  ...model,
  images: sortImages(model.images ?? []),
});

const sanitizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function listModels(includeHidden = true): Promise<ModelRecord[]> {
  const store = await readStore();
  const models = store.models
    .map(sortModel)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  if (includeHidden) {
    return models;
  }
  
  return models.filter((model) => !model.hidden);
}

export async function getModelBySlug(slug: string, includeHidden = false) {
  const normalized = slug.toLowerCase();
  const store = await readStore();
  const match =
    store.models.find(
      (model) => model.slug.toLowerCase() === normalized && (includeHidden || !model.hidden)
    ) ??
    store.models.find((model) => {
      const parts = model.name.split(" ");
      return parts[parts.length - 1]?.toLowerCase() === normalized && (includeHidden || !model.hidden);
    });
  return match ? sortModel(match) : null;
}

export async function getModelById(id: string) {
  const store = await readStore();
  const model = store.models.find((m) => m.id === id);
  return model ? sortModel(model) : null;
}

type CreateModelInput = {
  name: string;
  firstName?: string;
  lastName?: string;
  division: string;
  slug?: string;
  city?: string;
  nationality?: string;
  citizenship?: string;
  languages?: string;
  instagram?: string;
  modelsComUrl?: string;
  tiktok?: string;
  email?: string;
  phonePrefix?: string;
  phone?: string;
  whatsapp?: string;
  birthday?: string;
  height?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  shoes?: string;
  eyes?: string;
  hair?: string;
  experience?: string;
  travelAvailability?: string;
  source?: string;
  notes?: string;
};

export async function createModel(input: CreateModelInput) {
  const store = await readStore();
  const baseSlug = sanitizeSlug(input.slug ?? input.name);
  let slug = baseSlug;
  let increment = 1;
  while (store.models.some((model) => model.slug === slug)) {
    slug = `${baseSlug}-${increment++}`;
  }

  const now = new Date().toISOString();
  const model: ModelRecord = {
    id: randomUUID(),
    slug,
    name: input.name,
    firstName: input.firstName,
    lastName: input.lastName,
    division: input.division,
    city: input.city,
    nationality: input.nationality,
    citizenship: input.citizenship,
    languages: input.languages,
    instagram: input.instagram,
    modelsComUrl: input.modelsComUrl,
    tiktok: input.tiktok,
    email: input.email,
    phonePrefix: input.phonePrefix,
    phone: input.phone,
    whatsapp: input.whatsapp,
    birthday: input.birthday,
    height: input.height,
    bust: input.bust,
    waist: input.waist,
    hips: input.hips,
    shoes: input.shoes,
    eyes: input.eyes,
    hair: input.hair,
    experience: input.experience,
    travelAvailability: input.travelAvailability,
    source: input.source,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    images: [],
    agencyPlacements: [],
    hidden: true, // Automatically hide models without images
  };

  store.models.push(model);
  await writeStore(store);
  return sortModel(model);
}

type UpdateModelInput = Partial<CreateModelInput>;

export async function updateModel(id: string, updates: UpdateModelInput) {
  const store = await readStore();
  const target = store.models.find((model) => model.id === id);

  if (!target) {
    return null;
  }

  if (updates.slug && updates.slug !== target.slug) {
    const newSlug = sanitizeSlug(updates.slug);
    if (
      store.models.some(
        (model) => model.slug === newSlug && model.id !== target.id
      )
    ) {
      throw new Error("Slug already exists");
    }
    target.slug = newSlug;
  }

  Object.assign(target, {
    name: updates.name ?? target.name,
    firstName: updates.firstName ?? target.firstName,
    lastName: updates.lastName ?? target.lastName,
    division: updates.division ?? target.division,
    city: updates.city ?? target.city,
    nationality: updates.nationality ?? target.nationality,
    citizenship: updates.citizenship ?? target.citizenship,
    languages: updates.languages ?? target.languages,
    instagram: updates.instagram ?? target.instagram,
    modelsComUrl: updates.modelsComUrl ?? target.modelsComUrl,
    tiktok: updates.tiktok ?? target.tiktok,
    email: updates.email ?? target.email,
    phonePrefix: updates.phonePrefix ?? target.phonePrefix,
    phone: updates.phone ?? target.phone,
    whatsapp: updates.whatsapp ?? target.whatsapp,
    birthday: updates.birthday ?? target.birthday,
    height: updates.height ?? target.height,
    bust: updates.bust ?? target.bust,
    waist: updates.waist ?? target.waist,
    hips: updates.hips ?? target.hips,
    shoes: updates.shoes ?? target.shoes,
    eyes: updates.eyes ?? target.eyes,
    hair: updates.hair ?? target.hair,
    experience: updates.experience ?? target.experience,
    travelAvailability: updates.travelAvailability ?? target.travelAvailability,
    source: updates.source ?? target.source,
    notes: updates.notes ?? target.notes,
    hidden: updates.hidden !== undefined ? updates.hidden : target.hidden,
  });

  target.updatedAt = new Date().toISOString();

  await writeStore(store);
  return sortModel(target);
}

const isLocalUpload = (url: string) => url.startsWith("/uploads/");

export async function deleteModel(id: string) {
  const store = await readStore();
  const index = store.models.findIndex((model) => model.id === id);
  if (index === -1) {
    return null;
  }

  const [removed] = store.models.splice(index, 1);

  await writeStore(store);

  const localImages = removed.images.filter((image) =>
    isLocalUpload(image.url)
  );

  await ensureUploadsDir();
  await Promise.all(
    localImages.map(async (image) => {
      const relativePath = image.url.replace(/^\/+/, "");
      const absolutePath = path.join(process.cwd(), "public", relativePath);
      try {
        await fs.unlink(absolutePath);
      } catch (error: any) {
        if (error?.code !== "ENOENT") {
          console.warn("Failed to delete file", absolutePath);
        }
      }
    })
  );

  return removed;
}

type AddImageInput = {
  url: string;
  caption?: string;
  order?: number;
};

export async function addModelImage(modelId: string, payload: AddImageInput) {
  const store = await readStore();
  const model = store.models.find((entry) => entry.id === modelId);
  if (!model) {
    throw new Error("Model not found");
  }

  const maxOrder =
    model.images.reduce((max, image) => Math.max(max, image.order), 0) || 0;
  const nextOrder =
    typeof payload.order === "number" ? payload.order : maxOrder + 10;

  const image: ModelImage = {
    id: randomUUID(),
    url: payload.url,
    caption: payload.caption,
    order: nextOrder,
    createdAt: new Date().toISOString(),
  };

  model.images.push(image);
  model.images = sortImages(model.images);
  const now = new Date().toISOString();
  model.updatedAt = now;
  model.bookUpdatedAt = now;

  await writeStore(store);
  return image;
}

type ReorderInput = Array<{
  id: string;
  order: number;
}>;

export async function reorderImages(modelId: string, updates: ReorderInput) {
  const store = await readStore();
  const model = store.models.find((entry) => entry.id === modelId);
  if (!model) throw new Error("Model not found");

  const orderMap = new Map(updates.map((item) => [item.id, item.order]));
  model.images = model.images.map((image) =>
    orderMap.has(image.id)
      ? { ...image, order: orderMap.get(image.id)! }
      : image
  );
  model.images = sortImages(model.images);
  const now = new Date().toISOString();
  model.updatedAt = now;
  model.bookUpdatedAt = now;

  await writeStore(store);
  return sortModel(model);
}

export async function deleteImage(imageId: string) {
  const store = await readStore();
  for (const model of store.models) {
    const index = model.images.findIndex((image) => image.id === imageId);
    if (index !== -1) {
      const [removed] = model.images.splice(index, 1);
      const now = new Date().toISOString();
      model.updatedAt = now;
      model.bookUpdatedAt = now;
      
      // Automatically hide model if all images are deleted
      if (model.images.length === 0) {
        model.hidden = true;
      }
      
      await writeStore(store);

      if (isLocalUpload(removed.url)) {
        const relativePath = removed.url.replace(/^\/+/, "");
        const absolutePath = path.join(process.cwd(), "public", relativePath);
        try {
          await fs.unlink(absolutePath);
        } catch (error: any) {
          if (error?.code !== "ENOENT") {
            console.warn("Failed to delete file", absolutePath);
          }
        }
      }
      return { removed, model: sortModel(model) };
    }
  }
  return null;
}

export async function addAgencyPlacement(
  modelId: string,
  placement: Omit<AgencyPlacement, "id" | "createdAt">
) {
  const store = await readStore();
  const model = store.models.find((m) => m.id === modelId);
  if (!model) {
    throw new Error("Model not found");
  }

  if (!model.agencyPlacements) {
    model.agencyPlacements = [];
  }

  const newPlacement: AgencyPlacement = {
    id: randomUUID(),
    ...placement,
    createdAt: new Date().toISOString(),
  };

  model.agencyPlacements.push(newPlacement);
  model.updatedAt = new Date().toISOString();
  await writeStore(store);
  return sortModel(model);
}

export async function updateAgencyPlacement(
  modelId: string,
  placementId: string,
  updates: Partial<Omit<AgencyPlacement, "id" | "createdAt">>
) {
  const store = await readStore();
  const model = store.models.find((m) => m.id === modelId);
  if (!model || !model.agencyPlacements) {
    throw new Error("Model or placement not found");
  }

  const placement = model.agencyPlacements.find((p) => p.id === placementId);
  if (!placement) {
    throw new Error("Placement not found");
  }

  Object.assign(placement, updates);
  model.updatedAt = new Date().toISOString();
  await writeStore(store);
  return sortModel(model);
}

export async function deleteAgencyPlacement(modelId: string, placementId: string) {
  const store = await readStore();
  const model = store.models.find((m) => m.id === modelId);
  if (!model || !model.agencyPlacements) {
    throw new Error("Model or placement not found");
  }

  const index = model.agencyPlacements.findIndex((p) => p.id === placementId);
  if (index === -1) {
    throw new Error("Placement not found");
  }

  model.agencyPlacements.splice(index, 1);
  model.updatedAt = new Date().toISOString();
  await writeStore(store);
  return sortModel(model);
}


