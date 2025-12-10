export type Division = "Women" | "Men" | "Girls" | "Boys" | "Non Binary";

export type ModelProfile = {
  id: string;
  name: string;
  slug: string;
  division: Division;
  boardUrl: string;
  polaroids: string[];
  editorials: string[];
  campaigns: string[];
  height?: string | null;
  bust?: string | null;
  waist?: string | null;
  hips?: string | null;
  shoes?: string | null;
  eyes?: string | null;
  hair?: string | null;
  city?: string | null;
};
