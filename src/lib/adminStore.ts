import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const STORE_PATH = path.join(process.cwd(), "data", "admins-store.json");

export type AdminRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin";
  createdAt: string;
  updatedAt: string;
};

type StoreShape = {
  admins: AdminRecord[];
};

const SUPER_ADMINS = ["americo@3mmodels.com", "irsida@3mmodels.com"];

// Default passwords for super admins (will be hashed on first run)
const SUPER_ADMIN_PASSWORDS: Record<string, string> = {
  "americo@3mmodels.com": "Americo85@@",
  "irsida@3mmodels.com": "Americo85@@",
};

async function readStore(): Promise<StoreShape> {
  try {
    const data = await fs.readFile(STORE_PATH, "utf-8");
    const store = JSON.parse(data) as StoreShape;
    
    // Migration: ensure super admins exist and have passwords
    let needsMigration = false;
    for (const superAdminEmail of SUPER_ADMINS) {
      const existingAdmin = store.admins.find((admin) => admin.email === superAdminEmail);
      if (!existingAdmin) {
        const now = new Date().toISOString();
        const defaultPassword = SUPER_ADMIN_PASSWORDS[superAdminEmail] || "";
        const passwordHash = defaultPassword ? await bcrypt.hash(defaultPassword, 10) : "";
        store.admins.push({
          id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: superAdminEmail,
          passwordHash,
          role: "super_admin",
          createdAt: now,
          updatedAt: now,
        });
        needsMigration = true;
      } else {
        // Ensure existing super admins have the correct role
        if (existingAdmin.role !== "super_admin") {
          existingAdmin.role = "super_admin";
          existingAdmin.updatedAt = new Date().toISOString();
          needsMigration = true;
        }
        // Migrate: add password hash if missing or empty
        if (!existingAdmin.passwordHash || existingAdmin.passwordHash === "") {
          const defaultPassword = SUPER_ADMIN_PASSWORDS[superAdminEmail] || "";
          if (defaultPassword) {
            existingAdmin.passwordHash = await bcrypt.hash(defaultPassword, 10);
            existingAdmin.updatedAt = new Date().toISOString();
            needsMigration = true;
          }
        }
      }
    }
    
    // Migration: ensure all admins have passwordHash
    for (const admin of store.admins) {
      if (!admin.passwordHash) {
        admin.passwordHash = "";
        admin.updatedAt = new Date().toISOString();
        needsMigration = true;
      }
    }
    
    if (needsMigration) {
      await writeStore(store);
    }
    
    return store;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File doesn't exist, create it with super admins
      const now = new Date().toISOString();
      const admins = await Promise.all(
        SUPER_ADMINS.map(async (email) => {
          const defaultPassword = SUPER_ADMIN_PASSWORDS[email] || "";
          const passwordHash = defaultPassword ? await bcrypt.hash(defaultPassword, 10) : "";
          return {
            id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email,
            passwordHash,
            role: "super_admin" as const,
            createdAt: now,
            updatedAt: now,
          };
        })
      );
      const initialStore: StoreShape = { admins };
      await writeStore(initialStore);
      return initialStore;
    }
    throw error;
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getAllAdmins(): Promise<Omit<AdminRecord, "passwordHash">[]> {
  const store = await readStore();
  return store.admins.map(({ passwordHash, ...admin }) => admin);
}

export async function getAdminByEmail(email: string): Promise<AdminRecord | null> {
  const store = await readStore();
  return store.admins.find((admin) => admin.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function isSuperAdmin(email: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  return admin?.role === "super_admin" || SUPER_ADMINS.includes(email.toLowerCase());
}

export async function isAdmin(email: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  return admin !== null || SUPER_ADMINS.includes(email.toLowerCase());
}

export async function createAdmin(
  email: string,
  password: string,
  role: "admin" | "super_admin" = "admin"
): Promise<AdminRecord> {
  const store = await readStore();
  
  // Check if admin already exists
  const existing = store.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("Admin with this email already exists");
  }
  
  // Super admins cannot be created through this function
  if (SUPER_ADMINS.includes(email.toLowerCase())) {
    throw new Error("Super admins cannot be created or modified");
  }
  
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const newAdmin: AdminRecord = {
    id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  };
  
  store.admins.push(newAdmin);
  await writeStore(store);
  return newAdmin;
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  if (!admin) {
    return false;
  }
  
  if (!admin.passwordHash) {
    return false;
  }
  
  return await bcrypt.compare(password, admin.passwordHash);
}

export async function updateAdmin(
  id: string,
  updates: { email?: string; password?: string; role?: "admin" | "super_admin" }
): Promise<AdminRecord> {
  const store = await readStore();
  const adminIndex = store.admins.findIndex((a) => a.id === id);
  
  if (adminIndex === -1) {
    throw new Error("Admin not found");
  }
  
  const admin = store.admins[adminIndex];
  
  // Super admins cannot be modified
  if (SUPER_ADMINS.includes(admin.email.toLowerCase())) {
    throw new Error("Super admins cannot be modified");
  }
  
  if (updates.email) {
    // Check if new email is already taken
    const existing = store.admins.find((a) => a.email.toLowerCase() === updates.email!.toLowerCase() && a.id !== id);
    if (existing) {
      throw new Error("Admin with this email already exists");
    }
    
    // Cannot change to super admin email
    if (SUPER_ADMINS.includes(updates.email.toLowerCase())) {
      throw new Error("Cannot use super admin email");
    }
    
    admin.email = updates.email.toLowerCase();
  }
  
  if (updates.password) {
    if (updates.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    admin.passwordHash = await bcrypt.hash(updates.password, 10);
  }
  
  if (updates.role) {
    // Cannot change to super_admin through this function
    if (updates.role === "super_admin") {
      throw new Error("Cannot change role to super_admin");
    }
    admin.role = updates.role;
  }
  
  admin.updatedAt = new Date().toISOString();
  await writeStore(store);
  return admin;
}

export async function deleteAdmin(id: string): Promise<void> {
  const store = await readStore();
  const adminIndex = store.admins.findIndex((a) => a.id === id);
  
  if (adminIndex === -1) {
    throw new Error("Admin not found");
  }
  
  const admin = store.admins[adminIndex];
  
  // Super admins cannot be deleted
  if (SUPER_ADMINS.includes(admin.email.toLowerCase())) {
    throw new Error("Super admins cannot be deleted");
  }
  
  store.admins.splice(adminIndex, 1);
  await writeStore(store);
}
