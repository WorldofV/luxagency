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

export type ModelRecord = {
  id: string;
  slug: string;
  name: string;
  division: string;
  city?: string;
  citizenship?: string;
  instagram?: string;
  modelsComUrl?: string;
  email?: string;
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
  createdAt: string;
  updatedAt: string;
  images: ModelImage[];
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

export async function listModels(): Promise<ModelRecord[]> {
  const store = await readStore();
  return store.models
    .map(sortModel)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getModelBySlug(slug: string) {
  const normalized = slug.toLowerCase();
  const store = await readStore();
  const match =
    store.models.find(
      (model) => model.slug.toLowerCase() === normalized
    ) ??
    store.models.find((model) => {
      const parts = model.name.split(" ");
      return parts[parts.length - 1]?.toLowerCase() === normalized;
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
  division: string;
  slug?: string;
  city?: string;
  citizenship?: string;
  instagram?: string;
  modelsComUrl?: string;
  email?: string;
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
    division: input.division,
    city: input.city,
    citizenship: input.citizenship,
    instagram: input.instagram,
    modelsComUrl: input.modelsComUrl,
    email: input.email,
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
    createdAt: now,
    updatedAt: now,
    images: [],
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
    division: updates.division ?? target.division,
    city: updates.city ?? target.city,
    citizenship: updates.citizenship ?? target.citizenship,
    instagram: updates.instagram ?? target.instagram,
    modelsComUrl: updates.modelsComUrl ?? target.modelsComUrl,
    email: updates.email ?? target.email,
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
  model.updatedAt = new Date().toISOString();

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
  model.updatedAt = new Date().toISOString();

  await writeStore(store);
  return sortModel(model);
}

export async function deleteImage(imageId: string) {
  const store = await readStore();
  for (const model of store.models) {
    const index = model.images.findIndex((image) => image.id === imageId);
    if (index !== -1) {
      const [removed] = model.images.splice(index, 1);
      model.updatedAt = new Date().toISOString();
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
      return removed;
    }
  }
  return null;
}


