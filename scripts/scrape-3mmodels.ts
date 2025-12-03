/* eslint-disable no-console */
import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

import type { Division, ModelProfile } from "../src/lib/models";

const BASE = "https://3mmodels.com";

const DIVISIONS: { key: Division; path: string }[] = [
  { key: "Women", path: "/models/women" },
  { key: "Men", path: "/models/men" },
  { key: "Girls", path: "/models/girls" },
  { key: "Boys", path: "/models/boys" },
  { key: "Non Binary", path: "/models/non binary" },
];

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed for ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function scrapeProfile(
  base: ModelProfile
): Promise<ModelProfile> {
  try {
    const html = await fetchHtml(base.boardUrl);
    const $ = cheerio.load(html);

    // Measurements table (Height, Bust, Waist, Hips, Shoes, Eye, Hair, Located, etc.)
    const statsRows = $(".model_profile tbody tr");
    const stats: Record<string, string> = {};

    statsRows.each((_, row) => {
      const label = $(row).find(".descr").text().trim().toLowerCase();
      const value = $(row).find(".value").text().trim();
      if (!label || !value) return;
      stats[label] = value;
    });

    const height = stats["height"];
    const bust = stats["bust"];
    const waist = stats["waist"];
    const hips = stats["hips"];
    const shoes = stats["shoes"];
    const eyes = stats["eye"] || stats["eyes"];
    const hair = stats["hair"];
    const city = stats["located"];

    // All portfolio images from the main slider
    const sliderImages = $("ul.model_slider li a img");
    const allImages = sliderImages
      .map((_, img) => {
        const src =
          $(img).attr("src") ||
          $(img).attr("data-original") ||
          $(img).attr("data-src") ||
          "";
        if (!src) return null;
        const absolute = src.startsWith("http") ? src : `${BASE}${src}`;
        return absolute.replace(/(?<!:)\/\//g, "/"); // normalize accidental double slashes
      })
      .get()
      .filter(Boolean);

    // For now treat all slider images as polaroids / portfolio images.
    const polaroids = allImages;
    const campaigns: string[] = [];

    return {
      ...base,
      height: height ?? base.height,
      bust: bust ?? base.bust,
      waist: waist ?? base.waist,
      hips: hips ?? base.hips,
      shoes: shoes ?? base.shoes,
      eyes: eyes ?? base.eyes,
      hair: hair ?? base.hair,
      city: city ?? base.city,
      polaroids: polaroids.length ? polaroids : base.polaroids,
      campaigns: campaigns.length ? campaigns : base.campaigns,
    };
  } catch (err) {
    console.error(`  ! Failed to enrich ${base.name} (${base.boardUrl})`, err);
    return base;
  }
}

async function scrapeDivision(div: Division, urlPath: string): Promise<ModelProfile[]> {
  const url = `${BASE}${urlPath}`;
  console.log(`Scraping ${div} from ${url}`);

  const html = await fetchHtml(url);

  // NOTE:
  // Inspect https://3mmodels.com/ HTML in your browser devtools
  // and update the selectors below to match the real DOM.

  const $ = cheerio.load(html);

  const cards = $(
    ".model-card, .thumb, .model, .item, .grid-item, .swiper-slide"
  );

  const bases: ModelProfile[] = [];

  cards.each((_, el) => {
    const link =
      $(el).find("a[href*='/model'], a[href*='/models'], a").first();
    const href = link.attr("href");
    if (!href) return;

    const nameEl =
      $(el).find(".name, .model-name, h3, h4").first() || link;
    const name = nameEl.text().trim() || "Unknown";

    const profileHref = href.startsWith("http") ? href : `${BASE}${href}`;
    const slug =
      profileHref
        .split("/")
        .filter(Boolean)
        .pop() ??
      name.toLowerCase().replace(/\s+/g, "-");

    bases.push({
      id: `${div.toLowerCase()}-${slug}`,
      name,
      division: div,
      slug,
      boardUrl: profileHref,
      polaroids: [],
      editorials: [],
      campaigns: [],
    });
  });

  console.log(`  → Found ${bases.length} profiles for ${div}`);

  // Enrich each base profile with details + photos.
  // To avoid hammering the site, you can limit or batch these calls
  // if needed.
  const enriched = await Promise.all(bases.map((b) => scrapeProfile(b)));
  return enriched;
}

async function main() {
  const all: ModelProfile[] = [];

  for (const { key, path: urlPath } of DIVISIONS) {
    try {
      const profiles = await scrapeDivision(key, urlPath);
      all.push(...profiles);
    } catch (err) {
      console.error(`Failed to scrape ${key}:`, err);
    }
  }

  const sanitized = all.map(({ boardUrl, ...rest }) => rest);
  const outPath = path.join(process.cwd(), "data", "models-3m.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(sanitized, null, 2), "utf8");

  console.log(`Saved ${sanitized.length} models to ${outPath}`);
}

// This script is meant to be run with: npm run scrape:3m
main().catch((err) => {
  console.error(err);
  process.exit(1);
});


