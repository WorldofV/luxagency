const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const sourcePath = path.join(process.cwd(), "data/models-3m.json");
const targetPath = path.join(process.cwd(), "data/models-store.json");

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function run() {
  const raw = await fs.readFile(sourcePath, "utf-8");
  const parsed = JSON.parse(raw);
  const now = new Date().toISOString();

  const models = parsed.map((entry) => {
    const slug = slugify(entry.slug ?? entry.name ?? randomUUID());
    const polaroids = entry.polaroids ?? [];

    return {
      id: randomUUID(),
      slug,
      name: entry.name ?? "Unnamed",
      division: entry.division ?? "Unspecified",
      city: entry.city,
      height: entry.height,
      bust: entry.bust,
      waist: entry.waist,
      hips: entry.hips,
      shoes: entry.shoes,
      eyes: entry.eyes,
      hair: entry.hair,
      createdAt: now,
      updatedAt: now,
      images: polaroids.map((url, index) => ({
        id: randomUUID(),
        url,
        order: index * 10,
        createdAt: now,
      })),
    };
  });

  await fs.writeFile(
    targetPath,
    JSON.stringify({ models }, null, 2),
    "utf-8"
  );

  console.log(`Converted ${models.length} models to ${targetPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});


