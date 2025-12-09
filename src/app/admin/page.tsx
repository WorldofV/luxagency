"use client";

import type { ChangeEvent, DragEvent, FormEvent, MouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import type { ModelRecord } from "@/lib/modelStore";
import type { SubmissionRecord } from "@/lib/submissionStore";
import type { PackageRecord } from "@/lib/packageStore";
import { type EventType } from "@/lib/calendarStore";
import {
  countryOptions,
  eyeOptions,
  hairOptions,
  heightOptions,
  measurementOptions,
  phonePrefixOptions,
  shoeOptions,
} from "@/lib/modelOptions";

// Dynamically import PlacementsMap to avoid SSR issues with Leaflet
const PlacementsMap = dynamic(() => import("@/components/PlacementsMap").then((mod) => ({ default: mod.PlacementsMap })), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center text-sm text-[var(--muted)]">Loading map...</div>,
});

const divisionOptions = ["Women", "Men", "Girls", "Boys", "Non Binary"];

const cityOptions = [
  // North America
  "New York",
  "Los Angeles",
  "Chicago",
  "Miami",
  "San Francisco",
  "Las Vegas",
  "Toronto",
  "Vancouver",
  "Montreal",
  "Mexico City",
  "Guadalajara",
  "Monterrey",
  // Europe
  "London",
  "Paris",
  "Milan",
  "Rome",
  "Florence",
  "Naples",
  "Venice",
  "Barcelona",
  "Madrid",
  "Valencia",
  "Seville",
  "Berlin",
  "Munich",
  "Hamburg",
  "Frankfurt",
  "Cologne",
  "Amsterdam",
  "Rotterdam",
  "Brussels",
  "Antwerp",
  "Zurich",
  "Geneva",
  "Vienna",
  "Stockholm",
  "Gothenburg",
  "Copenhagen",
  "Oslo",
  "Helsinki",
  "Warsaw",
  "Krakow",
  "Prague",
  "Budapest",
  "Bucharest",
  "Athens",
  "Thessaloniki",
  "Lisbon",
  "Porto",
  "Dublin",
  "Edinburgh",
  "Glasgow",
  "Manchester",
  "Birmingham",
  "Istanbul",
  "Moscow",
  "Saint Petersburg",
  "Kiev",
  // Asia
  "Tokyo",
  "Osaka",
  "Kyoto",
  "Yokohama",
  "Seoul",
  "Busan",
  "Shanghai",
  "Beijing",
  "Guangzhou",
  "Shenzhen",
  "Hong Kong",
  "Taipei",
  "Singapore",
  "Bangkok",
  "Phuket",
  "Kuala Lumpur",
  "Jakarta",
  "Manila",
  "Ho Chi Minh City",
  "Hanoi",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Dubai",
  "Abu Dhabi",
  "Doha",
  "Riyadh",
  "Jeddah",
  "Tel Aviv",
  "Jerusalem",
  "Beirut",
  "Tehran",
  "Karachi",
  "Lahore",
  "Islamabad",
  "Dhaka",
  "Colombo",
  // Oceania
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Auckland",
  "Wellington",
  "Christchurch",
  // South America
  "São Paulo",
  "Rio de Janeiro",
  "Brasília",
  "Buenos Aires",
  "Córdoba",
  "Lima",
  "Bogotá",
  "Medellín",
  "Santiago",
  "Caracas",
  "Montevideo",
  "Quito",
  // Africa
  "Cairo",
  "Alexandria",
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Lagos",
  "Abuja",
  "Nairobi",
  "Casablanca",
  "Rabat",
  "Tunis",
  "Accra",
  "Dar es Salaam",
  "Addis Ababa",
];

const generateRandomModelData = () => {
  const firstNames = {
    Women: ["Sophia", "Emma", "Isabella", "Olivia", "Ava", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn"],
    Men: ["James", "Liam", "Noah", "Oliver", "William", "Elijah", "Benjamin", "Lucas", "Mason", "Ethan"],
    Girls: ["Luna", "Aria", "Zoe", "Chloe", "Layla", "Lily", "Nora", "Riley", "Hannah", "Aubrey"],
    Boys: ["Jackson", "Aiden", "Grayson", "Logan", "Mason", "Carter", "Wyatt", "Owen", "Connor", "Jack"],
    "Non Binary": ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Avery", "Quinn", "Sage", "River", "Phoenix"],
  };
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"];
  const cities = ["New York", "Los Angeles", "London", "Paris", "Milan", "Tokyo", "Sydney", "Berlin", "Barcelona", "Amsterdam", "Toronto", "Vancouver", "Melbourne", "Stockholm", "Copenhagen"];
  const nationalities = ["American", "British", "French", "Italian", "German", "Spanish", "Canadian", "Australian", "Swedish", "Dutch"];
  const languages = ["English", "English, Italian", "English, French", "English, Spanish", "English, German", "English, Italian, French"];
  const heights = {
    Women: ["175cm - 5' 9''", "178cm - 5' 10''", "180cm - 5' 11''", "182cm - 6' 0''", "185cm - 6' 1''"],
    Men: ["185cm - 6' 1''", "188cm - 6' 2''", "190cm - 6' 3''", "193cm - 6' 4''", "195cm - 6' 5''"],
    Girls: ["165cm - 5' 5''", "168cm - 5' 6''", "170cm - 5' 7''", "173cm - 5' 8''", "175cm - 5' 9''"],
    Boys: ["170cm - 5' 7''", "173cm - 5' 8''", "175cm - 5' 9''", "178cm - 5' 10''", "180cm - 5' 11''"],
    "Non Binary": ["175cm - 5' 9''", "178cm - 5' 10''", "180cm - 5' 11''", "182cm - 6' 0''", "185cm - 6' 1''"],
  };
  const measurements = ["75 - 29''", "76 - 30''", "78 - 31''", "80 - 31''", "82 - 32''", "84 - 33''", "86 - 34''", "88 - 35''"];
  const shoeSizes = {
    Women: ["38 - 7.5", "39 - 8", "40 - 8.5", "41 - 9", "42 - 9.5"],
    Men: ["42 - 9", "43 - 9.5", "44 - 10", "45 - 10.5", "46 - 11"],
    Girls: ["36 - 6", "37 - 6.5", "38 - 7", "39 - 7.5", "40 - 8"],
    Boys: ["40 - 8", "41 - 8.5", "42 - 9", "43 - 9.5", "44 - 10"],
    "Non Binary": ["38 - 7.5", "39 - 8", "40 - 8.5", "41 - 9", "42 - 9.5"],
  };
  const eyeColors = ["Brown", "Blue", "Green", "Hazel", "Gray"];
  const hairColors = ["Brown", "Blonde", "Black", "Red", "Auburn", "Dark Brown", "Light Brown"];
  
  const division = divisionOptions[Math.floor(Math.random() * divisionOptions.length)];
  const firstName = firstNames[division as keyof typeof firstNames][Math.floor(Math.random() * firstNames[division as keyof typeof firstNames].length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
  const language = languages[Math.floor(Math.random() * languages.length)];
  const height = heights[division as keyof typeof heights][Math.floor(Math.random() * heights[division as keyof typeof heights].length)];
  const bust = measurements[Math.floor(Math.random() * measurements.length)];
  const waist = measurements[Math.floor(Math.random() * measurements.length)];
  const hips = measurements[Math.floor(Math.random() * measurements.length)];
  const shoes = shoeSizes[division as keyof typeof shoeSizes][Math.floor(Math.random() * shoeSizes[division as keyof typeof shoeSizes].length)];
  const eyes = eyeColors[Math.floor(Math.random() * eyeColors.length)];
  const hair = hairColors[Math.floor(Math.random() * hairColors.length)];
  
  // Generate a random birthday (age between 18-30)
  const age = 18 + Math.floor(Math.random() * 13);
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const birthday = `${birthYear}-${birthMonth}-${birthDay}`;
  
  // Generate email
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  
  // Generate Instagram handle
  const instagram = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  
  // Random phone prefix
  const phonePrefixes = ["+1", "+39", "+33", "+44", "+49", "+34"];
  const phonePrefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
  const phone = String(Math.floor(1000000000 + Math.random() * 9000000000)).slice(0, 10);
  
  return {
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    division,
    city,
    nationality,
    citizenship: nationality,
    languages: language,
    instagram,
    modelsComUrl: "",
    tiktok: `@${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    height,
    bust,
    waist,
    hips,
    shoes,
    eyes,
    hair,
    experience: "Previous modeling experience with various agencies",
    travelAvailability: "Worldwide",
    source: "Direct application",
    notes: "Sample model data",
    email,
    phonePrefix,
    phone,
    whatsapp: phone,
    birthday,
  };
};

const FEMALE_KEYWORDS = ["women", "woman", "female", "girls", "girl"];
const MALE_KEYWORDS = ["men", "man", "male", "boys", "boy"];

type PreviewImage = {
  url: string;
  alt: string;
};

type ImagePreviewState = {
  images: PreviewImage[];
  index: number;
};

const normalizeDescriptor = (value?: string) => value?.toLowerCase().trim() ?? "";

const isFemaleDescriptor = (value?: string) => {
  const normalized = normalizeDescriptor(value);
  if (!normalized) return false;
  return FEMALE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const isMaleDescriptor = (value?: string) => {
  const normalized = normalizeDescriptor(value);
  if (!normalized) return false;
  if (isFemaleDescriptor(value)) return false;
  return MALE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const parseHeightCm = (value?: string) => {
  if (!value) return null;
  const cmMatch = value.match(/(\d+(?:\.\d+)?)(?=\s*cm)/i);
  if (cmMatch) {
    return Number(cmMatch[1]);
  }
  const digitsMatch = value.match(/\d+/);
  return digitsMatch ? Number(digitsMatch[0]) : null;
};

const shouldFlagShortTalent = (descriptor?: string, height?: string) => {
  const heightValue = parseHeightCm(height);
  if (heightValue == null) return false;
  if (isMaleDescriptor(descriptor)) return heightValue < 180;
  if (isFemaleDescriptor(descriptor)) return heightValue < 170;
  return false;
};

const shortHeightLabel = (descriptor?: string) => {
  if (isMaleDescriptor(descriptor)) return "Male talent under 180 cm";
  if (isFemaleDescriptor(descriptor)) return "Female talent under 170 cm";
  return "Below preferred height";
};

const getShoeOptionsForDivision = (division?: string) => {
  const normalized = division?.toLowerCase() ?? "";
  if (normalized.includes("men") || normalized.includes("boys")) {
    return shoeOptions.male;
  }
  if (normalized.includes("women") || normalized.includes("girls")) {
    return shoeOptions.female;
  }
  return shoeOptions.neutral;
};

const formatPhoneNumber = (prefix?: string | null, number?: string | null) => {
  const normalizedPrefix = prefix?.trim() ?? "";
  const normalizedNumber = number?.trim() ?? "";
  if (normalizedPrefix && normalizedNumber) return `${normalizedPrefix} ${normalizedNumber}`;
  return normalizedPrefix || normalizedNumber;
};

const formatRelativeTime = (timestamp?: string | null): string | null => {
  if (!timestamp) return null;
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
};

const getBookEditDotColor = (timestamp?: string | null): "green" | "yellow" | "red" | null => {
  if (!timestamp) return null;
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths < 1) return "green";
  if (diffMonths < 3) return "yellow";
  return "red";
};

export default function AdminPage() {
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({
    clientName: "",
    clientEmail: "",
    notes: "",
  });
  const [packageSearch, setPackageSearch] = useState("");
  const [packageDivisionFilter, setPackageDivisionFilter] = useState<string>("All");
  const [packageListSearch, setPackageListSearch] = useState("");
  const [packageListFilter, setPackageListFilter] = useState<"all" | "opened" | "not-opened">("all");
  const [packageListSort, setPackageListSort] = useState<"newest" | "oldest" | "client-asc" | "last-opened">("newest");
  const [packageView, setPackageView] = useState<"create" | "list">("create");
  const [packageListPage, setPackageListPage] = useState(1);
  const [packageModelSort, setPackageModelSort] = useState<"name" | "city" | "recent">("name");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"models" | "submissions" | "stats" | "packages" | "admin" | "admin-stats" | "calendar" | "alerts">("models");
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [admins, setAdmins] = useState<Array<{ id: string; email: string; role: "super_admin" | "admin"; createdAt: string; updatedAt: string }>>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">("admin");
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [editAdminRole, setEditAdminRole] = useState<"admin" | "super_admin">("admin");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [search, setSearch] = useState("");
  const pendingSubmissionsCount = useMemo(
    () => submissions.filter((submission) => submission.status === "pending").length,
    [submissions]
  );
  const divisionFilterOptions = ["All", ...divisionOptions];
  const [divisionFilter, setDivisionFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<"name" | "city" | "age" | "bookUpdated" | "placements">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedChangesPrompt, setUnsavedChangesPrompt] = useState<{
    visible: boolean;
    message: string;
    action: string;
    onConfirm: (() => void) | null;
  }>({
    visible: false,
    message: "",
    action: "",
    onConfirm: null,
  });
  const [pendingModelId, setPendingModelId] = useState<string | null>(null);
  const [pendingTab, setPendingTab] = useState<"models" | "submissions" | "stats" | "packages" | "admin" | "admin-stats" | "calendar" | "alerts" | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    firstName: "",
    lastName: "",
    division: "Women",
    city: "",
    nationality: "",
    citizenship: "",
    languages: "",
    instagram: "",
    modelsComUrl: "",
    tiktok: "",
    height: "",
    bust: "",
    waist: "",
    hips: "",
    shoes: "",
    eyes: "",
    hair: "",
    experience: "",
    travelAvailability: "",
    source: "",
    notes: "",
    email: "",
    phonePrefix: "",
    phone: "",
    whatsapp: "",
    birthday: "",
  });
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("Order saved");
  const [confirmationMessage, setConfirmationMessage] = useState("Book sequence updated successfully.");
  const [deletePrompt, setDeletePrompt] = useState<{
    visible: boolean;
    message: string;
    action: string;
    onConfirm: (() => void) | null;
  }>({
    visible: false,
    message: "",
    action: "",
    onConfirm: null,
  });
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const touchStartX = useRef<number | null>(null);

  const openImagePreview = (images: PreviewImage[], index: number) => {
    setImagePreview({ images, index });
  };

  const closeImagePreview = () => setImagePreview(null);

  const showNextImage = () => {
    setImagePreview((prev) => {
      if (!prev) return prev;
      const nextIndex = Math.min(prev.images.length - 1, prev.index + 1);
      if (nextIndex === prev.index) return prev;
      return { ...prev, index: nextIndex };
    });
  };

  const showPrevImage = () => {
    setImagePreview((prev) => {
      if (!prev) return prev;
      const nextIndex = Math.max(0, prev.index - 1);
      if (nextIndex === prev.index) return prev;
      return { ...prev, index: nextIndex };
    });
  };

  const currentPreviewImage = imagePreview
    ? imagePreview.images[imagePreview.index]
    : null;
  const previewHasPrev = imagePreview ? imagePreview.index > 0 : false;
  const previewHasNext = imagePreview
    ? imagePreview.index < imagePreview.images.length - 1
    : false;

  const handlePreviewTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartX.current = touch?.clientX ?? null;
  };

  const handlePreviewTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touch = event.changedTouches[0];
    const endX = touch?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        showNextImage();
      } else {
        showPrevImage();
      }
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!imagePreview) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImagePreview();
      } else if (event.key === "ArrowRight") {
        showNextImage();
      } else if (event.key === "ArrowLeft") {
        showPrevImage();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [imagePreview]);

  const [instagramClicksFooter, setInstagramClicksFooter] = useState<number | null>(null);
  const [instagramClicksSubmission, setInstagramClicksSubmission] = useState<number | null>(null);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [activityStatsLoading, setActivityStatsLoading] = useState(true);
  const [activityStatsView, setActivityStatsView] = useState<"overview" | "recent">("overview");
  const [activitySearch, setActivitySearch] = useState("");
  const [activitySort, setActivitySort] = useState<"newest" | "oldest" | "admin-asc" | "type-asc">("newest");
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITIES_PER_PAGE = 20;

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarView, setCalendarView] = useState<"agency" | "model">("agency");
  const [calendarViewMode, setCalendarViewMode] = useState<"day" | "week" | "month" | "list">("week");
  const [selectedCalendarModel, setSelectedCalendarModel] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [eventForm, setEventForm] = useState({
    modelId: "",
    eventType: "job" as EventType,
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    clientName: "",
    location: "",
    callTime: "",
    duration: "",
    notes: "",
    availabilityStatus: "available" as "available" | "not_available" | "tentative",
    optionExpiry: "",
    optionPriority: "1st" as "1st" | "2nd" | "3rd" | "4th" | "5th",
    optionClient: "",
  });
  const [eventConflicts, setEventConflicts] = useState<any[]>([]);
  const [calendarFilters, setCalendarFilters] = useState({
    eventType: "" as string,
    clientName: "",
    modelId: "",
  });
  const [hoveredEvent, setHoveredEvent] = useState<any | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [contractCityInput, setContractCityInput] = useState("");
  const [showContractCitySuggestions, setShowContractCitySuggestions] = useState(false);
  const contractCityInputRef = useRef<HTMLDivElement>(null);
  
  // Alerts state
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [editingAlertRule, setEditingAlertRule] = useState<any | null>(null);
  const [alertForm, setAlertForm] = useState({
    name: "",
    enabled: true,
    eventType: "option" as "option" | "out" | "job" | "contract" | "casting" | "travel" | "availability",
    timing: "before" as "before" | "on" | "after",
    value: 7,
    unit: "days" as "days" | "hours",
    channels: [] as ("email" | "slack")[],
    emailRecipients: "",
    slackWebhookUrl: "",
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const loadCalendarEvents = (date: Date, viewMode: "day" | "week" | "month" | "list") => {
    setCalendarLoading(true);
    let startDate: Date;
    let endDate: Date;

    if (viewMode === "day") {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else if (viewMode === "week") {
      startDate = new Date(date);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // End of week (Saturday)
      endDate.setHours(23, 59, 59, 999);
    } else if (viewMode === "list") {
      // List view: show events from 3 months ago to 6 months ahead
      startDate = new Date(date);
      startDate.setMonth(startDate.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setMonth(endDate.getMonth() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Month view
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const url = selectedCalendarModel
      ? `/api/calendar?modelId=${selectedCalendarModel}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      : `/api/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCalendarEvents(data.events || []);
        setCalendarLoading(false);
      })
      .catch(() => setCalendarLoading(false));
  };

  const renderEventCard = (event: any) => {
    const model = models.find((m) => m.id === event.modelId);
    return (
      <div key={event.id} className="rounded-[18px] border border-[var(--border-color)] bg-white/80 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] ${
                                        event.eventType === "job"
                                          ? "bg-red-100 text-red-700"
                                          : event.eventType === "contract"
                                            ? "bg-blue-100 text-blue-700"
                                            : event.eventType === "option"
                                            ? "bg-green-100 text-green-700"
                                            : event.eventType === "out"
                                              ? "bg-gray-100 text-gray-700"
                                              : event.eventType === "casting"
                                                ? "bg-blue-100 text-blue-700"
                                                : event.eventType === "availability"
                                                  ? event.availabilityStatus === "available"
                                                    ? "bg-green-100 text-green-700"
                                                    : event.availabilityStatus === "not_available"
                                                      ? "bg-red-100 text-red-700"
                                                      : "bg-yellow-100 text-yellow-700"
                                                  : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {event.eventType}
                                      {event.eventType === "availability" && event.availabilityStatus
                                        ? ` (${event.availabilityStatus.replace("_", " ")})`
                                        : ""}
                                    </span>
              <h4 className="font-medium">{event.title}</h4>
            </div>
            {model && <p className="text-sm text-[var(--muted)]">{model.name}</p>}
            {event.clientName && <p className="text-sm text-[var(--foreground)]">{event.eventType === "contract" ? "Agency" : "Client"}: {event.clientName}</p>}
            {event.location && <p className="text-sm text-[var(--foreground)]">Location: {event.location}</p>}
            {event.startTime && event.eventType !== "contract" && (
              <p className="text-sm text-[var(--foreground)]">
                Time: {event.startTime}
                {event.endTime ? ` - ${event.endTime}` : ""}
              </p>
            )}
            {event.callTime && event.eventType !== "contract" && <p className="text-sm text-[var(--foreground)]">Call time: {event.callTime}</p>}
            {event.notes && <p className="mt-2 text-sm text-[var(--muted)]">{event.notes}</p>}
                                  {event.eventType === "option" && event.optionExpiry && (
                                    <p
                                      className={`mt-1 text-xs ${
                                        new Date(event.optionExpiry) < new Date()
                                          ? "font-bold text-red-600"
                                          : new Date(event.optionExpiry) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                            ? "font-semibold text-amber-600"
                                            : "text-amber-600"
                                      }`}
                                    >
                                      {new Date(event.optionExpiry) < new Date() ? "⚠️ EXPIRED: " : "⏰ Expires: "}
                                      {new Date(event.optionExpiry).toLocaleDateString()}
                                      {event.optionPriority && ` (${event.optionPriority} option)`}
                                    </p>
                                  )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEventForm({
                  modelId: event.modelId,
                  eventType: event.eventType,
                  title: event.title,
                  startDate: event.startDate,
                  endDate: event.endDate || "",
                  startTime: event.startTime || "",
                  endTime: event.endTime || "",
                  clientName: event.clientName || "",
                  location: event.location || "",
                  callTime: event.callTime || "",
                  duration: event.duration || "",
                  notes: event.notes || "",
                  availabilityStatus: event.availabilityStatus || "available",
                  optionExpiry: event.optionExpiry || "",
                  optionPriority: event.optionPriority || "1st",
                  optionClient: event.optionClient || "",
                });
                if (event.eventType === "contract") {
                  setContractCityInput(event.location || "");
                }
                setEditingEvent(event);
                setShowEventForm(true);
              }}
              className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-xs uppercase tracking-[0.3em] hover:border-black"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to delete this event?")) {
                  try {
                    const response = await fetch(`/api/calendar/${event.id}`, {
                      method: "DELETE",
                      headers: { "x-user-email": currentUserEmail },
                    });
                    if (response.ok) {
                      setCalendarEvents((prev) => prev.filter((e: any) => e.id !== event.id));
                      await logActivity("calendar_event_deleted", `Deleted ${event.eventType} event: ${event.title}`, {
                        eventId: event.id,
                        modelId: event.modelId,
                      });
                    }
                  } catch (error) {
                    console.error("Error deleting event:", error);
                  }
                }
              }}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs uppercase tracking-[0.3em] text-red-600 hover:border-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const refreshModels = async () => {
    setLoading(true);
    const response = await fetch("/api/models");
    if (response.ok) {
      const data = await response.json();
      setModels(data.models);
      setError(null);
    } else {
      setError("Failed to load models");
    }
    setLoading(false);
  };

  const refreshSubmissions = async () => {
    setSubmissionsLoading(true);
    const response = await fetch("/api/submissions");
    if (response.ok) {
      const data = await response.json();
      setSubmissions(data.submissions);
    }
    setSubmissionsLoading(false);
  };

  const refreshPackages = async () => {
    setPackagesLoading(true);
    const response = await fetch("/api/packages");
    if (response.ok) {
      const data = await response.json();
      setPackages(data.packages);
    }
    setPackagesLoading(false);
  };

  const handleCreatePackage = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedModelIds.size === 0) {
      setError("Please select at least one model");
      return;
    }

    setIsCreatingPackage(true);
    setError(null);
    try {
      const isEditing = editingPackageId !== null;
      const url = isEditing ? `/api/packages/${editingPackageId}` : "/api/packages";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelIds: Array.from(selectedModelIds),
          clientName: packageForm.clientName || undefined,
          clientEmail: packageForm.clientEmail || undefined,
          notes: packageForm.notes || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Unable to ${isEditing ? "update" : "create"} package`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        setIsCreatingPackage(false);
        return;
      }

      const updatedPackage = await response.json();
      await logActivity(
        isEditing ? "package_updated" : "package_created",
        `${isEditing ? "Updated" : "Created"} package${updatedPackage.clientName ? ` for ${updatedPackage.clientName}` : ""}`,
        {
          packageId: updatedPackage.id,
          packageSlug: updatedPackage.slug,
          modelCount: selectedModelIds.size,
        }
      );
      setPackageForm({ clientName: "", clientEmail: "", notes: "" });
      setSelectedModelIds(new Set());
      setEditingPackageId(null);
      setIsCreatingPackage(false);
      await refreshPackages();
      setConfirmationMessage(
        isEditing
          ? "Package updated!"
          : `Package created! Share link: ${window.location.origin}/packages/view/${updatedPackage.slug}`
      );
      setConfirmationAction(isEditing ? "Package updated" : "Package created");
      setConfirmationVisible(true);
    } catch (error) {
      console.error("Error creating/updating package:", error);
      setError(`Failed to ${editingPackageId ? "update" : "create"} package: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsCreatingPackage(false);
    }
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModelIds((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

  const stats = useMemo(() => {
    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Model Statistics
    const totalModels = models.length;
    const modelsByDivision = models.reduce((acc, model) => {
      acc[model.division] = (acc[model.division] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const modelsAddedThisMonth = models.filter(
      (model) => new Date(model.createdAt).getTime() > oneMonthAgo
    ).length;
    const modelsAddedThisYear = models.filter(
      (model) => new Date(model.createdAt).getTime() > oneYearAgo
    ).length;
    const modelsWithCompleteProfiles = models.filter(
      (model) =>
        model.name &&
        model.height &&
        model.bust &&
        model.waist &&
        model.hips &&
        model.shoes &&
        model.eyes &&
        model.hair &&
        model.city
    ).length;
    const modelsWithUpdatedBooks = models.filter(
      (model) =>
        model.bookUpdatedAt &&
        new Date(model.bookUpdatedAt).getTime() > oneMonthAgo
    ).length;

    // Submission Statistics
    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter((s) => s.status === "pending").length;
    const approvedSubmissions = submissions.filter((s) => s.status === "approved").length;
    const approvalRate =
      totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;
    const submissionsThisMonth = submissions.filter(
      (s) => new Date(s.createdAt).getTime() > oneMonthAgo
    ).length;
    const submissionsThisYear = submissions.filter(
      (s) => new Date(s.createdAt).getTime() > oneYearAgo
    ).length;

    // Package Statistics
    const totalPackages = packages.length;
    const openedPackages = packages.filter((pkg) => pkg.opened).length;
    const notOpenedPackages = totalPackages - openedPackages;
    const packagesCreatedThisMonth = packages.filter(
      (pkg) => new Date(pkg.createdAt).getTime() > oneMonthAgo
    ).length;
    const packagesCreatedThisYear = packages.filter(
      (pkg) => new Date(pkg.createdAt).getTime() > oneYearAgo
    ).length;
    const totalPackageOpens = packages.reduce((sum, pkg) => sum + (pkg.openedCount || 0), 0);
    const averageOpensPerPackage = totalPackages > 0 ? Math.round(totalPackageOpens / totalPackages) : 0;
    const packagesOpenedThisMonth = packages.filter(
      (pkg) => pkg.lastOpenedAt && new Date(pkg.lastOpenedAt).getTime() > oneMonthAgo
    ).length;
    const totalModelsInPackages = packages.reduce((sum, pkg) => sum + (pkg.modelIds?.length || 0), 0);
    const averageModelsPerPackage = totalPackages > 0 ? Math.round(totalModelsInPackages / totalPackages) : 0;

    // Content Statistics
    const totalImages = models.reduce((sum, model) => sum + (model.images?.length || 0), 0);
    const averageImagesPerModel = totalModels > 0 ? Math.round(totalImages / totalModels) : 0;
    const modelsWithNoImages = models.filter((model) => !model.images || model.images.length === 0)
      .length;

    // Activity Metrics
    const recentBookEdits = models.filter(
      (model) =>
        model.bookUpdatedAt && new Date(model.bookUpdatedAt).getTime() > oneWeekAgo
    ).length;
    const bookEditsLastMonth = models.filter(
      (model) =>
        model.bookUpdatedAt && new Date(model.bookUpdatedAt).getTime() > oneMonthAgo
    ).length;
    const bookEditsLastYear = models.filter(
      (model) =>
        model.bookUpdatedAt && new Date(model.bookUpdatedAt).getTime() > oneYearAgo
    ).length;
    const profileUpdatesLastWeek = models.filter(
      (model) => new Date(model.updatedAt).getTime() > oneWeekAgo
    ).length;
    const profileUpdatesLastMonth = models.filter(
      (model) => new Date(model.updatedAt).getTime() > oneMonthAgo
    ).length;
    const profileUpdatesLastYear = models.filter(
      (model) => new Date(model.updatedAt).getTime() > oneYearAgo
    ).length;

    return {
      models: {
        total: totalModels,
        byDivision: modelsByDivision,
        addedThisMonth: modelsAddedThisMonth,
        addedThisYear: modelsAddedThisYear,
        withCompleteProfiles: modelsWithCompleteProfiles,
        withUpdatedBooks: modelsWithUpdatedBooks,
      },
      packages: {
        total: totalPackages,
        opened: openedPackages,
        notOpened: notOpenedPackages,
        createdThisMonth: packagesCreatedThisMonth,
        createdThisYear: packagesCreatedThisYear,
        totalOpens: totalPackageOpens,
        averageOpensPerPackage,
        openedThisMonth: packagesOpenedThisMonth,
        totalModelsInPackages,
        averageModelsPerPackage,
      },
      submissions: {
        total: totalSubmissions,
        pending: pendingSubmissions,
        approved: approvedSubmissions,
        approvalRate,
        thisMonth: submissionsThisMonth,
        thisYear: submissionsThisYear,
      },
      content: {
        totalImages,
        averageImagesPerModel,
        modelsWithNoImages,
      },
      activity: {
        recentBookEdits,
        bookEditsLastMonth,
        bookEditsLastYear,
        profileUpdatesLastWeek,
        profileUpdatesLastMonth,
        profileUpdatesLastYear,
      },
    };
  }, [models, submissions, packages]);

  const refreshMetrics = async () => {
    const response = await fetch("/api/metrics/instagram");
    if (response.ok) {
      const data = await response.json();
      setInstagramClicksFooter(data.footer ?? 0);
      setInstagramClicksSubmission(data.submission ?? 0);
    }
  };

  const refreshActivityStats = async () => {
    if (!isSuperAdmin) return;
    setActivityStatsLoading(true);
    const response = await fetch("/api/activity?stats=true");
    if (response.ok) {
      const data = await response.json();
      setActivityStats(data);
    }
    setActivityStatsLoading(false);
  };

  const logActivity = async (
    activityType: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    if (!currentUserEmail) return;
    try {
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: currentUserEmail,
          activityType,
          description,
          metadata,
        }),
      });
    } catch (error) {
      // Silently fail - don't block user actions if logging fails
      console.error("Failed to log activity:", error);
    }
  };

  const refreshAdmins = async () => {
    if (!isSuperAdmin || !currentUserEmail) return;
    setAdminsLoading(true);
    try {
      const response = await fetch("/api/admins", {
        headers: {
          "x-user-email": currentUserEmail,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      // Only run in browser
      if (typeof window === "undefined") {
        setIsCheckingAuth(false);
        return;
      }
      
      const isLoggedIn = localStorage.getItem("admin-logged-in");
      const email = localStorage.getItem("admin-email");
      
      if (!isLoggedIn || !email) {
        // Not authenticated, redirect to login
        setIsCheckingAuth(false);
        setIsAuthenticated(false);
        router.replace("/admin/login");
        return;
      }
      
      // User is authenticated, set email and check super admin status
      const trimmedEmail = email.trim().toLowerCase();
      setCurrentUserEmail(trimmedEmail);
      const isSuper = trimmedEmail === "americo@3mmodels.com" || trimmedEmail === "irsida@3mmodels.com";
      setIsSuperAdmin(isSuper);
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
      const dismissedWelcome = localStorage.getItem("admin-welcome-dismissed") === "true";
      setShowWelcomeMessage(!dismissedWelcome);
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isSuperAdmin && currentUserEmail) {
      refreshAdmins();
    }
  }, [isSuperAdmin, currentUserEmail]);

  const refreshAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await fetch("/api/alerts", {
        headers: {
          "x-user-email": currentUserEmail,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAlertRules(data.rules || []);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    refreshModels();
    refreshSubmissions();
    refreshPackages();
    refreshMetrics();
  }, []);

  const refreshNotifications = async () => {
    if (!currentUserEmail) return;
    setNotificationsLoading(true);
    try {
      const response = await fetch("/api/notifications?unread=true", {
        headers: {
          "x-user-email": currentUserEmail,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadNotificationsCount(data.notifications?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "alerts") {
      refreshAlerts();
    }
    if (currentUserEmail) {
      refreshNotifications();
    }
  }, [activeTab, currentUserEmail]);

  // Refresh notifications periodically (every 30 seconds)
  useEffect(() => {
    if (!currentUserEmail) return;
    
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [currentUserEmail]);

  // Check alerts periodically (every 5 minutes)
  useEffect(() => {
    const checkAlertsInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/alerts/check", {
          method: "POST",
          headers: {
            "x-user-email": currentUserEmail,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.triggered > 0) {
            console.log(`Triggered ${data.triggered} alerts, sent ${data.sent} notifications`);
          }
        }
      } catch (error) {
        console.error("Error checking alerts:", error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(checkAlertsInterval);
  }, [currentUserEmail]);

  useEffect(() => {
    if (isSuperAdmin && activeTab === "admin-stats") {
      refreshActivityStats();
      setActivityPage(1);
      setActivitySearch("");
    }
    if (activeTab === "calendar") {
      // Load calendar events when tab is opened
      loadCalendarEvents(calendarDate, calendarViewMode);
    }
  }, [isSuperAdmin, activeTab]);

  useEffect(() => {
    if (!confirmationVisible) return;
    const timer = setTimeout(() => setConfirmationVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [confirmationVisible]);

  // Initialize city input from form
  useEffect(() => {
    if (form.city && !cityInput) {
      setCityInput(form.city);
    }
  }, [form.city, cityInput]);

  // Close city suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false);
      }
      if (
        contractCityInputRef.current &&
        !contractCityInputRef.current.contains(event.target as Node)
      ) {
        setShowContractCitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync contract city input when event form changes
  useEffect(() => {
    if (eventForm.eventType === "contract") {
      setContractCityInput(eventForm.location || "");
    } else {
      setContractCityInput("");
    }
  }, [eventForm.eventType, eventForm.location]);

  // Reset to page 1 when filtered results change (if current page is invalid)
  useEffect(() => {
    const searchQuery = packageListSearch.trim().toLowerCase();
    const filtered = packages.filter((pkg) => {
      if (packageListFilter === "opened" && !pkg.opened) return false;
      if (packageListFilter === "not-opened" && pkg.opened) return false;
      if (!searchQuery) return true;
      return (
        (pkg.clientName?.toLowerCase().includes(searchQuery) ?? false) ||
        (pkg.clientEmail?.toLowerCase().includes(searchQuery) ?? false) ||
        (pkg.notes?.toLowerCase().includes(searchQuery) ?? false) ||
        pkg.slug.toLowerCase().includes(searchQuery)
      );
    });
    const totalPages = Math.ceil(filtered.length / 10);
    if (totalPages > 0 && packageListPage > totalPages) {
      setPackageListPage(1);
    }
  }, [packages, packageListSearch, packageListFilter, packageListSort]);

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = models
      .filter((model) => {
        if (!query) return true;
        return (
          model.name.toLowerCase().includes(query) ||
          (model.city?.toLowerCase().includes(query) ?? false)
        );
      })
      .filter((model) => {
        if (divisionFilter === "All") return true;
        return model.division.toLowerCase() === divisionFilter.toLowerCase();
      });

    // Sort models
    result = [...result].sort((a, b) => {
      let aValue: string | number | null = null;
      let bValue: string | number | null = null;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "city":
          aValue = (a.city ?? "").toLowerCase();
          bValue = (b.city ?? "").toLowerCase();
          break;
        case "age":
          if (a.birthday && b.birthday) {
            aValue = Math.floor(
              (Date.now() - new Date(a.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            );
            bValue = Math.floor(
              (Date.now() - new Date(b.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            );
          } else if (a.birthday) {
            aValue = Math.floor(
              (Date.now() - new Date(a.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            );
            bValue = -1; // Models without birthday go to end
          } else if (b.birthday) {
            aValue = -1;
            bValue = Math.floor(
              (Date.now() - new Date(b.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            );
          } else {
            aValue = 0;
            bValue = 0;
          }
          break;
        case "bookUpdated":
          if (a.bookUpdatedAt && b.bookUpdatedAt) {
            aValue = new Date(a.bookUpdatedAt).getTime();
            bValue = new Date(b.bookUpdatedAt).getTime();
          } else if (a.bookUpdatedAt) {
            aValue = new Date(a.bookUpdatedAt).getTime();
            bValue = 0; // Models without bookUpdatedAt go to end
          } else if (b.bookUpdatedAt) {
            aValue = 0;
            bValue = new Date(b.bookUpdatedAt).getTime();
          } else {
            aValue = 0;
            bValue = 0;
          }
          break;
        case "placements":
          aValue = (a.agencyPlacements?.length ?? 0);
          bValue = (b.agencyPlacements?.length ?? 0);
          break;
      }

      if (aValue === null || bValue === null) {
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        return -1;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [models, search, divisionFilter, sortField, sortDirection]);


  useEffect(() => {
    if (!filteredModels.length) {
      setSelectedModelId(null);
      return;
    }
    // Only auto-select if a model was previously selected but is no longer in the filtered list
    // Don't auto-select when switching to the models tab
    if (selectedModelId && !filteredModels.some((model) => model.id === selectedModelId)) {
      if (!hasUnsavedChanges) {
        setSelectedModelId(null);
      }
    }
  }, [filteredModels, selectedModelId, hasUnsavedChanges]);

  const handleModelSelection = (modelId: string) => {
    if (hasUnsavedChanges && modelId !== selectedModelId) {
      setPendingModelId(modelId);
      setUnsavedChangesPrompt({
        visible: true,
        message: "You have unsaved changes. Are you sure you want to switch models? Your changes will be lost.",
        action: "Unsaved changes",
        onConfirm: () => {
          setHasUnsavedChanges(false);
          setIsAddingModel(false);
          setSelectedModelId(modelId);
          setPendingModelId(null);
          setUnsavedChangesPrompt({
            visible: false,
            message: "",
            action: "",
            onConfirm: null,
          });
        },
      });
      return;
    }
    setHasUnsavedChanges(false);
    setIsAddingModel(false);
    setSelectedModelId(modelId);
  };

  const handleTabChange = (tab: "models" | "submissions" | "stats" | "packages" | "admin" | "admin-stats" | "calendar" | "alerts") => {
    if (hasUnsavedChanges && tab !== activeTab) {
      setPendingTab(tab);
      setUnsavedChangesPrompt({
        visible: true,
        message: "You have unsaved changes. Are you sure you want to switch tabs? Your changes will be lost.",
        action: "Unsaved changes",
        onConfirm: () => {
          setHasUnsavedChanges(false);
          setActiveTab(tab);
          setPendingTab(null);
          setUnsavedChangesPrompt({
            visible: false,
            message: "",
            action: "",
            onConfirm: null,
          });
          // Clear selected model and adding state when switching tabs
          if (tab === "models") {
            setSelectedModelId(null);
            setIsAddingModel(false);
          }
        },
      });
      return;
    }
    setActiveTab(tab);
    // Clear selected model and adding state when switching to models tab
    if (tab === "models") {
      setSelectedModelId(null);
      setIsAddingModel(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const selectedModel = selectedModelId
    ? models.find((model) => model.id === selectedModelId) ?? null
    : null;
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if ((selectedModelId || isAddingModel) && editorRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedModelId, isAddingModel]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    const response = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setError("Unable to create model");
    } else {
      const newModel = await response.json();
      await logActivity("model_created", `Created model: ${form.name || `${form.firstName} ${form.lastName}`}`, {
        modelId: newModel.id,
        division: form.division,
      });
      setForm({
        name: "",
        firstName: "",
        lastName: "",
        division: form.division,
        city: "",
        nationality: "",
        citizenship: "",
        languages: "",
        instagram: "",
        modelsComUrl: "",
        tiktok: "",
        height: "",
        bust: "",
        waist: "",
        hips: "",
        shoes: "",
        eyes: "",
        hair: "",
        experience: "",
        travelAvailability: "",
        source: "",
        notes: "",
        email: "",
        phonePrefix: "",
        phone: "",
        whatsapp: "",
        birthday: "",
      });
      setCityInput("");
      setIsAddingModel(false);
      await refreshModels();
    }
    setCreating(false);
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the admin page (redirect should happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div>
          <p className="section-title">Admin</p>
          <h1 className="text-3xl font-light tracking-[0.1em]">
            3MMODELS Control Panel
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Upload new models, manage their books, reorder or delete images.
          </p>
          {currentUserEmail && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--muted)]">
                Logged in as: {currentUserEmail}
                {isSuperAdmin ? " (Super Admin)" : " (Regular Admin)"}
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("admin-email");
                  localStorage.removeItem("admin-logged-in");
                  localStorage.removeItem("admin-welcome-dismissed");
                  router.push("/admin/login");
                }}
                className="text-xs text-[var(--muted)] underline-offset-4 hover:underline"
              >
                Logout
              </button>
            </div>
          )}
          {currentUserEmail && !isSuperAdmin && (
            <p className="text-xs text-amber-600 mt-1">
              Note: Admin tab is only visible to super admins (americo@3mmodels.com or irsida@3mmodels.com)
            </p>
          )}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <nav className="relative flex flex-wrap gap-4 border-b border-[var(--border-color)] pb-2 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          {unreadNotificationsCount > 0 && (
            <div className="absolute -top-2 -right-2 z-10">
              <button
                onClick={() => {
                  handleTabChange("alerts");
                  refreshNotifications();
                }}
                className="relative rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 shadow-lg"
                title={`${unreadNotificationsCount} unread alert${unreadNotificationsCount !== 1 ? "s" : ""}`}
              >
                🔔 {unreadNotificationsCount}
              </button>
            </div>
          )}
          <button
            className={`pb-1 ${
              activeTab === "models"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleTabChange("models")}
          >
            Models
          </button>
          <button
            className={`pb-1 ${
              activeTab === "calendar"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleTabChange("calendar")}
          >
            Calendar
          </button>
          <button
            className={`pb-1 ${
              activeTab === "alerts"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleTabChange("alerts")}
          >
            Alerts
          </button>
          <button
            className={`pb-1 ${
              activeTab === "submissions"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleTabChange("submissions")}
          >
            Submissions
          </button>
          <button
            className={`pb-1 ${
              activeTab === "packages"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleTabChange("packages")}
          >
            Packages
          </button>
          <button
            className={`pb-1 ${
              activeTab === "stats"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleTabChange("stats")}
          >
            Stats
          </button>
          {isSuperAdmin && (
            <>
              <button
                className={`pb-1 ${
                  activeTab === "admin"
                    ? "border-b border-black text-black"
                    : "hover:text-black"
                }`}
                onClick={() => handleTabChange("admin")}
              >
                Admin
              </button>
              <button
                className={`pb-1 ${
                  activeTab === "admin-stats"
                    ? "border-b border-black text-black"
                    : "hover:text-black"
                }`}
                onClick={() => handleTabChange("admin-stats")}
              >
                Admin Stats
              </button>
            </>
          )}
        </nav>

        {showWelcomeMessage && (
          <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-[var(--border-color)] bg-white/80 p-4 text-sm text-[var(--foreground)] shadow-sm">
            <div className="flex-1">
              <p className="font-medium">
                Welcome back{currentUserEmail ? `, ${currentUserEmail}` : ""}!
              </p>
              <p className="text-[var(--muted)]">
                {pendingSubmissionsCount > 0
                  ? `You have ${pendingSubmissionsCount} model submission${pendingSubmissionsCount > 1 ? "s" : ""} to review.`
                  : "No pending model submissions right now."}
              </p>
            </div>
            <button
              onClick={() => {
                setShowWelcomeMessage(false);
                if (typeof window !== "undefined") {
                  localStorage.setItem("admin-welcome-dismissed", "true");
                }
              }}
              className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--muted)] transition hover:border-black"
            >
              Dismiss
            </button>
          </div>
        )}
      </header>


      {activeTab === "models" ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">
                Existing models
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Search by name or location, then manage each profile.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="search"
                placeholder="Search name or city"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
              />
              <button
                onClick={refreshModels}
                className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {divisionFilterOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDivisionFilter(option)}
                      className={`rounded-full border px-4 py-1 text-[10px] uppercase tracking-[0.4em] transition ${
                        divisionFilter === option
                          ? "border-black text-black"
                          : "border-[var(--border-color)] text-[var(--muted)] hover:border-black/60"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortField}
                    onChange={(event) =>
                      setSortField(event.target.value as "name" | "city" | "age" | "bookUpdated" | "placements")
                    }
                    className="rounded-full border border-[var(--border-color)] px-3 py-1.5 text-[10px] uppercase tracking-[0.4em] text-[var(--foreground)]"
                  >
                    <option value="name">Name</option>
                    <option value="city">City</option>
                    <option value="age">Age</option>
                    <option value="bookUpdated">Last edited</option>
                    <option value="placements">Placements</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                    className="rounded-full border border-[var(--border-color)] px-3 py-1.5 text-[10px] uppercase tracking-[0.4em] text-[var(--foreground)] hover:border-black/60"
                    title={sortDirection === "asc" ? "Ascending" : "Descending"}
                  >
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>

              {filteredModels.length ? (
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {filteredModels.map((model) => {
                    const isSelected = selectedModelId === model.id;
                    const heroImage = model.images[0];
                    return (
                      <button
                        type="button"
                        key={model.id}
                        onClick={() => handleModelSelection(model.id)}
                        className={`rounded-[18px] border ${
                          isSelected ? "border-black" : "border-[var(--border-color)]"
                        } bg-white/80 p-2 text-left shadow-sm transition hover:-translate-y-1`}
                      >
                        <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-[var(--background)]">
                          {heroImage ? (
                            <img
                              src={heroImage.url}
                              alt={model.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.06em] text-[var(--foreground)]">
                            <span className={model.hidden ? "opacity-50" : ""}>{model.name}</span>
                            {model.hidden && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-orange-700">
                                Hidden
                              </span>
                            )}
                            {model.bookUpdatedAt && (
                              <span
                                className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
                                  getBookEditDotColor(model.bookUpdatedAt) === "green"
                                    ? "bg-green-500"
                                    : getBookEditDotColor(model.bookUpdatedAt) === "yellow"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                title={
                                  getBookEditDotColor(model.bookUpdatedAt) === "green"
                                    ? "Edited within 1 month"
                                    : getBookEditDotColor(model.bookUpdatedAt) === "yellow"
                                      ? "Edited within 3 months"
                                      : "Edited over 3 months ago"
                                }
                              />
                            )}
                          </p>
                          {model.city ? (
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
                              {model.city}
                            </p>
                          ) : null}
                        </div>
                        <span className="mt-1 inline-block text-[9px] uppercase tracking-[0.4em] text-[var(--muted)]">
                          {model.division}
                        </span>
                        {model.agencyPlacements && model.agencyPlacements.length > 0 ? (
                          <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-[var(--muted)]">
                            {model.agencyPlacements.length} {model.agencyPlacements.length === 1 ? "placement" : "placements"}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-[16px] border border-[var(--border-color)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                  No models match this search or division.
                </p>
              )}

              {isAddingModel ? (
                <div ref={editorRef} className="sticky top-4">
                  <section className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6">
                    <div className="mb-6 flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Quick add</p>
                        <h2 className="text-lg font-medium tracking-[0.1em]">Add a new model</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setForm(generateRandomModelData())}
                          className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] underline-offset-4 hover:underline"
                        >
                          Fill random
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingModel(false)}
                          className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] underline-offset-4 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <form
                      className="space-y-6"
                      onSubmit={handleCreate}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          First name
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.firstName}
                            onChange={(event) =>
                              setForm((prev) => {
                                const firstName = event.target.value;
                                const lastName = prev.lastName;
                                const nameParts = [firstName, lastName].filter(Boolean);
                                return { ...prev, firstName, name: nameParts.length > 0 ? nameParts.join(" ") : "" };
                              })
                            }
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Last name
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.lastName}
                            onChange={(event) =>
                              setForm((prev) => {
                                const lastName = event.target.value;
                                const firstName = prev.firstName;
                                const nameParts = [firstName, lastName].filter(Boolean);
                                return { ...prev, lastName, name: nameParts.length > 0 ? nameParts.join(" ") : "" };
                              })
                            }
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Division
                          <select
                            required
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.division}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, division: event.target.value }))
                            }
                          >
                            {divisionOptions.map((division) => (
                              <option key={division} value={division}>
                                {division}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          City
                          <div className="relative mt-1" ref={cityInputRef}>
                            <input
                              type="text"
                              className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                              value={cityInput}
                              onChange={(event) => {
                                const value = event.target.value;
                                setCityInput(value);
                                setForm((prev) => ({ ...prev, city: value }));
                                setShowCitySuggestions(true);
                              }}
                              onFocus={() => setShowCitySuggestions(true)}
                              onKeyDown={(event) => {
                                const filtered = cityInput.trim()
                                  ? cityOptions.filter((city) =>
                                      city.toLowerCase().includes(cityInput.toLowerCase())
                                    )
                                  : [];
                                if (event.key === "Enter" && filtered.length > 0) {
                                  event.preventDefault();
                                  const selectedCity = filtered[0];
                                  setCityInput(selectedCity);
                                  setForm((prev) => ({ ...prev, city: selectedCity }));
                                  setShowCitySuggestions(false);
                                }
                              }}
                              placeholder="Type and select city"
                            />
                            {showCitySuggestions && cityInput.trim() && (
                              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-white shadow-lg">
                                {cityOptions
                                  .filter((city) =>
                                    city.toLowerCase().includes(cityInput.toLowerCase())
                                  )
                                  .map((city) => (
                                    <button
                                      key={city}
                                      type="button"
                                      onClick={() => {
                                        setCityInput(city);
                                        setForm((prev) => ({ ...prev, city }));
                                        setShowCitySuggestions(false);
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                    >
                                      {city}
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Nationality
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.nationality}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, nationality: event.target.value }))
                            }
                          >
                            <option value="">Select nationality</option>
                            {countryOptions.map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Citizenship
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.citizenship}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, citizenship: event.target.value }))
                            }
                          >
                            <option value="">Select citizenship</option>
                            {countryOptions.map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Instagram
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.instagram}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, instagram: event.target.value }))
                            }
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Models.com
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.modelsComUrl}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, modelsComUrl: event.target.value }))
                            }
                            placeholder="https://models.com/people/..."
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          TikTok
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.tiktok}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, tiktok: event.target.value }))
                            }
                            placeholder="@username"
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Height
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.height}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, height: event.target.value }))
                            }
                          >
                            <option value="">Select height</option>
                            {heightOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Bust
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.bust}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, bust: event.target.value }))
                            }
                          >
                            <option value="">Select bust</option>
                            {measurementOptions.map((option) => (
                              <option key={`bust-${option}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Waist
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.waist}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, waist: event.target.value }))
                            }
                          >
                            <option value="">Select waist</option>
                            {measurementOptions.map((option) => (
                              <option key={`waist-${option}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Hips
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.hips}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, hips: event.target.value }))
                            }
                          >
                            <option value="">Select hips</option>
                            {measurementOptions.map((option) => (
                              <option key={`hips-${option}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Shoes
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.shoes}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, shoes: event.target.value }))
                            }
                          >
                            <option value="">Select shoes</option>
                            {getShoeOptionsForDivision(form.division).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Eyes
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.eyes}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, eyes: event.target.value }))
                            }
                          >
                            <option value="">Select eyes</option>
                            {eyeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Hair
                          <select
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.hair}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, hair: event.target.value }))
                            }
                          >
                            <option value="">Select hair</option>
                            {hairOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] sm:col-span-2">
                          Languages
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.languages}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, languages: event.target.value }))
                            }
                            placeholder="e.g., English, Italian, French"
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] sm:col-span-2">
                          Experience
                          <textarea
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.experience}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, experience: event.target.value }))
                            }
                            rows={3}
                            placeholder="Modeling experience, agencies, campaigns..."
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Travel Availability
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.travelAvailability}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, travelAvailability: event.target.value }))
                            }
                            placeholder="e.g., Worldwide, Europe only"
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Source
                          <input
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.source}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, source: event.target.value }))
                            }
                            placeholder="How did you hear about us?"
                          />
                        </label>
                        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] sm:col-span-2">
                          Notes
                          <textarea
                            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                            value={form.notes}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, notes: event.target.value }))
                            }
                            rows={3}
                            placeholder="Additional notes or information..."
                          />
                        </label>
                      </div>

                      <div className="border-t border-[var(--border-color)] pt-4">
                        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Private contact information
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                            Email
                            <input
                              type="email"
                              className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                              value={form.email}
                              onChange={(event) =>
                                setForm((prev) => ({ ...prev, email: event.target.value }))
                              }
                            />
                          </label>
                          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                            Phone
                            <div className="mt-1 flex gap-2">
                              <select
                                className="w-28 rounded-lg border border-[var(--border-color)] px-2 py-2 text-xs"
                                value={form.phonePrefix}
                                onChange={(event) =>
                                  setForm((prev) => ({ ...prev, phonePrefix: event.target.value }))
                                }
                              >
                                <option value="">Prefix</option>
                                {phonePrefixOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                className="flex-1 rounded-lg border border-[var(--border-color)] px-3 py-2"
                                value={form.phone}
                                onChange={(event) =>
                                  setForm((prev) => ({ ...prev, phone: event.target.value.replace(/[^0-9]/g, "") }))
                                }
                                inputMode="numeric"
                                pattern="[0-9]*"
                              />
                            </div>
                          </label>
                          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                            WhatsApp
                            <input
                              className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                              value={form.whatsapp}
                              onChange={(event) =>
                                setForm((prev) => ({ ...prev, whatsapp: event.target.value }))
                              }
                            />
                          </label>
                          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                            Birthday
                            <input
                              type="date"
                              className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
                              value={form.birthday}
                              onChange={(event) =>
                                setForm((prev) => ({ ...prev, birthday: event.target.value }))
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={creating || !form.name.trim()}
                          className="inline-flex items-center rounded-full bg-black px-6 py-2 text-sm uppercase tracking-[0.4em] text-white disabled:opacity-60"
                        >
                          {creating ? "Creating…" : "Add model"}
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              ) : selectedModel ? (
                <div ref={editorRef}>
                  <ModelCard
                    key={selectedModel.id}
                    model={selectedModel}
                    onChange={refreshModels}
                    onShowConfirmation={(message = "Book sequence updated successfully.", action = "Order saved") => {
                      setConfirmationMessage(message);
                      setConfirmationAction(action);
                      setConfirmationVisible(true);
                    }}
                    onShowDeleteConfirmation={(message, action, fn) =>
                      setDeletePrompt({
                        visible: true,
                        message,
                        action,
                        onConfirm: fn,
                      })
                    }
                    onDirtyStateChange={setHasUnsavedChanges}
                    currentUserEmail={currentUserEmail}
                    logActivity={logActivity}
                    onModelUpdate={(updatedModel) => {
                      // Update just this model in the models array without full refresh
                      setModels((prevModels) =>
                        prevModels.map((m) => (m.id === updatedModel.id ? updatedModel : m))
                      );
                    }}
                  />
                </div>
              ) : filteredModels.length ? (
                <p className="text-sm text-[var(--muted)]">Select a model card to manage details.</p>
              ) : null}
            </div>
          )}
        </section>
      ) : activeTab === "calendar" ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Model Schedule Calendar</h2>
              <p className="text-sm text-[var(--muted)]">
                Manage model availability, bookings, options, and agency-wide schedule.
              </p>
            </div>
          </div>

          {/* Submenu */}
          <div className="flex gap-2 border-b border-[var(--border-color)] pb-2">
            <button
              onClick={() => {
                setCalendarView("agency");
                setSelectedCalendarModel(null);
              }}
              className={`pb-1 text-xs uppercase tracking-[0.4em] transition ${
                calendarView === "agency"
                  ? "border-b-2 border-black text-black"
                  : "text-[var(--muted)] hover:text-black"
              }`}
            >
              Agency Overview
            </button>
            <button
              onClick={() => setCalendarView("model")}
              className={`pb-1 text-xs uppercase tracking-[0.4em] transition ${
                calendarView === "model"
                  ? "border-b-2 border-black text-black"
                  : "text-[var(--muted)] hover:text-black"
              }`}
            >
              Model Calendar
            </button>
          </div>

          {calendarView === "agency" ? (
            <div className="space-y-4">
              {/* Filters */}
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--muted)]">Filters</h4>
                  <button
                    onClick={() => {
                      setCalendarFilters({ eventType: "", clientName: "", modelId: "" });
                    }}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Model
                    </label>
                    <select
                      value={calendarFilters.modelId}
                      onChange={(e) => setCalendarFilters({ ...calendarFilters, modelId: e.target.value })}
                      className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    >
                      <option value="">All Models</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Event Type
                    </label>
                    <select
                      value={calendarFilters.eventType}
                      onChange={(e) => setCalendarFilters({ ...calendarFilters, eventType: e.target.value })}
                      className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="job">Job</option>
                      <option value="contract">Contract</option>
                      <option value="option">Option</option>
                      <option value="out">Out</option>
                      <option value="casting">Casting</option>
                      <option value="travel">Travel</option>
                      <option value="availability">Availability</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Client
                    </label>
                    <input
                      type="text"
                      value={calendarFilters.clientName}
                      onChange={(e) => setCalendarFilters({ ...calendarFilters, clientName: e.target.value })}
                      placeholder="Filter by client..."
                      className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (calendarViewMode === "list") return; // No navigation for list view
                        const prev = new Date(calendarDate);
                        if (calendarViewMode === "day") {
                          prev.setDate(prev.getDate() - 1);
                        } else if (calendarViewMode === "week") {
                          prev.setDate(prev.getDate() - 7);
                        } else {
                          prev.setMonth(prev.getMonth() - 1);
                        }
                        setCalendarDate(prev);
                        loadCalendarEvents(prev, calendarViewMode);
                      }}
                      className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-sm uppercase tracking-[0.3em] hover:border-black"
                    >
                      ←
                    </button>
                    <h3 className="text-lg font-medium min-w-[200px] text-center">
                      {calendarViewMode === "day"
                        ? calendarDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                        : calendarViewMode === "week"
                          ? (() => {
                              const weekStart = new Date(calendarDate);
                              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekEnd.getDate() + 6);
                              return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
                            })()
                          : calendarViewMode === "list"
                            ? "All Events"
                            : calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <button
                      onClick={() => {
                        if (calendarViewMode === "list") return; // No navigation for list view
                        const next = new Date(calendarDate);
                        if (calendarViewMode === "day") {
                          next.setDate(next.getDate() + 1);
                        } else if (calendarViewMode === "week") {
                          next.setDate(next.getDate() + 7);
                        } else {
                          next.setMonth(next.getMonth() + 1);
                        }
                        setCalendarDate(next);
                        loadCalendarEvents(next, calendarViewMode);
                      }}
                      className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-sm uppercase tracking-[0.3em] hover:border-black"
                    >
                      →
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        setCalendarDate(today);
                        loadCalendarEvents(today, calendarViewMode);
                      }}
                      className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-xs uppercase tracking-[0.3em] hover:border-black"
                    >
                      Today
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCalendarViewMode("day");
                        loadCalendarEvents(calendarDate, "day");
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                        calendarViewMode === "day"
                          ? "border-black bg-black text-white"
                          : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                      }`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => {
                        setCalendarViewMode("week");
                        loadCalendarEvents(calendarDate, "week");
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                        calendarViewMode === "week"
                          ? "border-black bg-black text-white"
                          : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => {
                        setCalendarViewMode("month");
                        loadCalendarEvents(calendarDate, "month");
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                        calendarViewMode === "month"
                          ? "border-black bg-black text-white"
                          : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => {
                        setCalendarViewMode("list");
                        loadCalendarEvents(calendarDate, "list");
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                        calendarViewMode === "list"
                          ? "border-black bg-black text-white"
                          : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEventForm({
                      modelId: "",
                      eventType: "job",
                      title: "",
                      startDate: calendarDate.toISOString().split("T")[0],
                      endDate: "",
                      startTime: "",
                      endTime: "",
                      clientName: "",
                      location: "",
                      callTime: "",
                      duration: "",
                      notes: "",
                      availabilityStatus: "available",
                      optionExpiry: "",
                      optionPriority: "1st",
                      optionClient: "",
                    });
                    setEditingEvent(null);
                    setShowEventForm(true);
                  }}
                  className="rounded-full bg-black px-4 py-2 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-black/80"
                >
                  + Add Event
                </button>
              </div>

              {calendarLoading ? (
                <p className="text-sm text-[var(--muted)]">Loading calendar...</p>
              ) : (
                <div className="space-y-4">
                  {calendarViewMode === "day" ? (
                    (() => {
                      const dayStart = new Date(calendarDate);
                      dayStart.setHours(0, 0, 0, 0);
                      const dayEnd = new Date(calendarDate);
                      dayEnd.setHours(23, 59, 59, 999);

                      let dayEvents = calendarEvents.filter((event: any) => {
                        const eventStart = new Date(event.startDate);
                        eventStart.setHours(0, 0, 0, 0);
                        const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                        eventEnd.setHours(23, 59, 59, 999);
                        // Event shows on this day if the day overlaps with the event's date range
                        return dayStart <= eventEnd && dayEnd >= eventStart;
                      });

                      // Apply filters
                      if (calendarFilters.eventType) {
                        dayEvents = dayEvents.filter((e: any) => e.eventType === calendarFilters.eventType);
                      }
                      if (calendarFilters.clientName) {
                        const clientLower = calendarFilters.clientName.toLowerCase();
                        dayEvents = dayEvents.filter(
                          (e: any) =>
                            e.clientName?.toLowerCase().includes(clientLower) ||
                            e.optionClient?.toLowerCase().includes(clientLower)
                        );
                      }
                      if (calendarFilters.modelId) {
                        dayEvents = dayEvents.filter((e: any) => e.modelId === calendarFilters.modelId);
                      }

                      if (dayEvents.length === 0) {
                        return (
                          <div 
                            className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6 cursor-pointer hover:bg-white/90 transition"
                            onClick={() => {
                              setEventForm({
                                modelId: "",
                                eventType: "job",
                                title: "",
                                startDate: calendarDate.toISOString().split("T")[0],
                                endDate: "",
                                startTime: "",
                                endTime: "",
                                clientName: "",
                                location: "",
                                callTime: "",
                                duration: "",
                                notes: "",
                                availabilityStatus: "available",
                                optionExpiry: "",
                                optionPriority: "1st",
                                optionClient: "",
                              });
                              setEditingEvent(null);
                              setShowEventForm(true);
                            }}
                          >
                            <p className="text-sm text-[var(--muted)]">No events scheduled for this day. Click to add an event.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {dayEvents.map((event: any) => (
                            <div
                              key={event.id}
                              onMouseEnter={(e) => {
                                setHoveredEvent(event);
                                setHoverPosition({ x: e.clientX, y: e.clientY });
                              }}
                              onMouseMove={(e) => {
                                setHoverPosition({ x: e.clientX, y: e.clientY });
                              }}
                              onMouseLeave={() => setHoveredEvent(null)}
                            >
                              {renderEventCard(event)}
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  ) : calendarViewMode === "week" ? (
                    (() => {
                      const weekStart = new Date(calendarDate);
                      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                      weekStart.setHours(0, 0, 0, 0);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 6);
                      weekEnd.setHours(23, 59, 59, 999);

                      let weekEvents = calendarEvents.filter((event: any) => {
                        const eventDate = new Date(event.startDate);
                        return eventDate >= weekStart && eventDate <= weekEnd;
                      });

                      // Apply filters
                      if (calendarFilters.eventType) {
                        weekEvents = weekEvents.filter((e: any) => e.eventType === calendarFilters.eventType);
                      }
                      if (calendarFilters.clientName) {
                        const clientLower = calendarFilters.clientName.toLowerCase();
                        weekEvents = weekEvents.filter(
                          (e: any) =>
                            e.clientName?.toLowerCase().includes(clientLower) ||
                            e.optionClient?.toLowerCase().includes(clientLower)
                        );
                      }
                      if (calendarFilters.modelId) {
                        weekEvents = weekEvents.filter((e: any) => e.modelId === calendarFilters.modelId);
                      }

                      const days = [];
                      for (let i = 0; i < 7; i++) {
                        const day = new Date(weekStart);
                        day.setDate(day.getDate() + i);
                        days.push(day);
                      }

                      return (
                        <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 overflow-hidden">
                          <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
                            {days.map((day, idx) => (
                              <div key={idx} className="border-r border-[var(--border-color)] last:border-r-0 p-3 text-center">
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                                </p>
                                <p className={`mt-1 text-lg font-medium ${day.toDateString() === new Date().toDateString() ? "text-black" : "text-[var(--foreground)]"}`}>
                                  {day.getDate()}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 min-h-[400px]">
                            {days.map((day, idx) => {
                              const dayEvents = weekEvents.filter((event: any) => {
                                const eventStart = new Date(event.startDate);
                                eventStart.setHours(0, 0, 0, 0);
                                const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                                eventEnd.setHours(23, 59, 59, 999);
                                const dayStart = new Date(day);
                                dayStart.setHours(0, 0, 0, 0);
                                const dayEnd = new Date(day);
                                dayEnd.setHours(23, 59, 59, 999);
                                // Event shows on this day if the day overlaps with the event's date range
                                return dayStart <= eventEnd && dayEnd >= eventStart;
                              });

                              return (
                                <div 
                                  key={idx} 
                                  className="border-r border-[var(--border-color)] last:border-r-0 p-2 space-y-1 cursor-pointer hover:bg-gray-50/50 transition min-h-[60px]"
                                  onClick={() => {
                                    const dateStr = day.toISOString().split("T")[0];
                                    setEventForm({
                                      modelId: "",
                                      eventType: "job",
                                      title: "",
                                      startDate: dateStr,
                                      endDate: "",
                                      startTime: "",
                                      endTime: "",
                                      clientName: "",
                                      location: "",
                                      callTime: "",
                                      duration: "",
                                      notes: "",
                                      availabilityStatus: "available",
                                      optionExpiry: "",
                                      optionPriority: "1st",
                                      optionClient: "",
                                    });
                                    setEditingEvent(null);
                                    setShowEventForm(true);
                                  }}
                                >
                                  {dayEvents.map((event: any) => (
                                    <div
                                      key={event.id}
                                      onMouseEnter={(e) => {
                                        setHoveredEvent(event);
                                        setHoverPosition({ x: e.clientX, y: e.clientY });
                                      }}
                                      onMouseMove={(e) => {
                                        setHoverPosition({ x: e.clientX, y: e.clientY });
                                      }}
                                      onMouseLeave={() => setHoveredEvent(null)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEventForm({
                                          modelId: event.modelId,
                                          eventType: event.eventType,
                                          title: event.title,
                                          startDate: event.startDate,
                                          endDate: event.endDate || "",
                                          startTime: event.startTime || "",
                                          endTime: event.endTime || "",
                                          clientName: event.clientName || "",
                                          location: event.location || "",
                                          callTime: event.callTime || "",
                                          duration: event.duration || "",
                                          notes: event.notes || "",
                                          availabilityStatus: event.availabilityStatus || "available",
                                          optionExpiry: event.optionExpiry || "",
                                          optionPriority: event.optionPriority || "1st",
                                          optionClient: event.optionClient || "",
                                        });
                                        setEditingEvent(event);
                                        setShowEventForm(true);
                                      }}
                                      className={`rounded-lg p-2 text-xs cursor-pointer hover:opacity-80 ${
                                        event.eventType === "job"
                                          ? "bg-red-100 text-red-800 border border-red-200"
                                          : event.eventType === "contract"
                                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                                            : event.eventType === "option"
                                            ? "bg-green-100 text-green-800 border border-green-200"
                                            : event.eventType === "out"
                                              ? "bg-gray-100 text-gray-800 border border-gray-200"
                                              : event.eventType === "casting"
                                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                : "bg-gray-100 text-gray-800 border border-gray-200"
                                      }`}
                                    >
                                      <p className="font-medium truncate">{event.title}</p>
                                      {event.startTime && <p className="text-[10px] mt-0.5">{event.startTime}</p>}
                                      {(() => {
                                        // Show agency name for contract events, client name for other events
                                        if (event.eventType === "contract" && event.clientName) {
                                          return <p className="text-[10px] mt-0.5 truncate">{event.clientName}</p>;
                                        } else if (event.eventType === "option" && event.optionClient) {
                                          return <p className="text-[10px] mt-0.5 truncate">{event.optionClient}</p>;
                                        } else if (event.clientName) {
                                          return <p className="text-[10px] mt-0.5 truncate">{event.clientName}</p>;
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  ) : calendarViewMode === "month" ? (
                    (() => {
                      const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
                      const monthEnd = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
                      monthStart.setHours(0, 0, 0, 0);
                      monthEnd.setHours(23, 59, 59, 999);

                      let monthEvents = calendarEvents.filter((event: any) => {
                        const eventDate = new Date(event.startDate);
                        return eventDate >= monthStart && eventDate <= monthEnd;
                      });

                      // Apply filters
                      if (calendarFilters.eventType) {
                        monthEvents = monthEvents.filter((e: any) => e.eventType === calendarFilters.eventType);
                      }
                      if (calendarFilters.clientName) {
                        const clientLower = calendarFilters.clientName.toLowerCase();
                        monthEvents = monthEvents.filter(
                          (e: any) =>
                            e.clientName?.toLowerCase().includes(clientLower) ||
                            e.optionClient?.toLowerCase().includes(clientLower)
                        );
                      }
                      if (calendarFilters.modelId) {
                        monthEvents = monthEvents.filter((e: any) => e.modelId === calendarFilters.modelId);
                      }

                      // Get first day of month and what day of week it falls on
                      const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
                      const startingDayOfWeek = firstDay.getDay();
                      const daysInMonth = monthEnd.getDate();

                      // Create calendar grid (6 weeks × 7 days = 42 cells)
                      const calendarDays = [];
                      // Add empty cells for days before month starts
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        calendarDays.push(null);
                      }
                      // Add days of the month
                      for (let i = 1; i <= daysInMonth; i++) {
                        calendarDays.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i));
                      }
                      // Fill remaining cells to complete grid
                      while (calendarDays.length < 42) {
                        calendarDays.push(null);
                      }

                      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

                      return (
                        <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 overflow-hidden">
                          <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
                            {weekDays.map((day) => (
                              <div key={day} className="border-r border-[var(--border-color)] last:border-r-0 p-3 text-center">
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{day}</p>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7">
                            {calendarDays.map((day, idx) => {
                              if (!day) {
                                return <div key={idx} className="border-r border-b border-[var(--border-color)] last:border-r-0 min-h-[100px] p-2 bg-gray-50/50" />;
                              }

                              const dayEvents = monthEvents.filter((event: any) => {
                                const eventStart = new Date(event.startDate);
                                eventStart.setHours(0, 0, 0, 0);
                                const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                                eventEnd.setHours(23, 59, 59, 999);
                                const dayStart = new Date(day);
                                dayStart.setHours(0, 0, 0, 0);
                                const dayEnd = new Date(day);
                                dayEnd.setHours(23, 59, 59, 999);
                                // Event shows on this day if the day overlaps with the event's date range
                                return dayStart <= eventEnd && dayEnd >= eventStart;
                              });

                              const isToday = day.toDateString() === new Date().toDateString();

                              return (
                                <div
                                  key={idx}
                                  className={`border-r border-b border-[var(--border-color)] last:border-r-0 min-h-[100px] p-2 cursor-pointer hover:bg-gray-50/50 transition ${
                                    isToday ? "bg-blue-50/50" : ""
                                  }`}
                                  onClick={() => {
                                    const dateStr = day.toISOString().split("T")[0];
                                    setEventForm({
                                      modelId: "",
                                      eventType: "job",
                                      title: "",
                                      startDate: dateStr,
                                      endDate: "",
                                      startTime: "",
                                      endTime: "",
                                      clientName: "",
                                      location: "",
                                      callTime: "",
                                      duration: "",
                                      notes: "",
                                      availabilityStatus: "available",
                                      optionExpiry: "",
                                      optionPriority: "1st",
                                      optionClient: "",
                                    });
                                    setEditingEvent(null);
                                    setShowEventForm(true);
                                  }}
                                >
                                  <p
                                    className={`text-sm font-medium mb-1 ${
                                      isToday ? "text-blue-600" : day.getMonth() !== calendarDate.getMonth() ? "text-[var(--muted)]" : "text-[var(--foreground)]"
                                    }`}
                                  >
                                    {day.getDate()}
                                  </p>
                                  <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event: any) => (
                                      <div
                                        key={event.id}
                                        onMouseEnter={(e) => {
                                          setHoveredEvent(event);
                                          setHoverPosition({ x: e.clientX, y: e.clientY });
                                        }}
                                        onMouseMove={(e) => {
                                          setHoverPosition({ x: e.clientX, y: e.clientY });
                                        }}
                                        onMouseLeave={() => setHoveredEvent(null)}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEventForm({
                                            modelId: event.modelId,
                                            eventType: event.eventType,
                                            title: event.title,
                                            startDate: event.startDate,
                                            endDate: event.endDate || "",
                                            startTime: event.startTime || "",
                                            endTime: event.endTime || "",
                                            clientName: event.clientName || "",
                                            location: event.location || "",
                                            callTime: event.callTime || "",
                                            duration: event.duration || "",
                                            notes: event.notes || "",
                                            availabilityStatus: event.availabilityStatus || "available",
                                            optionExpiry: event.optionExpiry || "",
                                            optionPriority: event.optionPriority || "1st",
                                            optionClient: event.optionClient || "",
                                          });
                                          setEditingEvent(event);
                                          setShowEventForm(true);
                                        }}
                                        className={`rounded px-1.5 py-0.5 text-[10px] cursor-pointer hover:opacity-80 truncate ${
                                          event.eventType === "job"
                                            ? "bg-red-100 text-red-800"
                                            : event.eventType === "contract"
                                              ? "bg-blue-100 text-blue-800"
                                              : event.eventType === "option"
                                              ? "bg-green-100 text-green-800"
                                              : event.eventType === "out"
                                                ? "bg-gray-100 text-gray-800"
                                                : event.eventType === "casting"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {event.startTime ? `${event.startTime} ` : ""}
                                        {event.title}
                                      </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                      <p className="text-[10px] text-[var(--muted)]">+{dayEvents.length - 3} more</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  ) : calendarViewMode === "list" ? (
                    (() => {
                      // List view: show all events sorted by date
                      let listEvents = [...calendarEvents];

                      // Apply filters
                      if (calendarFilters.eventType) {
                        listEvents = listEvents.filter((e: any) => e.eventType === calendarFilters.eventType);
                      }
                      if (calendarFilters.clientName) {
                        const clientLower = calendarFilters.clientName.toLowerCase();
                        listEvents = listEvents.filter(
                          (e: any) =>
                            e.clientName?.toLowerCase().includes(clientLower) ||
                            e.optionClient?.toLowerCase().includes(clientLower)
                        );
                      }
                      if (calendarFilters.modelId) {
                        listEvents = listEvents.filter((e: any) => e.modelId === calendarFilters.modelId);
                      }

                      // Sort by date and time
                      listEvents.sort((a: any, b: any) => {
                        const dateA = new Date(a.startDate).getTime();
                        const dateB = new Date(b.startDate).getTime();
                        if (dateA !== dateB) return dateA - dateB;
                        const timeA = a.startTime ? a.startTime : "00:00";
                        const timeB = b.startTime ? b.startTime : "00:00";
                        return timeA.localeCompare(timeB);
                      });

                      // Group events by date
                      const eventsByDate: Record<string, any[]> = {};
                      listEvents.forEach((event: any) => {
                        const dateKey = new Date(event.startDate).toDateString();
                        if (!eventsByDate[dateKey]) {
                          eventsByDate[dateKey] = [];
                        }
                        eventsByDate[dateKey].push(event);
                      });

                      const sortedDates = Object.keys(eventsByDate).sort(
                        (a, b) => new Date(a).getTime() - new Date(b).getTime()
                      );

                      if (sortedDates.length === 0) {
                        return (
                          <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6">
                            <p className="text-sm text-[var(--muted)]">No events found.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {sortedDates.map((dateKey) => {
                            const date = new Date(dateKey);
                            const dayEvents = eventsByDate[dateKey];
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                              <div
                                key={dateKey}
                                className={`rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4 ${
                                  isToday ? "border-blue-300 bg-blue-50/50" : ""
                                }`}
                              >
                                <h4
                                  className={`mb-3 text-sm font-medium uppercase tracking-[0.3em] ${
                                    isToday ? "text-blue-600" : "text-[var(--muted)]"
                                  }`}
                                >
                                  {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                </h4>
                                <div className="space-y-2">
                                  {dayEvents.map((event: any) => (
                                    <div
                                      key={event.id}
                                      onMouseEnter={(e) => {
                                        setHoveredEvent(event);
                                        setHoverPosition({ x: e.clientX, y: e.clientY });
                                      }}
                                      onMouseMove={(e) => {
                                        setHoverPosition({ x: e.clientX, y: e.clientY });
                                      }}
                                      onMouseLeave={() => setHoveredEvent(null)}
                                      onClick={() => {
                                        setEventForm({
                                          modelId: event.modelId,
                                          eventType: event.eventType,
                                          title: event.title,
                                          startDate: event.startDate,
                                          endDate: event.endDate || "",
                                          startTime: event.startTime || "",
                                          endTime: event.endTime || "",
                                          clientName: event.clientName || "",
                                          location: event.location || "",
                                          callTime: event.callTime || "",
                                          duration: event.duration || "",
                                          notes: event.notes || "",
                                          availabilityStatus: event.availabilityStatus || "available",
                                          optionExpiry: event.optionExpiry || "",
                                          optionPriority: event.optionPriority || "1st",
                                          optionClient: event.optionClient || "",
                                        });
                                        setEditingEvent(event);
                                        setShowEventForm(true);
                                      }}
                                      className="flex items-start gap-3 rounded-lg border border-[var(--border-color)] bg-white/90 p-3 cursor-pointer hover:border-black transition"
                                    >
                                      <div className="flex-shrink-0">
                                        <span
                                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] ${
                                              event.eventType === "job"
                                                ? "bg-red-100 text-red-700"
                                                : event.eventType === "contract"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : event.eventType === "option"
                                                  ? "bg-green-100 text-green-700"
                                                  : event.eventType === "out"
                                                    ? "bg-gray-100 text-gray-700"
                                                    : event.eventType === "casting"
                                                      ? "bg-blue-100 text-blue-700"
                                                      : event.eventType === "availability"
                                                        ? event.availabilityStatus === "available"
                                                          ? "bg-green-100 text-green-700"
                                                          : event.availabilityStatus === "not_available"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {event.eventType}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-medium truncate">{event.title}</h5>
                                            {(() => {
                                              const model = models.find((m) => m.id === event.modelId);
                                              return model ? <p className="text-sm text-[var(--muted)] mt-0.5">{model.name}</p> : null;
                                            })()}
                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                                              {event.startTime && event.eventType !== "contract" && (
                                                <span>
                                                  {event.startTime}
                                                  {event.endTime ? ` - ${event.endTime}` : ""}
                                                </span>
                                              )}
                                              {event.clientName && <span>{event.eventType === "contract" ? "Agency" : "Client"}: {event.clientName}</span>}
                                              {event.location && <span>Location: {event.location}</span>}
                                              {event.callTime && event.eventType !== "contract" && <span>Call: {event.callTime}</span>}
                                            </div>
                                            {event.notes && (
                                              <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">{event.notes}</p>
                                            )}
                                            {event.eventType === "option" && event.optionExpiry && (
                                              <p
                                                className={`mt-1 text-xs ${
                                                  new Date(event.optionExpiry) < new Date()
                                                    ? "font-bold text-red-600"
                                                    : new Date(event.optionExpiry) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                      ? "font-semibold text-amber-600"
                                                      : "text-amber-600"
                                                }`}
                                              >
                                                {new Date(event.optionExpiry) < new Date() ? "⚠️ EXPIRED: " : "⏰ Expires: "}
                                                {new Date(event.optionExpiry).toLocaleDateString()}
                                                {event.optionPriority && ` (${event.optionPriority} option)`}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <select
                  value={selectedCalendarModel || ""}
                  onChange={(e) => {
                    setSelectedCalendarModel(e.target.value || null);
                    if (e.target.value) {
                      // Load events for selected model based on current view mode
                      loadCalendarEvents(calendarDate, calendarViewMode);
                    } else {
                      setCalendarEvents([]);
                    }
                  }}
                  className="rounded-full border border-[var(--border-color)] bg-white/90 px-4 py-2 text-sm"
                >
                  <option value="">Select a model...</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCalendarModel ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (calendarViewMode === "list") return; // No navigation for list view
                            const prev = new Date(calendarDate);
                            if (calendarViewMode === "day") {
                              prev.setDate(prev.getDate() - 1);
                            } else if (calendarViewMode === "week") {
                              prev.setDate(prev.getDate() - 7);
                            } else {
                              prev.setMonth(prev.getMonth() - 1);
                            }
                            setCalendarDate(prev);
                            loadCalendarEvents(prev, calendarViewMode);
                          }}
                          className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-sm uppercase tracking-[0.3em] hover:border-black"
                        >
                          ←
                        </button>
                        <h3 className="text-lg font-medium min-w-[200px] text-center">
                          {calendarViewMode === "day"
                            ? calendarDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                            : calendarViewMode === "week"
                              ? (() => {
                                  const weekStart = new Date(calendarDate);
                                  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                                  const weekEnd = new Date(weekStart);
                                  weekEnd.setDate(weekEnd.getDate() + 6);
                                  return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
                                })()
                              : calendarViewMode === "list"
                                ? "All Events"
                                : calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </h3>
                        <button
                          onClick={() => {
                            if (calendarViewMode === "list") return; // No navigation for list view
                            const next = new Date(calendarDate);
                            if (calendarViewMode === "day") {
                              next.setDate(next.getDate() + 1);
                            } else if (calendarViewMode === "week") {
                              next.setDate(next.getDate() + 7);
                            } else {
                              next.setMonth(next.getMonth() + 1);
                            }
                            setCalendarDate(next);
                            loadCalendarEvents(next, calendarViewMode);
                          }}
                          className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-sm uppercase tracking-[0.3em] hover:border-black"
                        >
                          →
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            setCalendarDate(today);
                            loadCalendarEvents(today, calendarViewMode);
                          }}
                          className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-xs uppercase tracking-[0.3em] hover:border-black"
                        >
                          Today
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCalendarViewMode("day");
                            loadCalendarEvents(calendarDate, "day");
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                            calendarViewMode === "day"
                              ? "border-black bg-black text-white"
                              : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                          }`}
                        >
                          Day
                        </button>
                        <button
                          onClick={() => {
                            setCalendarViewMode("week");
                            loadCalendarEvents(calendarDate, "week");
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                            calendarViewMode === "week"
                              ? "border-black bg-black text-white"
                              : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                          }`}
                        >
                          Week
                        </button>
                        <button
                          onClick={() => {
                            setCalendarViewMode("month");
                            loadCalendarEvents(calendarDate, "month");
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                            calendarViewMode === "month"
                              ? "border-black bg-black text-white"
                              : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                          }`}
                        >
                          Month
                        </button>
                        <button
                          onClick={() => {
                            setCalendarViewMode("list");
                            loadCalendarEvents(calendarDate, "list");
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                            calendarViewMode === "list"
                              ? "border-black bg-black text-white"
                              : "border-[var(--border-color)] bg-white/90 text-[var(--muted)] hover:border-black"
                          }`}
                        >
                          List
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEventForm({
                          modelId: selectedCalendarModel,
                          eventType: "availability",
                          title: "",
                          startDate: calendarDate.toISOString().split("T")[0],
                          endDate: "",
                          startTime: "",
                          endTime: "",
                          clientName: "",
                          location: "",
                          callTime: "",
                          duration: "",
                          notes: "",
                          availabilityStatus: "available",
                          optionExpiry: "",
                          optionPriority: "1st",
                          optionClient: "",
                        });
                        setEditingEvent(null);
                        setShowEventForm(true);
                      }}
                      className="rounded-full bg-black px-4 py-2 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-black/80"
                    >
                      + Add Event
                    </button>
                  </div>

                  <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4">
                    <h4 className="mb-3 text-base font-medium">
                      {models.find((m) => m.id === selectedCalendarModel)?.name}'s Calendar
                    </h4>
                    {calendarLoading ? (
                      <p className="text-sm text-[var(--muted)]">Loading calendar...</p>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const modelEvents = calendarEvents.filter((e: any) => e.modelId === selectedCalendarModel);
                          
                          if (calendarViewMode === "day") {
                            const dayStart = new Date(calendarDate);
                            dayStart.setHours(0, 0, 0, 0);
                            const dayEnd = new Date(calendarDate);
                            dayEnd.setHours(23, 59, 59, 999);
                            const dayEvents = modelEvents.filter((event: any) => {
                              const eventDate = new Date(event.startDate);
                              return eventDate >= dayStart && eventDate <= dayEnd;
                            });

                            if (dayEvents.length === 0) {
                              return (
                                <div 
                                  className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6 cursor-pointer hover:bg-white/90 transition"
                                  onClick={() => {
                                    setEventForm({
                                      modelId: selectedCalendarModel,
                                      eventType: "availability",
                                      title: "",
                                      startDate: calendarDate.toISOString().split("T")[0],
                                      endDate: "",
                                      startTime: "",
                                      endTime: "",
                                      clientName: "",
                                      location: "",
                                      callTime: "",
                                      duration: "",
                                      notes: "",
                                      availabilityStatus: "available",
                                      optionExpiry: "",
                                      optionPriority: "1st",
                                      optionClient: "",
                                    });
                                    setEditingEvent(null);
                                    setShowEventForm(true);
                                  }}
                                >
                                  <p className="text-sm text-[var(--muted)]">No events scheduled for this day. Click to add an event.</p>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3">
                                {dayEvents.map((event: any) => (
                                  <div
                                    key={event.id}
                                    onMouseEnter={(e) => {
                                      setHoveredEvent(event);
                                      setHoverPosition({ x: e.clientX, y: e.clientY });
                                    }}
                                    onMouseMove={(e) => {
                                      setHoverPosition({ x: e.clientX, y: e.clientY });
                                    }}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                  >
                                    {renderEventCard(event)}
                                  </div>
                                ))}
                              </div>
                            );
                          } else if (calendarViewMode === "week") {
                            const weekStart = new Date(calendarDate);
                            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                            weekStart.setHours(0, 0, 0, 0);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekEnd.getDate() + 6);
                            weekEnd.setHours(23, 59, 59, 999);

                            let weekEvents = modelEvents.filter((event: any) => {
                              const eventDate = new Date(event.startDate);
                              return eventDate >= weekStart && eventDate <= weekEnd;
                            });

                            // Apply filters
                            if (calendarFilters.eventType) {
                              weekEvents = weekEvents.filter((e: any) => e.eventType === calendarFilters.eventType);
                            }
                            if (calendarFilters.clientName) {
                              const clientLower = calendarFilters.clientName.toLowerCase();
                              weekEvents = weekEvents.filter(
                                (e: any) =>
                                  e.clientName?.toLowerCase().includes(clientLower) ||
                                  e.optionClient?.toLowerCase().includes(clientLower)
                              );
                            }

                            const days = [];
                            for (let i = 0; i < 7; i++) {
                              const day = new Date(weekStart);
                              day.setDate(day.getDate() + i);
                              days.push(day);
                            }

                            return (
                              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 overflow-hidden">
                                <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
                                  {days.map((day, idx) => (
                                    <div key={idx} className="border-r border-[var(--border-color)] last:border-r-0 p-3 text-center">
                                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                                      </p>
                                      <p className={`mt-1 text-lg font-medium ${day.toDateString() === new Date().toDateString() ? "text-black" : "text-[var(--foreground)]"}`}>
                                        {day.getDate()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-7 min-h-[400px]">
                                  {days.map((day, idx) => {
                                    const dayEvents = weekEvents.filter((event: any) => {
                                      const eventDate = new Date(event.startDate);
                                      return eventDate.toDateString() === day.toDateString();
                                    });

                                    return (
                                      <div 
                                        key={idx} 
                                        className="border-r border-[var(--border-color)] last:border-r-0 p-2 space-y-1 cursor-pointer hover:bg-gray-50/50 transition min-h-[60px]"
                                        onClick={() => {
                                          const dateStr = day.toISOString().split("T")[0];
                                          setEventForm({
                                            modelId: selectedCalendarModel,
                                            eventType: "availability",
                                            title: "",
                                            startDate: dateStr,
                                            endDate: "",
                                            startTime: "",
                                            endTime: "",
                                            clientName: "",
                                            location: "",
                                            callTime: "",
                                            duration: "",
                                            notes: "",
                                            availabilityStatus: "available",
                                            optionExpiry: "",
                                            optionPriority: "1st",
                                            optionClient: "",
                                          });
                                          setEditingEvent(null);
                                          setShowEventForm(true);
                                        }}
                                      >
                                        {dayEvents.map((event: any) => (
                                          <div
                                            key={event.id}
                                            onMouseEnter={(e) => {
                                              setHoveredEvent(event);
                                              setHoverPosition({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseMove={(e) => {
                                              setHoverPosition({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseLeave={() => setHoveredEvent(null)}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEventForm({
                                                modelId: event.modelId,
                                                eventType: event.eventType,
                                                title: event.title,
                                                startDate: event.startDate,
                                                endDate: event.endDate || "",
                                                startTime: event.startTime || "",
                                                endTime: event.endTime || "",
                                                clientName: event.clientName || "",
                                                location: event.location || "",
                                                callTime: event.callTime || "",
                                                duration: event.duration || "",
                                                notes: event.notes || "",
                                                availabilityStatus: event.availabilityStatus || "available",
                                                optionExpiry: event.optionExpiry || "",
                                                optionPriority: event.optionPriority || "1st",
                                                optionClient: event.optionClient || "",
                                              });
                                              setEditingEvent(event);
                                              setShowEventForm(true);
                                            }}
                                            className={`rounded-lg p-2 text-xs cursor-pointer hover:opacity-80 ${
                                              event.eventType === "job"
                                                ? "bg-red-100 text-red-800 border border-red-200"
                                                : event.eventType === "option"
                                                  ? "bg-green-100 text-green-800 border border-green-200"
                                                  : event.eventType === "out"
                                                    ? "bg-gray-100 text-gray-800 border border-gray-200"
                                                    : event.eventType === "casting"
                                                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                      : "bg-gray-100 text-gray-800 border border-gray-200"
                                            }`}
                                          >
                                            <p className="font-medium truncate">{event.title}</p>
                                            {event.startTime && <p className="text-[10px] mt-0.5">{event.startTime}</p>}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          } else if (calendarViewMode === "month") {
                            // Month view
                            const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
                            const monthEnd = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
                            monthStart.setHours(0, 0, 0, 0);
                            monthEnd.setHours(23, 59, 59, 999);

                            let monthEvents = modelEvents.filter((event: any) => {
                              const eventDate = new Date(event.startDate);
                              return eventDate >= monthStart && eventDate <= monthEnd;
                            });

                            // Apply filters
                            if (calendarFilters.eventType) {
                              monthEvents = monthEvents.filter((e: any) => e.eventType === calendarFilters.eventType);
                            }
                            if (calendarFilters.clientName) {
                              const clientLower = calendarFilters.clientName.toLowerCase();
                              monthEvents = monthEvents.filter(
                                (e: any) =>
                                  e.clientName?.toLowerCase().includes(clientLower) ||
                                  e.optionClient?.toLowerCase().includes(clientLower)
                              );
                            }

                            const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
                            const startingDayOfWeek = firstDay.getDay();
                            const daysInMonth = monthEnd.getDate();

                            const calendarDays = [];
                            for (let i = 0; i < startingDayOfWeek; i++) {
                              calendarDays.push(null);
                            }
                            for (let i = 1; i <= daysInMonth; i++) {
                              calendarDays.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i));
                            }
                            while (calendarDays.length < 42) {
                              calendarDays.push(null);
                            }

                            const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

                            return (
                              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 overflow-hidden">
                                <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
                                  {weekDays.map((day) => (
                                    <div key={day} className="border-r border-[var(--border-color)] last:border-r-0 p-3 text-center">
                                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{day}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-7">
                                  {calendarDays.map((day, idx) => {
                                    if (!day) {
                                      return <div key={idx} className="border-r border-b border-[var(--border-color)] last:border-r-0 min-h-[100px] p-2 bg-gray-50/50" />;
                                    }

                                    const dayEvents = monthEvents.filter((event: any) => {
                                      const eventDate = new Date(event.startDate);
                                      return eventDate.toDateString() === day.toDateString();
                                    });

                                    const isToday = day.toDateString() === new Date().toDateString();

                                    return (
                                      <div
                                        key={idx}
                                        className={`border-r border-b border-[var(--border-color)] last:border-r-0 min-h-[100px] p-2 cursor-pointer hover:bg-gray-50/50 transition ${
                                          isToday ? "bg-blue-50/50" : ""
                                        }`}
                                        onClick={() => {
                                          const dateStr = day.toISOString().split("T")[0];
                                          setEventForm({
                                            modelId: selectedCalendarModel,
                                            eventType: "availability",
                                            title: "",
                                            startDate: dateStr,
                                            endDate: "",
                                            startTime: "",
                                            endTime: "",
                                            clientName: "",
                                            location: "",
                                            callTime: "",
                                            duration: "",
                                            notes: "",
                                            availabilityStatus: "available",
                                            optionExpiry: "",
                                            optionPriority: "1st",
                                            optionClient: "",
                                          });
                                          setEditingEvent(null);
                                          setShowEventForm(true);
                                        }}
                                      >
                                        <p
                                          className={`text-sm font-medium mb-1 ${
                                            isToday ? "text-blue-600" : day.getMonth() !== calendarDate.getMonth() ? "text-[var(--muted)]" : "text-[var(--foreground)]"
                                          }`}
                                        >
                                          {day.getDate()}
                                        </p>
                                        <div className="space-y-1">
                                          {dayEvents.slice(0, 3).map((event: any) => (
                                            <div
                                              key={event.id}
                                              onMouseEnter={(e) => {
                                                setHoveredEvent(event);
                                                setHoverPosition({ x: e.clientX, y: e.clientY });
                                              }}
                                              onMouseMove={(e) => {
                                                setHoverPosition({ x: e.clientX, y: e.clientY });
                                              }}
                                              onMouseLeave={() => setHoveredEvent(null)}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEventForm({
                                                  modelId: event.modelId,
                                                  eventType: event.eventType,
                                                  title: event.title,
                                                  startDate: event.startDate,
                                                  endDate: event.endDate || "",
                                                  startTime: event.startTime || "",
                                                  endTime: event.endTime || "",
                                                  clientName: event.clientName || "",
                                                  location: event.location || "",
                                                  callTime: event.callTime || "",
                                                  duration: event.duration || "",
                                                  notes: event.notes || "",
                                                  availabilityStatus: event.availabilityStatus || "available",
                                                  optionExpiry: event.optionExpiry || "",
                                                  optionPriority: event.optionPriority || "1st",
                                                  optionClient: event.optionClient || "",
                                                });
                                                setEditingEvent(event);
                                                setShowEventForm(true);
                                              }}
                                              className={`rounded px-1.5 py-0.5 text-[10px] cursor-pointer hover:opacity-80 truncate ${
                                                event.eventType === "job"
                                                  ? "bg-red-100 text-red-800"
                                                  : event.eventType === "option"
                                                    ? "bg-green-100 text-green-800"
                                                    : event.eventType === "out"
                                                      ? "bg-gray-100 text-gray-800"
                                                      : event.eventType === "casting"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                              }`}
                                            >
                                              {event.startTime ? `${event.startTime} ` : ""}
                                              {event.title}
                                            </div>
                                          ))}
                                          {dayEvents.length > 3 && (
                                            <p className="text-[10px] text-[var(--muted)]">+{dayEvents.length - 3} more</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          } else {
                            // List view for model calendar
                            let listEvents = [...modelEvents];

                            // Apply filters
                            if (calendarFilters.eventType) {
                              listEvents = listEvents.filter((e: any) => e.eventType === calendarFilters.eventType);
                            }
                            if (calendarFilters.clientName) {
                              const clientLower = calendarFilters.clientName.toLowerCase();
                              listEvents = listEvents.filter(
                                (e: any) =>
                                  e.clientName?.toLowerCase().includes(clientLower) ||
                                  e.optionClient?.toLowerCase().includes(clientLower)
                              );
                            }

                            // Sort by date and time
                            listEvents.sort((a: any, b: any) => {
                              const dateA = new Date(a.startDate).getTime();
                              const dateB = new Date(b.startDate).getTime();
                              if (dateA !== dateB) return dateA - dateB;
                              const timeA = a.startTime ? a.startTime : "00:00";
                              const timeB = b.startTime ? b.startTime : "00:00";
                              return timeA.localeCompare(timeB);
                            });

                            // Group events by date
                            const eventsByDate: Record<string, any[]> = {};
                            listEvents.forEach((event: any) => {
                              const dateKey = new Date(event.startDate).toDateString();
                              if (!eventsByDate[dateKey]) {
                                eventsByDate[dateKey] = [];
                              }
                              eventsByDate[dateKey].push(event);
                            });

                            const sortedDates = Object.keys(eventsByDate).sort(
                              (a, b) => new Date(a).getTime() - new Date(b).getTime()
                            );

                            if (sortedDates.length === 0) {
                              return (
                                <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6">
                                  <p className="text-sm text-[var(--muted)]">No events found.</p>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-4">
                                {sortedDates.map((dateKey) => {
                                  const date = new Date(dateKey);
                                  const dayEvents = eventsByDate[dateKey];
                                  const isToday = date.toDateString() === new Date().toDateString();

                                  return (
                                    <div
                                      key={dateKey}
                                      className={`rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4 ${
                                        isToday ? "border-blue-300 bg-blue-50/50" : ""
                                      }`}
                                    >
                                      <h4
                                        className={`mb-3 text-sm font-medium uppercase tracking-[0.3em] ${
                                          isToday ? "text-blue-600" : "text-[var(--muted)]"
                                        }`}
                                      >
                                        {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                      </h4>
                                      <div className="space-y-2">
                                        {dayEvents.map((event: any) => (
                                          <div
                                            key={event.id}
                                            onMouseEnter={(e) => {
                                              setHoveredEvent(event);
                                              setHoverPosition({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseMove={(e) => {
                                              setHoverPosition({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseLeave={() => setHoveredEvent(null)}
                                            onClick={() => {
                                              setEventForm({
                                                modelId: event.modelId,
                                                eventType: event.eventType,
                                                title: event.title,
                                                startDate: event.startDate,
                                                endDate: event.endDate || "",
                                                startTime: event.startTime || "",
                                                endTime: event.endTime || "",
                                                clientName: event.clientName || "",
                                                location: event.location || "",
                                                callTime: event.callTime || "",
                                                duration: event.duration || "",
                                                notes: event.notes || "",
                                                availabilityStatus: event.availabilityStatus || "available",
                                                optionExpiry: event.optionExpiry || "",
                                                optionPriority: event.optionPriority || "1st",
                                                optionClient: event.optionClient || "",
                                              });
                                              setEditingEvent(event);
                                              setShowEventForm(true);
                                            }}
                                            className="flex items-start gap-3 rounded-lg border border-[var(--border-color)] bg-white/90 p-3 cursor-pointer hover:border-black transition"
                                          >
                                            <div className="flex-shrink-0">
                                              <span
                                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] ${
                                              event.eventType === "job"
                                                ? "bg-red-100 text-red-700"
                                                : event.eventType === "contract"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : event.eventType === "option"
                                                  ? "bg-green-100 text-green-700"
                                                  : event.eventType === "out"
                                                    ? "bg-gray-100 text-gray-700"
                                                    : event.eventType === "casting"
                                                      ? "bg-blue-100 text-blue-700"
                                                      : event.eventType === "availability"
                                                        ? event.availabilityStatus === "available"
                                                          ? "bg-green-100 text-green-700"
                                                          : event.availabilityStatus === "not_available"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                              >
                                                {event.eventType}
                                              </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h5 className="font-medium truncate">{event.title}</h5>
                                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                                                {event.startTime && (
                                                  <span>
                                                    {event.startTime}
                                                    {event.endTime ? ` - ${event.endTime}` : ""}
                                                  </span>
                                                )}
                                                {event.clientName && <span>{event.eventType === "contract" ? "Agency" : "Client"}: {event.clientName}</span>}
                                                {event.location && <span>Location: {event.location}</span>}
                                                {event.callTime && <span>Call: {event.callTime}</span>}
                                              </div>
                                              {event.notes && (
                                                <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">{event.notes}</p>
                                              )}
                                              {event.eventType === "option" && event.optionExpiry && (
                                                <p
                                                  className={`mt-1 text-xs ${
                                                    new Date(event.optionExpiry) < new Date()
                                                      ? "font-bold text-red-600"
                                                      : new Date(event.optionExpiry) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                        ? "font-semibold text-amber-600"
                                                        : "text-amber-600"
                                                  }`}
                                                >
                                                  {new Date(event.optionExpiry) < new Date() ? "⚠️ EXPIRED: " : "⏰ Expires: "}
                                                  {new Date(event.optionExpiry).toLocaleDateString()}
                                                  {event.optionPriority && ` (${event.optionPriority} option)`}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6">
                  <p className="text-sm text-[var(--muted)]">Please select a model to view their calendar.</p>
                </div>
              )}
            </div>
          )}

          {/* Event Preview Tooltip */}
          {hoveredEvent && typeof window !== "undefined" && (
            <div
              className="fixed z-50 rounded-lg border border-[var(--border-color)] bg-white p-4 shadow-lg"
              style={{
                left: `${Math.min(hoverPosition.x + 15, window.innerWidth - 320)}px`,
                top: `${Math.min(hoverPosition.y + 15, window.innerHeight - 200)}px`,
                maxWidth: "300px",
                pointerEvents: "none",
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] ${
                      hoveredEvent.eventType === "job"
                        ? "bg-red-100 text-red-700"
                        : hoveredEvent.eventType === "contract"
                          ? "bg-blue-100 text-blue-700"
                          : hoveredEvent.eventType === "option"
                          ? "bg-green-100 text-green-700"
                          : hoveredEvent.eventType === "out"
                            ? "bg-gray-100 text-gray-700"
                            : hoveredEvent.eventType === "casting"
                              ? "bg-blue-100 text-blue-700"
                              : hoveredEvent.eventType === "availability"
                                ? hoveredEvent.availabilityStatus === "available"
                                  ? "bg-green-100 text-green-700"
                                  : hoveredEvent.availabilityStatus === "not_available"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {hoveredEvent.eventType}
                  </span>
                  <h4 className="font-medium text-sm">{hoveredEvent.title}</h4>
                </div>
                {(() => {
                  const model = models.find((m) => m.id === hoveredEvent.modelId);
                  return model ? <p className="text-xs text-[var(--muted)]">Model: {model.name}</p> : null;
                })()}
                {hoveredEvent.clientName && (
                  <p className="text-xs text-[var(--foreground)]">{hoveredEvent.eventType === "contract" ? "Agency" : "Client"}: {hoveredEvent.clientName}</p>
                )}
                {hoveredEvent.optionClient && (
                  <p className="text-xs text-[var(--foreground)]">Option Client: {hoveredEvent.optionClient}</p>
                )}
                {hoveredEvent.location && (
                  <p className="text-xs text-[var(--foreground)]">Location: {hoveredEvent.location}</p>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-[var(--foreground)]">
                    Date: {new Date(hoveredEvent.startDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {hoveredEvent.startTime && hoveredEvent.eventType !== "contract" && (
                    <p className="text-xs text-[var(--foreground)]">
                      Time: {hoveredEvent.startTime}
                      {hoveredEvent.endTime ? ` - ${hoveredEvent.endTime}` : ""}
                    </p>
                  )}
                  {hoveredEvent.callTime && hoveredEvent.eventType !== "contract" && (
                    <p className="text-xs text-[var(--foreground)]">Call time: {hoveredEvent.callTime}</p>
                  )}
                  {hoveredEvent.duration && hoveredEvent.eventType !== "contract" && (
                    <p className="text-xs text-[var(--foreground)]">Duration: {hoveredEvent.duration}</p>
                  )}
                </div>
                {hoveredEvent.eventType === "option" && hoveredEvent.optionExpiry && (
                  <p
                    className={`text-xs ${
                      new Date(hoveredEvent.optionExpiry) < new Date()
                        ? "font-bold text-red-600"
                        : new Date(hoveredEvent.optionExpiry) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          ? "font-semibold text-amber-600"
                          : "text-amber-600"
                    }`}
                  >
                    {new Date(hoveredEvent.optionExpiry) < new Date() ? "⚠️ EXPIRED: " : "⏰ Expires: "}
                    {new Date(hoveredEvent.optionExpiry).toLocaleDateString()}
                    {hoveredEvent.optionPriority && ` (${hoveredEvent.optionPriority} option)`}
                  </p>
                )}
                {hoveredEvent.notes && (
                  <p className="mt-2 border-t border-[var(--border-color)] pt-2 text-xs text-[var(--muted)]">
                    {hoveredEvent.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Event Form Modal */}
          {showEventForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-[24px] border border-[var(--border-color)] bg-white p-6 max-h-[90vh] overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium tracking-[0.1em]">
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
                      setEventConflicts([]);
                      setContractCityInput("");
                    }}
                    className="text-2xl text-[var(--muted)] hover:text-black"
                  >
                    ×
                  </button>
                </div>

                {eventConflicts.length > 0 && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-800">⚠️ Conflict detected!</p>
                    <p className="mt-1 text-xs text-amber-700">
                      This event conflicts with {eventConflicts.length} existing event{eventConflicts.length > 1 ? "s" : ""}:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {eventConflicts.map((conflict: any) => {
                        const conflictModel = models.find((m) => m.id === conflict.modelId);
                        return (
                          <li key={conflict.id} className="text-xs text-amber-700">
                            • {conflictModel?.name || "Unknown"} - {conflict.title} ({new Date(conflict.startDate).toLocaleDateString()}
                            {conflict.startTime ? ` at ${conflict.startTime}` : ""})
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      // Validate end date is not before start date
                      if (eventForm.endDate && eventForm.startDate) {
                        const startDate = new Date(eventForm.startDate);
                        const endDate = new Date(eventForm.endDate);
                        if (endDate < startDate) {
                          alert("End date cannot be before start date.");
                          return;
                        }
                      }

                      // Use provided title or auto-generate if empty
                      let finalTitle = eventForm.title.trim();
                      if (!finalTitle) {
                        const model = models.find((m) => m.id === eventForm.modelId);
                        const modelName = model?.name || "";
                        const eventType = eventForm.eventType.charAt(0).toUpperCase() + eventForm.eventType.slice(1);
                        const clientName = eventForm.clientName || eventForm.optionClient || "";
                        const parts = [modelName, eventType, clientName].filter(Boolean);
                        finalTitle = parts.join(" - ");
                      }

                      const url = editingEvent ? `/api/calendar/${editingEvent.id}` : "/api/calendar";
                      const method = editingEvent ? "PATCH" : "POST";
                      
                      const payload = {
                        ...eventForm,
                        title: finalTitle,
                      };
                      
                      console.log(`${method} ${url}`, { editingEvent: editingEvent?.id, payload });
                      
                      const response = await fetch(url, {
                        method,
                        headers: {
                          "Content-Type": "application/json",
                          "x-user-email": currentUserEmail,
                        },
                        body: JSON.stringify(payload),
                      });
                      
                      console.log("Response status:", response.status, response.statusText);

                      if (response.ok) {
                        const data = await response.json();
                        if (data.hasConflicts) {
                          setEventConflicts(data.conflicts || []);
                          if (!confirm("This event has conflicts. Do you want to save it anyway?")) {
                            return;
                          }
                        }

                        // Refresh events
                        loadCalendarEvents(calendarDate, calendarViewMode);

                        setShowEventForm(false);
                        setEditingEvent(null);
                        setEventConflicts([]);
                        setContractCityInput("");
                        setEventForm({
                          modelId: "",
                          eventType: "job",
                          title: "",
                          startDate: "",
                          endDate: "",
                          startTime: "",
                          endTime: "",
                          clientName: "",
                          location: "",
                          callTime: "",
                          duration: "",
                          notes: "",
                          availabilityStatus: "available",
                          optionExpiry: "",
                          optionPriority: "1st",
                          optionClient: "",
                        });

                        // Use provided title or auto-generate for logging
                        let finalTitle = eventForm.title.trim();
                        if (!finalTitle) {
                          const model = models.find((m) => m.id === eventForm.modelId);
                          const modelName = model?.name || "";
                          const eventType = eventForm.eventType.charAt(0).toUpperCase() + eventForm.eventType.slice(1);
                          const clientName = eventForm.clientName || eventForm.optionClient || "";
                          const parts = [modelName, eventType, clientName].filter(Boolean);
                          finalTitle = parts.join(" - ");
                        }

                        await logActivity(
                          editingEvent ? "calendar_event_updated" : "calendar_event_created",
                          `${editingEvent ? "Updated" : "Created"} ${eventForm.eventType} event: ${finalTitle}`,
                          {
                            eventId: editingEvent?.id || data.event?.id,
                            modelId: eventForm.modelId,
                            eventType: eventForm.eventType,
                          }
                        );
                      } else {
                        // Handle error response
                        let errorMessage = `Failed to ${editingEvent ? "update" : "create"} event`;
                        try {
                          const errorData = await response.json();
                          errorMessage = errorData.error || errorMessage;
                        } catch (e) {
                          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                        }
                        alert(errorMessage);
                        console.error("Error saving event:", errorMessage);
                      }
                    } catch (error) {
                      console.error("Error saving event:", error);
                      alert(`Failed to ${editingEvent ? "update" : "create"} event: ${error instanceof Error ? error.message : "Unknown error"}`);
                    }
                  }}
                  className="space-y-4"
                >
                  {calendarView === "model" && !selectedCalendarModel && (
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                        Model *
                      </label>
                      <select
                        value={eventForm.modelId}
                        onChange={(e) => {
                          setEventForm({ ...eventForm, modelId: e.target.value });
                        }}
                        className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        required
                      >
                        <option value="">Select a model...</option>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {calendarView === "agency" && (
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                        Model *
                      </label>
                      <select
                        value={eventForm.modelId}
                        onChange={(e) => {
                          setEventForm({ ...eventForm, modelId: e.target.value });
                        }}
                        className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        required
                      >
                        <option value="">Select a model...</option>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Event Type *
                    </label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => {
                        setEventForm({
                          ...eventForm,
                          eventType: e.target.value as any,
                        });
                      }}
                      className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                      required
                    >
                      <option value="job">Job</option>
                      <option value="contract">Contract</option>
                      <option value="option">Option</option>
                      <option value="out">Out</option>
                      <option value="casting">Casting</option>
                      <option value="travel">Travel</option>
                      <option value="availability">Availability</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Title *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={eventForm.title || (() => {
                          const model = models.find((m) => m.id === eventForm.modelId);
                          const modelName = model?.name || "";
                          const eventType = eventForm.eventType.charAt(0).toUpperCase() + eventForm.eventType.slice(1);
                          const clientName = eventForm.clientName || eventForm.optionClient || "";
                          const parts = [modelName, eventType, clientName].filter(Boolean);
                          return parts.join(" - ");
                        })()}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        onBlur={(e) => {
                          // Auto-fill if empty when blurring
                          if (!e.target.value.trim()) {
                            const model = models.find((m) => m.id === eventForm.modelId);
                            const modelName = model?.name || "";
                            const eventType = eventForm.eventType.charAt(0).toUpperCase() + eventForm.eventType.slice(1);
                            const clientName = eventForm.clientName || eventForm.optionClient || "";
                            const parts = [modelName, eventType, clientName].filter(Boolean);
                            setEventForm({ ...eventForm, title: parts.join(" - ") });
                          }
                        }}
                        placeholder="Auto-generated from model, event type, and client"
                        className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const model = models.find((m) => m.id === eventForm.modelId);
                          const modelName = model?.name || "";
                          const eventType = eventForm.eventType.charAt(0).toUpperCase() + eventForm.eventType.slice(1);
                          const clientName = eventForm.clientName || eventForm.optionClient || "";
                          const parts = [modelName, eventType, clientName].filter(Boolean);
                          setEventForm({ ...eventForm, title: parts.join(" - ") });
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] hover:text-black underline-offset-4 hover:underline"
                        title="Auto-generate title"
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={eventForm.startDate}
                        onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                        className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={eventForm.endDate}
                        min={eventForm.startDate || undefined}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          // Validate end date is not before start date
                          if (newEndDate && eventForm.startDate && new Date(newEndDate) < new Date(eventForm.startDate)) {
                            alert("End date cannot be before start date.");
                            return;
                          }
                          setEventForm({ ...eventForm, endDate: newEndDate });
                        }}
                        className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {eventForm.eventType !== "contract" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={eventForm.startTime}
                          onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                          className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={eventForm.endTime}
                          onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                          className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {eventForm.eventType === "availability" && (
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                        Availability Status
                      </label>
                      <select
                        value={eventForm.availabilityStatus}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            availabilityStatus: e.target.value as any,
                          })
                        }
                        className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                      >
                        <option value="available">Available</option>
                        <option value="not_available">Not Available</option>
                        <option value="tentative">Tentative</option>
                      </select>
                    </div>
                  )}

                  {eventForm.eventType === "option" && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                            Option Client
                          </label>
                          <input
                            type="text"
                            value={eventForm.optionClient}
                            onChange={(e) => {
                              setEventForm({ ...eventForm, optionClient: e.target.value });
                            }}
                            className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                            Option Priority
                          </label>
                          <select
                            value={eventForm.optionPriority}
                            onChange={(e) =>
                              setEventForm({
                                ...eventForm,
                                optionPriority: e.target.value as any,
                              })
                            }
                            className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                          >
                            <option value="1st">1st Option</option>
                            <option value="2nd">2nd Option</option>
                            <option value="3rd">3rd Option</option>
                            <option value="4th">4th Option</option>
                            <option value="5th">5th Option</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                          Option Expiry Date
                        </label>
                        <input
                          type="datetime-local"
                          value={eventForm.optionExpiry}
                          onChange={(e) => setEventForm({ ...eventForm, optionExpiry: e.target.value })}
                          className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        />
                      </div>
                    </>
                  )}

                  {(eventForm.eventType === "job" || eventForm.eventType === "casting") && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                          Client Name
                        </label>
                        <input
                          type="text"
                          value={eventForm.clientName}
                          onChange={(e) => {
                            setEventForm({ ...eventForm, clientName: e.target.value });
                          }}
                          className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                          Location
                        </label>
                        <input
                          type="text"
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                            Call Time
                          </label>
                          <input
                            type="time"
                            value={eventForm.callTime}
                            onChange={(e) => setEventForm({ ...eventForm, callTime: e.target.value })}
                            className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={eventForm.duration}
                            onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                            className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                            placeholder="e.g., 2 hours, Full day"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {eventForm.eventType === "contract" && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                          Agency Name
                        </label>
                        <input
                          type="text"
                          value={eventForm.clientName}
                          onChange={(e) => {
                            setEventForm({ ...eventForm, clientName: e.target.value });
                          }}
                          className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                          City
                        </label>
                        <div className="relative" ref={contractCityInputRef}>
                          <input
                            type="text"
                            value={contractCityInput}
                            onChange={(e) => {
                              const value = e.target.value;
                              setContractCityInput(value);
                              setEventForm({ ...eventForm, location: value });
                              setShowContractCitySuggestions(true);
                            }}
                            onFocus={() => setShowContractCitySuggestions(true)}
                            onKeyDown={(e) => {
                              const filtered = contractCityInput.trim()
                                ? cityOptions.filter((city) =>
                                    city.toLowerCase().includes(contractCityInput.toLowerCase())
                                  )
                                : [];
                              if (e.key === "Enter" && filtered.length > 0) {
                                e.preventDefault();
                                const selectedCity = filtered[0];
                                setContractCityInput(selectedCity);
                                setEventForm({ ...eventForm, location: selectedCity });
                                setShowContractCitySuggestions(false);
                              }
                            }}
                            placeholder="Type and select city"
                            className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                          />
                          {showContractCitySuggestions && contractCityInput.trim() && (
                            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-white shadow-lg">
                              {cityOptions
                                .filter((city) =>
                                  city.toLowerCase().includes(contractCityInput.toLowerCase())
                                )
                                .map((city) => (
                                  <button
                                    key={city}
                                    type="button"
                                    onClick={() => {
                                      setContractCityInput(city);
                                      setEventForm({ ...eventForm, location: city });
                                      setShowContractCitySuggestions(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                  >
                                    {city}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Notes
                    </label>
                    <textarea
                      value={eventForm.notes}
                      onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                      className="w-full rounded-2xl border border-[var(--border-color)] px-4 py-2 text-sm"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 rounded-full bg-black px-6 py-2 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-black/80"
                    >
                      {editingEvent ? "Update Event" : "Create Event"}
                    </button>
                    {editingEvent ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDeletePrompt({
                            visible: true,
                            message: "Are you sure you want to delete this event?",
                            action: "Delete event",
                            onConfirm: async () => {
                              try {
                                const response = await fetch(`/api/calendar/${editingEvent.id}`, {
                                  method: "DELETE",
                                  headers: { "x-user-email": currentUserEmail },
                                });
                                if (response.ok) {
                                  // Refresh events
                                  loadCalendarEvents(calendarDate, calendarViewMode);
                                  
                                  setShowEventForm(false);
                                  setEditingEvent(null);
                                  setEventConflicts([]);
                                  setEventForm({
                                    modelId: "",
                                    eventType: "job",
                                    title: "",
                                    startDate: "",
                                    endDate: "",
                                    startTime: "",
                                    endTime: "",
                                    clientName: "",
                                    location: "",
                                    callTime: "",
                                    duration: "",
                                    notes: "",
                                    availabilityStatus: "available",
                                    optionExpiry: "",
                                    optionPriority: "1st",
                                    optionClient: "",
                                  });
                                  
                                  await logActivity("calendar_event_deleted", `Deleted ${editingEvent.eventType} event: ${editingEvent.title}`, {
                                    eventId: editingEvent.id,
                                    modelId: editingEvent.modelId,
                                  });
                                } else {
                                  const errorData = await response.json().catch(() => ({}));
                                  alert(errorData.error || "Failed to delete event");
                                }
                              } catch (error) {
                                console.error("Error deleting event:", error);
                                alert("Failed to delete event");
                              }
                            },
                          });
                        }}
                        className="rounded-full border border-red-200 bg-red-50 px-6 py-2 text-sm uppercase tracking-[0.3em] text-red-600 transition hover:border-red-300 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowEventForm(false);
                          setEditingEvent(null);
                          setEventConflicts([]);
                        }}
                        className="rounded-full border border-[var(--border-color)] px-6 py-2 text-sm uppercase tracking-[0.3em] hover:border-black"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      ) : activeTab === "submissions" ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Become a model submissions</h2>
              <p className="text-sm text-[var(--muted)]">
                Review new applicants and approve them to the board.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="search"
                placeholder="Search name or city"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
              />
              <button
                onClick={refreshSubmissions}
                className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>
          {submissionsLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : (
            <div className="space-y-4">
              {submissions
                .filter((submission) => submission.status === "pending")
                .filter((submission) => {
                  if (!search.trim()) return true;
                  const query = search.toLowerCase();
                  return (
                    submission.firstName.toLowerCase().includes(query) ||
                    submission.lastName.toLowerCase().includes(query) ||
                    (submission.currentCity?.toLowerCase().includes(query) ?? false)
                  );
                })
                .map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onApprove={async () => {
                await fetch(`/api/submissions/${submission.id}/approve`, { method: "POST" });
                await logActivity("submission_approved", `Approved submission from ${submission.firstName} ${submission.lastName}`, {
                  submissionId: submission.id,
                  email: submission.email,
                });
                await refreshModels();
                await refreshSubmissions();
                setConfirmationMessage("New model added to the board.");
                setConfirmationAction("Model added");
                setConfirmationVisible(true);
              }}
              onDelete={() =>
                setDeletePrompt({
                  visible: true,
                  message: "Delete this application?",
                  action: "Delete submission",
                  onConfirm: async () => {
                    await fetch(`/api/submissions/${submission.id}`, { method: "DELETE" });
                    await logActivity("submission_deleted", `Deleted submission from ${submission.firstName} ${submission.lastName}`, {
                      submissionId: submission.id,
                      email: submission.email,
                    });
                    await refreshSubmissions();
                  },
                })
              }
              onPreview={openImagePreview}
            />
                ))}
              {submissions.filter((submission) => submission.status === "pending").length === 0 ? (
                <p className="rounded-[16px] border border-[var(--border-color)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                  No pending submissions.
                </p>
              ) : (
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {submissions.filter((submission) => submission.status === "pending").length} pending submissions
                </p>
              )}
            </div>
          )}
        </section>
      ) : activeTab === "alerts" ? (
        <section className="space-y-6">
          {/* Notifications Section */}
          {notifications.length > 0 && (
            <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium tracking-[0.1em]">
                  Recent Alerts ({notifications.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/notifications", {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            "x-user-email": currentUserEmail,
                          },
                          body: JSON.stringify({ action: "markAllRead" }),
                        });
                        if (response.ok) {
                          await refreshNotifications();
                        }
                      } catch (error) {
                        console.error("Error marking notifications as read:", error);
                      }
                    }}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/notifications", {
                          method: "DELETE",
                          headers: {
                            "x-user-email": currentUserEmail,
                          },
                        });
                        if (response.ok) {
                          await refreshNotifications();
                        }
                      } catch (error) {
                        console.error("Error deleting notifications:", error);
                      }
                    }}
                    className="text-xs uppercase tracking-[0.3em] text-red-600 underline-offset-4 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-lg border border-[var(--border-color)] bg-white/90 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{notification.alertRuleName}</span>
                          <span className="text-xs text-[var(--muted)]">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--foreground)] mb-1">{notification.eventTitle}</p>
                        <p className="text-xs text-[var(--muted)] whitespace-pre-line">{notification.message}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/notifications/${notification.id}`, {
                              method: "DELETE",
                              headers: {
                                "x-user-email": currentUserEmail,
                              },
                            });
                            if (response.ok) {
                              await refreshNotifications();
                            }
                          } catch (error) {
                            console.error("Error deleting notification:", error);
                          }
                        }}
                        className="ml-2 text-xs text-[var(--muted)] hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Smart Alerts</h2>
              <p className="text-sm text-[var(--muted)]">
                Configure automated alerts for calendar events. Get notified via email or Slack when events match your criteria.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowAlertForm(true);
                  setEditingAlertRule(null);
                  setAlertForm({
                    name: "",
                    enabled: true,
                    eventType: "option",
                    timing: "before",
                    value: 7,
                    unit: "days",
                    channels: [],
                    emailRecipients: "",
                    slackWebhookUrl: "",
                  });
                }}
                className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white transition"
              >
                + Create Alert Rule
              </button>
              <button
                onClick={refreshAlerts}
                className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
              >
                Refresh
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/alerts/check", {
                      method: "POST",
                      headers: {
                        "x-user-email": currentUserEmail,
                      },
                    });
                    if (response.ok) {
                      const data = await response.json();
                      if (data.triggered > 0) {
                        alert(`✅ Checked alerts: ${data.triggered} triggered, ${data.sent} notifications sent`);
                      } else {
                        alert("✅ No alerts to trigger at this time.");
                      }
                    } else {
                      alert("Failed to check alerts");
                    }
                  } catch (error) {
                    console.error("Error checking alerts:", error);
                    alert("Error checking alerts");
                  }
                }}
                className="rounded-full border border-[var(--border-color)] px-4 py-2 text-xs uppercase tracking-[0.3em] hover:border-black"
              >
                Test Alerts
              </button>
            </div>
          </div>

          {alertsLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : (
            <div className="space-y-4">
              {alertRules.length === 0 ? (
                <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-8 text-center">
                  <p className="text-sm text-[var(--muted)]">No alert rules configured. Create one to get started.</p>
                </div>
              ) : (
                alertRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{rule.name}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] ${
                              rule.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {rule.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-[var(--muted)]">
                          <p>
                            <strong>Event Type:</strong> {rule.trigger.eventType}
                          </p>
                          <p>
                            <strong>Trigger:</strong> {rule.trigger.timing === "before" ? `${rule.trigger.value} ${rule.trigger.unit} before` : rule.trigger.timing === "on" ? "On the day" : `${rule.trigger.value} ${rule.trigger.unit} after`}
                          </p>
                          <p>
                            <strong>Channels:</strong> {rule.channels.join(", ")}
                          </p>
                          {rule.emailRecipients && (
                            <p>
                              <strong>Email:</strong> {rule.emailRecipients}
                            </p>
                          )}
                          {rule.slackWebhookUrl && (
                            <p>
                              <strong>Slack:</strong> {rule.slackWebhookUrl.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAlertRule(rule);
                            setAlertForm({
                              name: rule.name,
                              enabled: rule.enabled,
                              eventType: rule.trigger.eventType,
                              timing: rule.trigger.timing,
                              value: rule.trigger.value,
                              unit: rule.trigger.unit,
                              channels: rule.channels,
                              emailRecipients: rule.emailRecipients || "",
                              slackWebhookUrl: rule.slackWebhookUrl || "",
                            });
                            setShowAlertForm(true);
                          }}
                          className="rounded-lg border border-[var(--border-color)] bg-white/90 px-3 py-1.5 text-xs uppercase tracking-[0.3em] hover:border-black"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeletePrompt({
                              visible: true,
                              message: `Are you sure you want to delete the alert rule "${rule.name}"?`,
                              action: "Delete Alert Rule",
                              onConfirm: async () => {
                                try {
                                  const response = await fetch(`/api/alerts/${rule.id}`, {
                                    method: "DELETE",
                                    headers: {
                                      "x-user-email": currentUserEmail,
                                    },
                                  });
                                  if (response.ok) {
                                    await refreshAlerts();
                                    setDeletePrompt({ visible: false, message: "", action: "", onConfirm: null });
                                  }
                                } catch (error) {
                                  console.error("Error deleting alert rule:", error);
                                }
                              },
                            });
                          }}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs uppercase tracking-[0.3em] text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      ) : activeTab === "packages" ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Model Packages</h2>
              <p className="text-sm text-[var(--muted)]">
                Create packages of selected models to share with clients. Track when packages are opened.
              </p>
            </div>
            <button
              onClick={refreshPackages}
              className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
            >
              Refresh
            </button>
          </div>

          {/* Submenu */}
          <div className="flex gap-2 border-b border-[var(--border-color)] pb-2">
            <button
              onClick={() => {
                setPackageView("create");
                // Clear any edit state when switching to create view
                if (editingPackageId) {
                  setEditingPackageId(null);
                  setPackageForm({ clientName: "", clientEmail: "", notes: "" });
                  setSelectedModelIds(new Set());
                  setIsCreatingPackage(false);
                }
              }}
              className={`pb-1 text-xs uppercase tracking-[0.4em] transition ${
                packageView === "create"
                  ? "border-b-2 border-black text-black"
                  : "text-[var(--muted)] hover:text-black"
              }`}
            >
              Create Package
            </button>
            <button
              onClick={() => {
                setPackageView("list");
                // Clear selected models when viewing existing packages
                setSelectedModelIds(new Set());
                setEditingPackageId(null);
                setPackageForm({ clientName: "", clientEmail: "", notes: "" });
                setIsCreatingPackage(false);
              }}
              className={`pb-1 text-xs uppercase tracking-[0.4em] transition ${
                packageView === "list"
                  ? "border-b-2 border-black text-black"
                  : "text-[var(--muted)] hover:text-black"
              }`}
            >
              Existing Packages
            </button>
          </div>

          {packageView === "create" ? (
          <div>
          {/* Create Package Form */}
          <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6">
            <h3 className="mb-4 text-lg font-medium tracking-[0.1em]">
              {editingPackageId ? "Edit Package" : "Create New Package"}
            </h3>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              </div>
            )}
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Client Name (optional)
                  </label>
                  <input
                    type="text"
                    value={packageForm.clientName}
                    onChange={(e) => setPackageForm({ ...packageForm, clientName: e.target.value })}
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Client Email (optional)
                  </label>
                  <input
                    type="email"
                    value={packageForm.clientEmail}
                    onChange={(e) => setPackageForm({ ...packageForm, clientEmail: e.target.value })}
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Notes (optional)
                </label>
                <textarea
                  value={packageForm.notes}
                  onChange={(e) => setPackageForm({ ...packageForm, notes: e.target.value })}
                  className="w-full rounded-2xl border border-[var(--border-color)] px-4 py-2 text-sm"
                  placeholder="Additional notes about this package..."
                  rows={3}
                />
              </div>
              <div>
                <div className="mb-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="search"
                      placeholder="Search name or city"
                      value={packageSearch}
                      onChange={(event) => setPackageSearch(event.target.value)}
                      className="flex-1 rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {divisionFilterOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPackageDivisionFilter(option)}
                        className={`rounded-full border px-4 py-1 text-[10px] uppercase tracking-[0.4em] transition ${
                          packageDivisionFilter === option
                            ? "border-black text-black"
                            : "border-[var(--border-color)] text-[var(--muted)] hover:border-black/60"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  <select
                    value={packageModelSort}
                    onChange={(e) => setPackageModelSort(e.target.value as typeof packageModelSort)}
                    className="ml-auto rounded-full border border-[var(--border-color)] px-3 py-1.5 text-[10px] uppercase tracking-[0.4em] text-[var(--muted)] transition hover:border-black"
                  >
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="city">Sort: City (A-Z)</option>
                    <option value="recent">Sort: Recently updated</option>
                  </select>
                  </div>
                </div>
                <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Select Models (<span className="font-bold text-[var(--foreground)]">{selectedModelIds.size} selected</span>)
                </label>
                <div className="max-h-[600px] overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-white/50 p-4">
                  {(() => {
                    const query = packageSearch.trim().toLowerCase();
                    const filtered = models
                      .filter((m) => !m.hidden)
                      .filter((model) => {
                        if (packageDivisionFilter !== "All" && model.division.toLowerCase() !== packageDivisionFilter.toLowerCase()) {
                          return false;
                        }
                        if (!query) return true;
                        return (
                          model.name.toLowerCase().includes(query) ||
                          (model.city?.toLowerCase().includes(query) ?? false)
                        );
                      });

                    const sorted = [...filtered].sort((a, b) => {
                      if (packageModelSort === "city") {
                        const cityA = (a.city || "").toLowerCase();
                        const cityB = (b.city || "").toLowerCase();
                        if (cityA && cityB) return cityA.localeCompare(cityB);
                        if (cityA) return -1;
                        if (cityB) return 1;
                        return a.name.localeCompare(b.name);
                      }

                      if (packageModelSort === "recent") {
                        const updatedA = new Date(a.updatedAt || a.createdAt || "").getTime();
                        const updatedB = new Date(b.updatedAt || b.createdAt || "").getTime();
                        return updatedB - updatedA;
                      }

                      // default: name
                      return a.name.localeCompare(b.name);
                    });
                    
                    return sorted.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">No models found</p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                        {sorted.map((model) => {
                        const isSelected = selectedModelIds.has(model.id);
                        const heroImage = model.images[0];
                        return (
                          <button
                            type="button"
                            key={model.id}
                            onClick={() => handleModelToggle(model.id)}
                            className={`relative rounded-[12px] border-2 p-2 text-left transition-all ${
                              isSelected
                                ? "border-black bg-black/10 shadow-md ring-2 ring-black/20"
                                : "border-[var(--border-color)] bg-white/80 hover:border-black/60"
                            }`}
                          >
                            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--background)]">
                              {heroImage ? (
                                <img
                                  src={heroImage.url}
                                  alt={model.name}
                                  className={`h-full w-full object-cover transition-opacity ${
                                    isSelected ? "opacity-90" : ""
                                  }`}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.3em] text-[var(--muted)]">
                                  No image
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-lg">
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className={`mt-1 text-[10px] font-medium ${isSelected ? "text-black" : ""}`}>
                              {model.name}
                            </div>
                            {isSelected && (
                              <div className="mt-0.5 flex items-center gap-1 text-[8px] font-semibold text-green-700">
                                <svg
                                  className="h-3 w-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Selected
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                  })()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isCreatingPackage || selectedModelIds.size === 0}
                  className="flex-1 rounded-full bg-black px-6 py-2 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-black/80 disabled:bg-[var(--muted)] disabled:cursor-not-allowed"
                >
                  {isCreatingPackage
                    ? editingPackageId
                      ? "Updating..."
                      : "Creating..."
                    : editingPackageId
                      ? "Update Package"
                      : "Create Package"}
                </button>
                {editingPackageId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackageId(null);
                      setPackageForm({ clientName: "", clientEmail: "", notes: "" });
                      setSelectedModelIds(new Set());
                      setIsCreatingPackage(false);
                    }}
                    className="rounded-full border border-[var(--border-color)] bg-white px-6 py-2 text-sm uppercase tracking-[0.3em] transition hover:border-black"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          </div>
          ) : (
          <div>
          {/* Existing Packages */}
          <div>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-medium tracking-[0.1em]">Existing Packages</h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="search"
                  placeholder="Search packages..."
                  value={packageListSearch}
                  onChange={(e) => {
                    setPackageListSearch(e.target.value);
                    setPackageListPage(1); // Reset to first page on search
                  }}
                  className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setPackageListFilter("all");
                      setPackageListPage(1); // Reset to first page on filter change
                    }}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                      packageListFilter === "all"
                        ? "border-black bg-black text-white"
                        : "border-[var(--border-color)] bg-white text-[var(--muted)] hover:border-black"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setPackageListFilter("opened");
                      setPackageListPage(1); // Reset to first page on filter change
                    }}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                      packageListFilter === "opened"
                        ? "border-black bg-black text-white"
                        : "border-[var(--border-color)] bg-white text-[var(--muted)] hover:border-black"
                    }`}
                  >
                    Opened
                  </button>
                  <button
                    onClick={() => {
                      setPackageListFilter("not-opened");
                      setPackageListPage(1); // Reset to first page on filter change
                    }}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                      packageListFilter === "not-opened"
                        ? "border-black bg-black text-white"
                        : "border-[var(--border-color)] bg-white text-[var(--muted)] hover:border-black"
                    }`}
                  >
                    Not Opened
                  </button>
                  <select
                    value={packageListSort}
                    onChange={(e) => {
                      setPackageListSort(e.target.value as typeof packageListSort);
                      setPackageListPage(1);
                    }}
                    className="rounded-full border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] transition hover:border-black"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="client-asc">Client (A-Z)</option>
                    <option value="last-opened">Last opened</option>
                  </select>
                </div>
              </div>
            </div>
            {packagesLoading ? (
              <p className="text-sm text-[var(--muted)]">Loading…</p>
            ) : (() => {
              const searchQuery = packageListSearch.trim().toLowerCase();
              const filtered = packages
                .filter((pkg) => {
                  if (packageListFilter === "opened" && !pkg.opened) return false;
                  if (packageListFilter === "not-opened" && pkg.opened) return false;
                  if (!searchQuery) return true;
                  return (
                    (pkg.clientName?.toLowerCase().includes(searchQuery) ?? false) ||
                    (pkg.clientEmail?.toLowerCase().includes(searchQuery) ?? false) ||
                    (pkg.notes?.toLowerCase().includes(searchQuery) ?? false) ||
                    pkg.slug.toLowerCase().includes(searchQuery)
                  );
                });

              const sorted = [...filtered].sort((a, b) => {
                const createdA = new Date(a.createdAt || a.updatedAt || "").getTime();
                const createdB = new Date(b.createdAt || b.updatedAt || "").getTime();
                const lastOpenedA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
                const lastOpenedB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;

                switch (packageListSort) {
                  case "oldest":
                    return createdA - createdB;
                  case "client-asc": {
                    const nameA = (a.clientName || "").toLowerCase();
                    const nameB = (b.clientName || "").toLowerCase();
                    if (nameA && nameB) return nameA.localeCompare(nameB);
                    if (nameA) return -1;
                    if (nameB) return 1;
                    return 0;
                  }
                  case "last-opened":
                    return lastOpenedB - lastOpenedA;
                  case "newest":
                  default:
                    return createdB - createdA;
                }
              });
              
              if (sorted.length === 0) {
                return (
                  <p className="rounded-[16px] border border-[var(--border-color)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                    {packages.length === 0
                      ? "No packages created yet."
                      : "No packages match your search."}
                  </p>
                );
              }
              
              // Pagination logic
              const itemsPerPage = 10;
              const totalPages = Math.ceil(sorted.length / itemsPerPage);
              const shouldPaginate = sorted.length >= itemsPerPage;
              // Ensure current page is valid (clamp between 1 and totalPages)
              const currentPage = totalPages > 0 ? Math.min(Math.max(1, packageListPage), totalPages) : 1;
              const startIndex = shouldPaginate ? (currentPage - 1) * itemsPerPage : 0;
              const endIndex = shouldPaginate ? startIndex + itemsPerPage : sorted.length;
              const paginatedPackages = sorted.slice(startIndex, endIndex);
              
              return (
                <>
                  <div className="space-y-4">
                    <p className="text-xs text-[var(--muted)]">
                      Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} packages
                      {packages.length !== filtered.length && ` (${packages.length} total)`}
                    </p>
                    {paginatedPackages.map((pkg) => {
                    const packageLink = `${window.location.origin}/packages/view/${pkg.slug}`;
                    return (
                      <div
                        key={pkg.id}
                        className="rounded-[18px] border border-[var(--border-color)] bg-white/80 p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h4 className="text-base font-medium">
                                {pkg.clientName || "Unnamed Package"}
                              </h4>
                              {pkg.opened && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-green-700">
                                  Opened
                                </span>
                              )}
                              {!pkg.opened && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-gray-600">
                                  Not opened
                                </span>
                              )}
                            </div>
                            {pkg.clientEmail && (
                              <p className="text-sm text-[var(--muted)]">{pkg.clientEmail}</p>
                            )}
                            {pkg.notes && (
                              <p className="mt-2 text-sm text-[var(--foreground)]">{pkg.notes}</p>
                            )}
                            <p className="mt-2 text-xs text-[var(--muted)]">
                              {pkg.modelIds.length} {pkg.modelIds.length === 1 ? "model" : "models"} • Created{" "}
                              {formatRelativeTime(pkg.createdAt) || "recently"}
                              {(pkg.lastOpenedAt || pkg.openedAt) && (
                                <> • Last opened {formatRelativeTime((pkg.lastOpenedAt || pkg.openedAt)!) || "recently"}</>
                              )}
                              {(pkg.openedCount || 0) > 0 && (
                                <> • Opened {(pkg.openedCount || 0)} {(pkg.openedCount || 0) === 1 ? "time" : "times"}</>
                              )}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={packageLink}
                                className="flex-1 rounded-full border border-[var(--border-color)] bg-white/50 px-4 py-1.5 text-xs"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                              <button
                                onClick={async () => {
                                  navigator.clipboard.writeText(packageLink);
                                  await logActivity("package_link_copied", `Copied package link${pkg.clientName ? ` for ${pkg.clientName}` : ""}`, {
                                    packageId: pkg.id,
                                    packageSlug: pkg.slug,
                                    packageLink,
                                  });
                                  setConfirmationMessage("Package link copied to clipboard!");
                                  setConfirmationAction("Copied");
                                  setConfirmationVisible(true);
                                }}
                                className="rounded-full border border-[var(--border-color)] bg-white px-4 py-1.5 text-xs uppercase tracking-[0.3em] transition hover:border-black"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={`/packages/view/${pkg.slug}?preview=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(`/packages/view/${pkg.slug}?preview=true`, '_blank', 'noopener,noreferrer');
                              }}
                              className="rounded-full border border-[var(--border-color)] bg-white px-4 py-1.5 text-xs uppercase tracking-[0.3em] transition hover:border-black"
                            >
                              Preview
                            </a>
                            <button
                              onClick={async () => {
                                // Open edit dialog for this package
                                setError(null);
                                const currentModelIds = new Set(pkg.modelIds);
                                setSelectedModelIds(currentModelIds);
                                setPackageForm({
                                  clientName: pkg.clientName || "",
                                  clientEmail: pkg.clientEmail || "",
                                  notes: pkg.notes || "",
                                });
                                setEditingPackageId(pkg.id);
                                setIsCreatingPackage(false);
                                // Switch to create view to show the edit form
                                setPackageView("create");
                              }}
                              className="rounded-full border border-[var(--border-color)] bg-white px-4 py-1.5 text-xs uppercase tracking-[0.3em] transition hover:border-black"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                setDeletePrompt({
                                  visible: true,
                                  message: "Delete this package?",
                                  action: "Delete package",
                                  onConfirm: async () => {
                                    await fetch(`/api/packages/${pkg.id}`, { method: "DELETE" });
                                    await logActivity("package_deleted", `Deleted package${pkg.clientName ? ` for ${pkg.clientName}` : ""}`, {
                                      packageId: pkg.id,
                                      packageSlug: pkg.slug,
                                    });
                                    await refreshPackages();
                                  },
                                })
                              }
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                  {shouldPaginate && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => setPackageListPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-full border border-[var(--border-color)] bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] transition disabled:opacity-50 disabled:cursor-not-allowed hover:border-black"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage =
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                          
                          if (!showPage) {
                            // Show ellipsis
                            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                              return (
                                <span key={pageNum} className="px-2 text-xs text-[var(--muted)]">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPackageListPage(pageNum)}
                              className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition ${
                                currentPage === pageNum
                                  ? "border-black bg-black text-white"
                                  : "border-[var(--border-color)] bg-white text-[var(--muted)] hover:border-black"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setPackageListPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-full border border-[var(--border-color)] bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] transition disabled:opacity-50 disabled:cursor-not-allowed hover:border-black"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          </div>
          )}
        </section>
      ) : activeTab === "stats" ? (
        <section className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Stats</h2>
              <p className="text-sm text-[var(--muted)]">
                Monitor marketing touch points and platform activity.
              </p>
            </div>
            <button
              onClick={refreshMetrics}
              className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
            >
              Refresh
            </button>
          </div>

          {/* Model Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
              Model Statistics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Total models
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.models.total}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Added this month
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.models.addedThisMonth}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Added this year
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.models.addedThisYear}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Complete profiles
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.models.withCompleteProfiles}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {stats.models.total > 0
                    ? Math.round((stats.models.withCompleteProfiles / stats.models.total) * 100)
                    : 0}
                  % of total
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Books updated (30d)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.models.withUpdatedBooks}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6 sm:col-span-2 lg:col-span-1">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  By division
                </p>
                <div className="mt-3 space-y-2">
                  {Object.entries(stats.models.byDivision).map(([division, count]) => (
                    <div key={division} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--foreground)]">{division}</span>
                      <span className="text-lg font-light">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Package Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
              Package Statistics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Total packages
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.total}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Opened
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.opened}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {stats.packages.total > 0
                    ? Math.round((stats.packages.opened / stats.packages.total) * 100)
                    : 0}
                  % of total
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Not opened
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.notOpened}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Created this month
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.createdThisMonth}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Created this year
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.createdThisYear}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Total opens
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.totalOpens}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Avg opens per package
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.averageOpensPerPackage}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Opened this month
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.openedThisMonth}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Avg models per package
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.packages.averageModelsPerPackage}
                </p>
              </div>
            </div>
          </div>

          {/* Submission Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
              Submission Statistics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Total submissions
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.submissions.total}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Pending
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.submissions.pending}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Approved
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.submissions.approved}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Approval rate
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.submissions.approvalRate}%
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  This month
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.submissions.thisMonth}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  This year
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.submissions.thisYear}
                </p>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
              Content Statistics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Total images
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.content.totalImages}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Avg per model
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.content.averageImagesPerModel}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  No images
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.content.modelsWithNoImages}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Models needing content
                </p>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
              Activity Metrics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Book edits (7d)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.activity.recentBookEdits}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Book edits (30d)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.activity.bookEditsLastMonth}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Book edits (1y)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.activity.bookEditsLastYear}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Profile updates (7d)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.activity.profileUpdatesLastWeek}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Profile updates (30d)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.activity.profileUpdatesLastMonth}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Profile updates (1y)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {stats.activity.profileUpdatesLastYear}
                </p>
              </div>
            </div>
          </div>

          {/* Marketing Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
              Marketing Metrics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Instagram clicks (Footer)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {instagramClicksFooter ?? "—"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Tracked from the footer CTA.
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Instagram clicks (Submission)
                </p>
                <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                  {instagramClicksSubmission ?? "—"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Tracked from the submission popup.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : activeTab === "admin-stats" && isSuperAdmin ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium tracking-[0.1em]">Admin Activity Statistics</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Track and monitor all administrative actions performed in the control panel.
            </p>
          </div>

          {/* Submenu */}
          <div className="flex gap-2 border-b border-[var(--border-color)] pb-2">
            <button
              onClick={() => setActivityStatsView("overview")}
              className={`pb-1 text-xs uppercase tracking-[0.4em] transition ${
                activityStatsView === "overview"
                  ? "border-b-2 border-black text-black"
                  : "text-[var(--muted)] hover:text-black"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActivityStatsView("recent")}
              className={`pb-1 text-xs uppercase tracking-[0.4em] transition ${
                activityStatsView === "recent"
                  ? "border-b-2 border-black text-black"
                  : "text-[var(--muted)] hover:text-black"
              }`}
            >
              Recent Activities
            </button>
          </div>

          {activityStatsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[var(--muted)]">Loading activity statistics...</p>
            </div>
          ) : activityStats ? (
            <div className="mt-6">
                {activityStatsView === "overview" ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Total Activities
                        </p>
                        <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                          {activityStats.total}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Last 24 Hours
                        </p>
                        <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                          {activityStats.last24Hours}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Last Week
                        </p>
                        <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                          {activityStats.lastWeek}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                          Last Month
                        </p>
                        <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                          {activityStats.lastMonth}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                      <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
                          Activities by Type
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(activityStats.byType)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([type, count]) => (
                              <div key={type} className="flex items-center justify-between">
                                <span className="text-sm capitalize text-[var(--foreground)]">
                                  {type.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm font-medium text-[var(--muted)]">{count as number}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
                          Activities by Admin
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(activityStats.byAdmin)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([email, count]) => (
                              <div key={email} className="flex items-center justify-between">
                                <span className="text-sm text-[var(--foreground)]">{email}</span>
                                <span className="text-sm font-medium text-[var(--muted)]">{count as number}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <input
                        type="text"
                        placeholder="Search activities..."
                        value={activitySearch}
                        onChange={(e) => {
                          setActivitySearch(e.target.value);
                          setActivityPage(1);
                        }}
                        className="flex-1 rounded-lg border border-[var(--border-color)] bg-white/90 px-4 py-2 text-sm"
                      />
                      <select
                        value={activitySort}
                        onChange={(e) => {
                          setActivitySort(e.target.value as "newest" | "oldest" | "admin-asc" | "type-asc");
                          setActivityPage(1);
                        }}
                        className="rounded-lg border border-[var(--border-color)] bg-white/90 px-4 py-2 text-sm"
                      >
                        <option value="newest">Sort: Newest first</option>
                        <option value="oldest">Sort: Oldest first</option>
                        <option value="admin-asc">Sort: Admin (A-Z)</option>
                        <option value="type-asc">Sort: Type (A-Z)</option>
                      </select>
                    </div>

                    {(() => {
                      let filtered = [...(activityStats.recent || [])];

                      // Apply search filter
                      if (activitySearch.trim()) {
                        const query = activitySearch.toLowerCase();
                        filtered = filtered.filter(
                          (activity: any) =>
                            activity.description.toLowerCase().includes(query) ||
                            activity.adminEmail.toLowerCase().includes(query) ||
                            activity.activityType.toLowerCase().includes(query)
                        );
                      }

                      // Apply sorting
                      filtered.sort((a: any, b: any) => {
                        switch (activitySort) {
                          case "oldest":
                            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                          case "admin-asc":
                            return a.adminEmail.localeCompare(b.adminEmail);
                          case "type-asc":
                            return a.activityType.localeCompare(b.activityType);
                          case "newest":
                          default:
                            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                        }
                      });

                      // Pagination
                      const totalPages = Math.ceil(filtered.length / ACTIVITIES_PER_PAGE);
                      const startIndex = (activityPage - 1) * ACTIVITIES_PER_PAGE;
                      const endIndex = startIndex + ACTIVITIES_PER_PAGE;
                      const paginated = filtered.slice(startIndex, endIndex);

                      return (
                        <>
                          <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
                            <div className="space-y-3">
                              {paginated.length === 0 ? (
                                <p className="text-sm text-[var(--muted)]">
                                  {activitySearch.trim() ? "No activities match your search." : "No activities recorded yet."}
                                </p>
                              ) : (
                                paginated.map((activity: any) => (
                                  <div
                                    key={activity.id}
                                    className="flex items-start justify-between border-b border-[var(--border-color)] pb-3 pt-2 last:border-0"
                                  >
                                    <div className="flex-1">
                                      <p className="text-sm text-[var(--foreground)]">{activity.description}</p>
                                      <p className="mt-1 text-xs text-[var(--muted)]">
                                        {activity.adminEmail} • {new Date(activity.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                    <span className="ml-4 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                                      {activity.activityType.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-[var(--muted)]">
                                Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} activities
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                                  disabled={activityPage === 1}
                                  className="rounded-lg border border-[var(--border-color)] bg-white/90 px-4 py-2 text-sm uppercase tracking-[0.3em] disabled:opacity-50"
                                >
                                  Previous
                                </button>
                                <span className="flex items-center px-4 text-sm text-[var(--muted)]">
                                  Page {activityPage} of {totalPages}
                                </span>
                                <button
                                  onClick={() => setActivityPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={activityPage === totalPages}
                                  className="rounded-lg border border-[var(--border-color)] bg-white/90 px-4 py-2 text-sm uppercase tracking-[0.3em] disabled:opacity-50"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
            </div>
          ) : null}
        </section>
      ) : activeTab === "admin" && isSuperAdmin ? (
        <section className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Admin Management</h2>
              <p className="text-sm text-[var(--muted)]">
                Manage who can access the admin panel and manage models.
              </p>
            </div>
            <button
              onClick={refreshAdmins}
              className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
            >
              Refresh
            </button>
          </div>

          {/* Add New Admin */}
          <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-6">
            <h3 className="mb-4 text-lg font-medium tracking-[0.1em]">Add New Admin</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newAdminEmail.trim()) {
                  setError("Email is required");
                  return;
                }
                if (!newAdminPassword.trim() || newAdminPassword.length < 6) {
                  setError("Password is required and must be at least 6 characters");
                  return;
                }
                try {
                  const response = await fetch("/api/admins", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-user-email": currentUserEmail,
                    },
                    body: JSON.stringify({
                      email: newAdminEmail.trim(),
                      password: newAdminPassword,
                      role: newAdminRole,
                    }),
                  });
                  if (response.ok) {
                    setNewAdminEmail("");
                    setNewAdminPassword("");
                    setNewAdminRole("admin");
                    setError(null);
                    setConfirmationMessage("Admin added successfully!");
                    setConfirmationAction("Added");
                    setConfirmationVisible(true);
                                await refreshAdmins();
                                await logActivity("admin_created", `Created admin: ${newAdminEmail}`, {
                                  adminEmail: newAdminEmail,
                                  role: newAdminRole,
                                });
                              } else {
                                const data = await response.json();
                                setError(data.error || "Failed to add admin");
                              }
                            } catch (error: any) {
                              setError(error.message || "Failed to add admin");
                            }
                          }}
              className="space-y-4"
            >
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Role
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as "admin" | "super_admin")}
                  className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin" disabled>Super Admin (cannot be created)</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-full bg-black px-6 py-2 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-black/80"
              >
                Add Admin
              </button>
            </form>
          </div>

          {/* Existing Admins */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.4em] text-[var(--muted)]">
              Existing Admins
            </h3>
            {adminsLoading ? (
              <p className="text-sm text-[var(--muted)]">Loading…</p>
            ) : admins.length === 0 ? (
              <p className="rounded-[16px] border border-[var(--border-color)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                No admins found.
              </p>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => {
                  const isSuper = admin.role === "super_admin" || admin.email.toLowerCase() === "americo@3mmodels.com" || admin.email.toLowerCase() === "irsida@3mmodels.com";
                  const isEditing = editingAdminId === admin.id;
                  
                  return (
                    <div
                      key={admin.id}
                      className="rounded-[18px] border border-[var(--border-color)] bg-white/80 p-6"
                    >
                      {isEditing ? (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!editAdminEmail.trim()) {
                              setError("Email is required");
                              return;
                            }
                            try {
                              const updates: { email?: string; password?: string; role?: "admin" | "super_admin" } = {
                                email: editAdminEmail.trim(),
                                role: editAdminRole,
                              };
                              
                              // Only include password if it was changed
                              if (editAdminPassword.trim() && editAdminPassword.length >= 6) {
                                updates.password = editAdminPassword;
                              } else if (editAdminPassword.trim() && editAdminPassword.length > 0) {
                                setError("Password must be at least 6 characters");
                                return;
                              }
                              
                              const response = await fetch(`/api/admins/${admin.id}`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  "x-user-email": currentUserEmail,
                                },
                                body: JSON.stringify(updates),
                              });
                              
                              if (response.ok) {
                                setEditingAdminId(null);
                                setEditAdminEmail("");
                                setEditAdminPassword("");
                                setEditAdminRole("admin");
                                setError(null);
                                setConfirmationMessage("Admin updated successfully!");
                                setConfirmationAction("Updated");
                                setConfirmationVisible(true);
                                await refreshAdmins();
                                await logActivity("admin_updated", `Updated admin: ${editAdminEmail}`, {
                                  adminId: admin.id,
                                  adminEmail: editAdminEmail,
                                  role: editAdminRole,
                                });
                              } else {
                                const data = await response.json();
                                setError(data.error || "Failed to update admin");
                              }
                            } catch (error: any) {
                              setError(error.message || "Failed to update admin");
                            }
                          }}
                          className="space-y-4"
                        >
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                                Email
                              </label>
                              <input
                                type="email"
                                value={editAdminEmail}
                                onChange={(e) => setEditAdminEmail(e.target.value)}
                                className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                                placeholder="admin@example.com"
                                required
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                                Password (leave blank to keep current)
                              </label>
                              <input
                                type="password"
                                value={editAdminPassword}
                                onChange={(e) => setEditAdminPassword(e.target.value)}
                                className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                                placeholder="New password (optional)"
                                minLength={6}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                              Role
                            </label>
                            <select
                              value={editAdminRole}
                              onChange={(e) => setEditAdminRole(e.target.value as "admin" | "super_admin")}
                              className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                            >
                              <option value="admin">Admin</option>
                              <option value="super_admin" disabled>Super Admin (cannot be changed)</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="rounded-full bg-black px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-black/80"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAdminId(null);
                                setEditAdminEmail("");
                                setEditAdminPassword("");
                                setEditAdminRole("admin");
                                setError(null);
                              }}
                              className="rounded-full border border-[var(--border-color)] px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-[var(--muted)] transition hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h4 className="text-base font-medium">{admin.email}</h4>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] ${
                                  isSuper
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isSuper ? "Super Admin" : "Admin"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--muted)]">
                              Created {new Date(admin.createdAt).toLocaleDateString()}
                              {admin.updatedAt !== admin.createdAt && (
                                <> • Updated {new Date(admin.updatedAt).toLocaleDateString()}</>
                              )}
                            </p>
                          </div>
                          {!isSuper && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingAdminId(admin.id);
                                  setEditAdminEmail(admin.email);
                                  setEditAdminPassword("");
                                  setEditAdminRole(admin.role);
                                  setError(null);
                                }}
                                className="rounded-full border border-[var(--border-color)] bg-white px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-[var(--foreground)] transition hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete admin ${admin.email}? This action cannot be undone.`
                                    )
                                  ) {
                                    try {
                                      const response = await fetch(`/api/admins/${admin.id}`, {
                                        method: "DELETE",
                                        headers: {
                                          "x-user-email": currentUserEmail,
                                        },
                                      });
                                      if (response.ok) {
                                        setConfirmationMessage("Admin deleted successfully!");
                                        setConfirmationAction("Deleted");
                                        setConfirmationVisible(true);
                                        await refreshAdmins();
                                        await logActivity("admin_deleted", `Deleted admin: ${admin.email}`, {
                                          adminId: admin.id,
                                          adminEmail: admin.email,
                                        });
                                      } else {
                                        const data = await response.json();
                                        setError(data.error || "Failed to delete admin");
                                      }
                                    } catch (error: any) {
                                      setError(error.message || "Failed to delete admin");
                                    }
                                  }
                                }}
                                className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-red-600 transition hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : null}
      <ConfirmationPopup
        visible={confirmationVisible}
        message={confirmationMessage}
        action={confirmationAction}
      />
      <ConfirmationPopup
        visible={deletePrompt.visible}
        variant="danger"
        message={deletePrompt.message}
        action={deletePrompt.action || "Confirm action"}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          deletePrompt.onConfirm?.();
          setDeletePrompt({
            visible: false,
            message: "",
            action: "",
            onConfirm: null,
          });
        }}
        onCancel={() =>
          setDeletePrompt({
            visible: false,
            message: "",
            action: "",
            onConfirm: null,
          })
        }
      />
      <ConfirmationPopup
        visible={unsavedChangesPrompt.visible}
        variant="danger"
        message={unsavedChangesPrompt.message}
        action={unsavedChangesPrompt.action}
        confirmLabel="Continue"
        cancelLabel="Cancel"
        onConfirm={() => {
          unsavedChangesPrompt.onConfirm?.();
        }}
        onCancel={() => {
          setUnsavedChangesPrompt({
            visible: false,
            message: "",
            action: "",
            onConfirm: null,
          });
          setPendingModelId(null);
          setPendingTab(null);
        }}
      />
      {imagePreview && currentPreviewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={closeImagePreview}
        >
          <div
            className="max-h-[90vh] max-w-[90vw] overflow-auto rounded-3xl border border-white/30 bg-black/30 p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="flex w-full items-center gap-4"
                onTouchStart={handlePreviewTouchStart}
                onTouchEnd={handlePreviewTouchEnd}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevImage();
                  }}
                  disabled={!previewHasPrev}
                  className="hidden rounded-full border border-white/50 px-3 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:block"
                >
                  Prev
                </button>
                <img
                  src={currentPreviewImage.url}
                  alt={currentPreviewImage.alt}
                  className="max-h-[75vh] w-full rounded-2xl object-contain"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  disabled={!previewHasNext}
                  className="hidden rounded-full border border-white/50 px-3 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:block"
                >
                  Next
                </button>
              </div>
              {imagePreview.images.length > 1 ? (
                <p className="text-xs uppercase tracking-[0.4em] text-white/80">
                  {imagePreview.index + 1} / {imagePreview.images.length}
                </p>
              ) : null}
              <div className="flex w-full flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevImage();
                  }}
                  disabled={!previewHasPrev}
                  className="flex-1 rounded-full border border-white/50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:hidden"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  disabled={!previewHasNext}
                  className="flex-1 rounded-full border border-white/50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:hidden"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeImagePreview();
                  }}
                  className="w-full rounded-full border border-white/60 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "models" && !isAddingModel ? (
        <button
          onClick={() => {
            if (hasUnsavedChanges) {
              setUnsavedChangesPrompt({
                visible: true,
                message: "You have unsaved changes. Are you sure you want to switch? Your changes will be lost.",
                action: "Unsaved changes",
                onConfirm: () => {
                  setHasUnsavedChanges(false);
                  setIsAddingModel(true);
                  setSelectedModelId(null);
                  setUnsavedChangesPrompt({
                    visible: false,
                    message: "",
                    action: "",
                    onConfirm: null,
                  });
                  // Scroll to form after state update
                  setTimeout(() => {
                    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                },
              });
            } else {
              setIsAddingModel(true);
              setSelectedModelId(null);
              // Scroll to form after state update
              setTimeout(() => {
                editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }
          }}
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          title="Add new model"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      ) : null}

      {/* Alert Form Modal */}
      {showAlertForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border-color)] bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium tracking-[0.1em]">
                {editingAlertRule ? "Edit Alert Rule" : "Create Alert Rule"}
              </h3>
              <button
                onClick={() => {
                  setShowAlertForm(false);
                  setEditingAlertRule(null);
                  setAlertForm({
                    name: "",
                    enabled: true,
                    eventType: "option",
                    timing: "before",
                    value: 7,
                    unit: "days",
                    channels: [],
                    emailRecipients: "",
                    slackWebhookUrl: "",
                  });
                }}
                className="text-2xl text-[var(--muted)] hover:text-black"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Validate channel-specific fields only if channels are selected
                if (alertForm.channels.includes("email") && !alertForm.emailRecipients.trim()) {
                  alert("Please provide email recipients when email channel is selected.");
                  return;
                }
                if (alertForm.channels.includes("slack") && !alertForm.slackWebhookUrl.trim()) {
                  alert("Please provide Slack webhook URL when Slack channel is selected.");
                  return;
                }

                try {
                  const url = editingAlertRule ? `/api/alerts/${editingAlertRule.id}` : "/api/alerts";
                  const method = editingAlertRule ? "PATCH" : "POST";

                  // Prepare payload - only include value/unit if timing is not "on"
                  const payload: any = {
                    name: alertForm.name,
                    enabled: alertForm.enabled,
                    eventType: alertForm.eventType,
                    timing: alertForm.timing,
                    channels: alertForm.channels,
                  };

                  if (alertForm.timing !== "on") {
                    payload.value = alertForm.value;
                    payload.unit = alertForm.unit;
                  } else {
                    // For "on" timing, set default values
                    payload.value = 0;
                    payload.unit = "days";
                  }

                  if (alertForm.channels.includes("email")) {
                    payload.emailRecipients = alertForm.emailRecipients;
                  }
                  if (alertForm.channels.includes("slack")) {
                    payload.slackWebhookUrl = alertForm.slackWebhookUrl;
                  }

                  const response = await fetch(url, {
                    method,
                    headers: {
                      "Content-Type": "application/json",
                      "x-user-email": currentUserEmail,
                    },
                    body: JSON.stringify(payload),
                  });

                  console.log("Alert form submission:", { url, method, payload });
                  
                  if (response.ok) {
                    const result = await response.json();
                    console.log("Alert rule saved successfully:", result);
                    await refreshAlerts();
                    setShowAlertForm(false);
                    setEditingAlertRule(null);
                    setAlertForm({
                      name: "",
                      enabled: true,
                      eventType: "option",
                      timing: "before",
                      value: 7,
                      unit: "days",
                      channels: [],
                      emailRecipients: "",
                      slackWebhookUrl: "",
                    });
                    if (editingAlertRule) {
                      await logActivity("alert_updated", `Updated alert rule: ${alertForm.name}`, {
                        alertRuleId: editingAlertRule.id,
                      });
                    } else {
                      await logActivity("alert_created", `Created alert rule: ${alertForm.name}`, {});
                    }
                  } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error("Failed to save alert rule:", response.status, errorData);
                    alert(errorData.error || `Failed to save alert rule (${response.status})`);
                  }
                } catch (error) {
                  console.error("Error saving alert rule:", error);
                  alert(`Failed to save alert rule: ${error instanceof Error ? error.message : String(error)}`);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={alertForm.name}
                  onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })}
                  placeholder="e.g., Options expiring soon"
                  className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="alert-enabled"
                  checked={alertForm.enabled}
                  onChange={(e) => setAlertForm({ ...alertForm, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-color)] text-black"
                />
                <label htmlFor="alert-enabled" className="text-sm text-[var(--muted)] cursor-pointer">
                  Enable this alert rule
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Event Type *
                  </label>
                  <select
                    required
                    value={alertForm.eventType}
                    onChange={(e) => setAlertForm({ ...alertForm, eventType: e.target.value as any })}
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                  >
                    <option value="option">Option</option>
                    <option value="job">Job</option>
                    <option value="contract">Contract</option>
                    <option value="casting">Casting</option>
                    <option value="out">Out</option>
                    <option value="travel">Travel</option>
                    <option value="availability">Availability</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Trigger Timing *
                  </label>
                  <select
                    required
                    value={alertForm.timing}
                    onChange={(e) => setAlertForm({ ...alertForm, timing: e.target.value as any })}
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                  >
                    <option value="before">Before</option>
                    <option value="on">On the day</option>
                    <option value="after">After</option>
                  </select>
                </div>
              </div>

              {alertForm.timing !== "on" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={alertForm.value}
                      onChange={(e) => setAlertForm({ ...alertForm, value: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Unit *
                    </label>
                    <select
                      required
                      value={alertForm.unit}
                      onChange={(e) => setAlertForm({ ...alertForm, unit: e.target.value as any })}
                      className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                    >
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Notification Channels (Optional - alerts will appear in admin panel)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertForm.channels.includes("email")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAlertForm({ ...alertForm, channels: [...alertForm.channels, "email"] });
                        } else {
                          setAlertForm({ ...alertForm, channels: alertForm.channels.filter((c) => c !== "email") });
                        }
                      }}
                      className="h-4 w-4 rounded border-[var(--border-color)] text-black"
                    />
                    <span className="text-sm text-[var(--muted)]">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertForm.channels.includes("slack")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAlertForm({ ...alertForm, channels: [...alertForm.channels, "slack"] });
                        } else {
                          setAlertForm({ ...alertForm, channels: alertForm.channels.filter((c) => c !== "slack") });
                        }
                      }}
                      className="h-4 w-4 rounded border-[var(--border-color)] text-black"
                    />
                    <span className="text-sm text-[var(--muted)]">Slack</span>
                  </label>
                </div>
              </div>

              {alertForm.channels.includes("email") && (
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Email Recipients * (comma-separated)
                  </label>
                  <input
                    type="text"
                    required={alertForm.channels.includes("email")}
                    value={alertForm.emailRecipients}
                    onChange={(e) => setAlertForm({ ...alertForm, emailRecipients: e.target.value })}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                  />
                </div>
              )}

              {alertForm.channels.includes("slack") && (
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Slack Webhook URL *
                  </label>
                  <input
                    type="url"
                    required={alertForm.channels.includes("slack")}
                    value={alertForm.slackWebhookUrl}
                    onChange={(e) => setAlertForm({ ...alertForm, slackWebhookUrl: e.target.value })}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-full border border-black bg-black px-6 py-2 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
                >
                  {editingAlertRule ? "Update Rule" : "Create Rule"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAlertForm(false);
                    setEditingAlertRule(null);
                    setAlertForm({
                      name: "",
                      enabled: true,
                      eventType: "option",
                      timing: "before",
                      value: 7,
                      unit: "days",
                      channels: [],
                      emailRecipients: "",
                      slackWebhookUrl: "",
                    });
                  }}
                  className="rounded-full border border-[var(--border-color)] px-6 py-2 text-sm uppercase tracking-[0.3em] hover:border-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type ConfirmationPopupProps = {
  visible: boolean;
  message: string;
  action: string;
  variant?: "success" | "danger";
  onClose?(): void;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?(): void;
  onCancel?(): void;
};

function ConfirmationPopup({
  visible,
  message,
  action,
  variant = "success",
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationPopupProps) {
  if (!visible) return null;

  const color =
    variant === "danger"
      ? "text-red-600 border-red-500"
      : "text-green-700 border-[var(--border-color)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className={`flex w-full max-w-md flex-col gap-3 rounded-2xl border bg-white/98 px-6 py-5 text-center shadow-2xl ${color}`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-color)] bg-white">
          <img
            src="https://3mmodels.com/web/svg/logo_square.svg"
            alt="3MMODELS"
            className="h-10 w-10"
          />
        </div>
        <p className="text-base font-medium tracking-[0.3em] uppercase">{action}</p>
        <p className="text-sm text-[var(--muted)]">{message}</p>
        {confirmLabel && cancelLabel ? (
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            <button
              onClick={onConfirm}
              className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.4em]"
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="rounded-full border border-[var(--border-color)] px-4 py-2 text-xs uppercase tracking-[0.4em]"
            >
              {cancelLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ModelCardProps = {
  model: ModelRecord;
  onChange(): Promise<void> | void;
  onShowConfirmation(message?: string, action?: string): void;
  onShowDeleteConfirmation(message: string, action: string, onConfirm: () => void): void;
  onDirtyStateChange?(hasDirty: boolean): void;
  onModelUpdate?(updatedModel: ModelRecord): void;
  currentUserEmail: string;
  logActivity: (activityType: string, description: string, metadata?: Record<string, any>) => Promise<void>;
};

function ModelCard({ model, onChange, onShowConfirmation, onShowDeleteConfirmation, onDirtyStateChange, onModelUpdate, currentUserEmail, logActivity }: ModelCardProps) {
  const [pending, setPending] = useState(false);
  const [localModel, setLocalModel] = useState(model);
  const [orders, setOrders] = useState<Record<string, number>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [infoDirty, setInfoDirty] = useState(false);
  const [bookDirty, setBookDirty] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isProfileInfoCollapsed, setIsProfileInfoCollapsed] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef<HTMLDivElement>(null);
  const [placementCityInput, setPlacementCityInput] = useState("");
  const [showPlacementCitySuggestions, setShowPlacementCitySuggestions] = useState(false);
  const placementCityInputRef = useRef<HTMLDivElement>(null);
  const bookImagesSectionRef = useRef<HTMLDivElement>(null);
  const shortHeightModel = shouldFlagShortTalent(localModel.division, localModel.height);
  const shortHeightModelLabel = shortHeightLabel(localModel.division);
  const modelAge = localModel.birthday
    ? Math.floor(
        (Date.now() - new Date(localModel.birthday).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;
  const formattedPhone = formatPhoneNumber(localModel.phonePrefix, localModel.phone);
  const divisionShoeOptions = getShoeOptionsForDivision(localModel.division);

  useEffect(() => {
    // Parse name into firstName and lastName if not already set
    let modelToSet = { ...model };
    if (!model.firstName && !model.lastName && model.name) {
      const nameParts = model.name.trim().split(/\s+/);
      if (nameParts.length > 0) {
        modelToSet.firstName = nameParts[0];
        if (nameParts.length > 1) {
          modelToSet.lastName = nameParts.slice(1).join(" ");
        }
      }
    }
    // Initialize agencyPlacements if not present
    if (!modelToSet.agencyPlacements) {
      modelToSet.agencyPlacements = [];
    }
    setLocalModel(modelToSet);
    const initialOrders: Record<string, number> = {};
    model.images.forEach((image) => {
      initialOrders[image.id] = image.order;
    });
    setOrders(initialOrders);
    setInfoDirty(false);
    setBookDirty(false);
  }, [model]);

  useEffect(() => {
    onDirtyStateChange?.(infoDirty || bookDirty);
  }, [infoDirty, bookDirty, onDirtyStateChange]);

  // Initialize city input from localModel
  useEffect(() => {
    if (localModel.city && !cityInput) {
      setCityInput(localModel.city);
    }
  }, [localModel.city, cityInput]);

  // Close city suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false);
      }
      if (
        placementCityInputRef.current &&
        !placementCityInputRef.current.contains(event.target as Node)
      ) {
        setShowPlacementCitySuggestions(false);
      }
      // Check all editing placement city inputs
      Object.keys(editingPlacementCityInputRef.current).forEach((placementId) => {
        const ref = editingPlacementCityInputRef.current[placementId];
        if (ref && !ref.contains(event.target as Node)) {
          setShowEditingPlacementCitySuggestions((prev) => ({ ...prev, [placementId]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortedImages = useMemo(
    () => [...localModel.images].sort((a, b) => a.order - b.order),
    [localModel.images]
  );

  // Calculate placement cities from this model's placements only
  const placementCities = useMemo(() => {
    const cityMap = new Map<string, Array<{ agencyName: string; city: string }>>();
    
    if (localModel.agencyPlacements && localModel.agencyPlacements.length > 0) {
      localModel.agencyPlacements.forEach((placement) => {
        if (placement.city && placement.agencyName) {
          const existing = cityMap.get(placement.city) || [];
          existing.push({ agencyName: placement.agencyName, city: placement.city });
          cityMap.set(placement.city, existing);
        }
      });
    }

    return Array.from(cityMap.entries()).map(([city, placements]) => ({
      city,
      count: placements.length,
      agencies: placements.map(p => p.agencyName),
    }));
  }, [localModel.agencyPlacements]);

  const handleFieldChange = (
    field: keyof ModelRecord,
    value: string | undefined
  ) => {
    setLocalModel((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-update name field when firstName or lastName changes
      if (field === "firstName" || field === "lastName") {
        const firstName = field === "firstName" ? value : updated.firstName;
        const lastName = field === "lastName" ? value : updated.lastName;
        const nameParts = [firstName, lastName].filter(Boolean);
        updated.name = nameParts.length > 0 ? nameParts.join(" ") : prev.name;
      }
      return updated;
    });
    setInfoDirty(true);
  };

  const saveModel = async () => {
    setPending(true);
    const response = await fetch(`/api/models/${localModel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: localModel.name,
        firstName: localModel.firstName,
        lastName: localModel.lastName,
        city: localModel.city,
        division: localModel.division,
        nationality: localModel.nationality,
        citizenship: localModel.citizenship,
        languages: localModel.languages,
        instagram: localModel.instagram,
        modelsComUrl: localModel.modelsComUrl,
        tiktok: localModel.tiktok,
        email: localModel.email,
        phonePrefix: localModel.phonePrefix,
        phone: localModel.phone,
        whatsapp: localModel.whatsapp,
        birthday: localModel.birthday,
        height: localModel.height,
        bust: localModel.bust,
        waist: localModel.waist,
        hips: localModel.hips,
        shoes: localModel.shoes,
        eyes: localModel.eyes,
        hair: localModel.hair,
        experience: localModel.experience,
        travelAvailability: localModel.travelAvailability,
        source: localModel.source,
        notes: localModel.notes,
      }),
    });
    if (!response.ok) {
      setPending(false);
      alert("Unable to update model");
      return;
    }
    const updatedModel = await response.json();
    setLocalModel(updatedModel);
    setInfoDirty(false);
    setPending(false);
    await logActivity("model_updated", `Updated model: ${localModel.name}`, {
      modelId: localModel.id,
    });
    await onChange();
    onShowConfirmation("Model info saved", "Fields updated");
  };

  const deleteModel = async () => {
    onShowDeleteConfirmation(`Delete ${localModel.name}?`, "Delete model", async () => {
      setPending(true);
      await fetch(`/api/models/${localModel.id}`, { method: "DELETE" });
      await logActivity("model_deleted", `Deleted model: ${localModel.name}`, {
        modelId: localModel.id,
      });
      setPending(false);
      await onChange();
    });
  };

  const toggleHide = async () => {
    setPending(true);
    const response = await fetch(`/api/models/${localModel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !localModel.hidden }),
    });
    if (response.ok) {
      const updatedModel = await response.json();
      setLocalModel(updatedModel);
      setInfoDirty(false);
      await logActivity(
        updatedModel.hidden ? "model_hidden" : "model_unhidden",
        `${updatedModel.hidden ? "Hidden" : "Unhidden"} model: ${localModel.name}`,
        {
          modelId: localModel.id,
        }
      );
      onShowConfirmation(
        updatedModel.hidden ? "Model hidden from front-end" : "Model visible on front-end",
        updatedModel.hidden ? "Hidden" : "Visible"
      );
    }
    setPending(false);
    await onChange();
  };

  const formatDuration = (startDate: string): string => {
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    let totalMonths = years * 12 + months;
    if (now.getDate() < start.getDate()) {
      totalMonths--;
    }
    
    if (totalMonths < 1) {
      return "Less than 1 month";
    } else if (totalMonths < 12) {
      return `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`;
    } else {
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? "year" : "years"}`;
      } else {
        return `${years} ${years === 1 ? "year" : "years"}, ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
      }
    }
  };

  const [newPlacement, setNewPlacement] = useState({ city: "", agencyName: "", startDate: "" });
  const [editingPlacementId, setEditingPlacementId] = useState<string | null>(null);
  const [editingPlacementCityInput, setEditingPlacementCityInput] = useState<Record<string, string>>({});
  const [showEditingPlacementCitySuggestions, setShowEditingPlacementCitySuggestions] = useState<Record<string, boolean>>({});
  const editingPlacementCityInputRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialize placement city input from newPlacement
  useEffect(() => {
    if (newPlacement.city && !placementCityInput) {
      setPlacementCityInput(newPlacement.city);
    }
  }, [newPlacement.city, placementCityInput]);

  const addPlacement = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!placementCityInput || !newPlacement.agencyName || !newPlacement.startDate) {
      alert("Please fill in all fields");
      return;
    }
    setPending(true);
    try {
      const placementToAdd = { ...newPlacement, city: placementCityInput };
      console.log("Adding placement:", placementToAdd, "for model:", localModel.id);
      if (!localModel.id) {
        alert("Model ID is missing");
        setPending(false);
        return;
      }
      const url = `/api/models/${localModel.id}/agency-placements`;
      console.log("Request URL:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(placementToAdd),
      });
      console.log("Response status:", response.status, "statusText:", response.statusText);
      if (response.ok) {
        const updatedModel = await response.json();
        console.log("Updated model:", updatedModel);
        setLocalModel(updatedModel);
        setNewPlacement({ city: "", agencyName: "", startDate: "" });
        setPlacementCityInput("");
        await logActivity("model_updated", `Added agency placement for model: ${localModel.name}`, {
          modelId: localModel.id,
          placement: placementToAdd,
        });
        onShowConfirmation("Agency placement added", "Placement added");
        // Update parent state without full refresh
        if (onModelUpdate) {
          onModelUpdate(updatedModel);
        } else {
          await onChange();
        }
      } else {
        let errorMessage = "Unable to add agency placement";
        const contentType = response.headers.get("content-type");
        console.log("Response content-type:", contentType);
        try {
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            console.error("Error response JSON:", error);
            errorMessage = error?.error || error?.message || errorMessage;
          } else {
            const text = await response.text();
            console.error("Error response text:", text);
            errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (e) {
          console.error("Error parsing response:", e);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error adding placement:", error);
      alert("Unable to add agency placement");
    } finally {
      setPending(false);
    }
  };

  const updatePlacement = async (placementId: string, updates: { city: string; agencyName: string; startDate: string }) => {
    setPending(true);
    const response = await fetch(`/api/models/${localModel.id}/agency-placements`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placementId, ...updates }),
    });
    if (response.ok) {
      const updatedModel = await response.json();
      setLocalModel(updatedModel);
      setEditingPlacementId(null);
      onShowConfirmation("Agency placement updated", "Placement updated");
      // Update parent state without full refresh
      if (onModelUpdate) {
        onModelUpdate(updatedModel);
      } else {
        await onChange();
      }
    }
    setPending(false);
  };

  const removePlacement = async (placementId: string) => {
    onShowDeleteConfirmation("Remove this agency placement?", "Remove placement", async () => {
      setPending(true);
      const response = await fetch(`/api/models/${localModel.id}/agency-placements?placementId=${placementId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const updatedModel = await response.json();
        setLocalModel(updatedModel);
        onShowConfirmation("Agency placement removed", "Placement removed");
        // Update parent state without full refresh
        if (onModelUpdate) {
          onModelUpdate(updatedModel);
        } else {
          await onChange();
        }
      }
      setPending(false);
    });
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed";
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }
    return null;
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingFiles(validFiles);
    setPending(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const xhr = new XMLHttpRequest();
        return new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress((prev) => ({ ...prev, [file.name]: percentComplete }));
            }
          });

          xhr.addEventListener("load", async () => {
            if (xhr.status === 201) {
              const updatedModel = JSON.parse(xhr.responseText);
              setLocalModel(updatedModel);
              resolve();
            } else {
              reject(new Error(`Failed to upload ${file.name}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error(`Failed to upload ${file.name}`));
          });

          xhr.open("POST", `/api/models/${localModel.id}/images`);
          xhr.send(formData);
        });
      });

      await Promise.all(uploadPromises);
      await logActivity("image_uploaded", `Uploaded ${validFiles.length} image(s) for model: ${localModel.name}`, {
        modelId: localModel.id,
        imageCount: validFiles.length,
      });
      await onChange();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Some files failed to upload. Please try again.");
    } finally {
      setPending(false);
      setUploadingFiles([]);
      setUploadProgress({});
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    await uploadFiles(files);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const saveOrder = async () => {
    setPending(true);
    const response = await fetch(`/api/models/${localModel.id}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: Object.entries(orders).map(([id, order]) => ({
          id,
          order: Number(order),
        })),
      }),
    });
    if (response.ok) {
      const updatedModel = await response.json();
      setLocalModel(updatedModel);
      await logActivity("images_reordered", `Reordered images for model: ${localModel.name}`, {
        modelId: localModel.id,
        imageCount: updatedModel.images.length,
      });
    }
    setPending(false);
    setBookDirty(false);
    await onChange();
  };

  const removeImage = async (imageId: string) => {
    onShowDeleteConfirmation("Remove this image from the book?", "Remove image", async () => {
      // Store current scroll position
      const scrollY = window.scrollY;
      const bookSectionTop = bookImagesSectionRef.current?.getBoundingClientRect().top ?? 0;
      
      setPending(true);
      const response = await fetch(`/api/images/${imageId}`, { method: "DELETE" });
      if (response.ok) {
        const updatedModel = await response.json();
        
        // Recalculate orders for remaining images (0, 10, 20, 30, etc.)
        const newOrders: Record<string, number> = {};
        updatedModel.images.forEach((image: any, index: number) => {
          newOrders[image.id] = index * 10;
        });
        
        // Update localModel with new orders
        const imagesWithNewOrders = updatedModel.images.map((image: any, index: number) => ({
          ...image,
          order: index * 10,
        }));
        
        setLocalModel({ ...updatedModel, images: imagesWithNewOrders });
        setOrders(newOrders);
        
        // Save the new orders to the backend
        const saveResponse = await fetch(`/api/models/${localModel.id}/images`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: Object.entries(newOrders).map(([id, order]) => ({
              id,
              order: Number(order),
            })),
          }),
        });
        
        if (saveResponse.ok) {
          const savedModel = await saveResponse.json();
          setLocalModel(savedModel);
        }
        
        await logActivity("image_deleted", `Deleted image from model: ${localModel.name}`, {
          modelId: localModel.id,
          imageId,
        });
        setBookDirty(false);
      }
      setPending(false);
      await onChange();
      
      // Restore scroll position after DOM updates
      setTimeout(() => {
        const newBookSectionTop = bookImagesSectionRef.current?.getBoundingClientRect().top ?? 0;
        const scrollDiff = newBookSectionTop - bookSectionTop;
        window.scrollTo({
          top: scrollY + scrollDiff,
          behavior: "instant" as ScrollBehavior,
        });
      }, 0);
    });
  };

  const handleDragStart = (imageId: string, event?: DragEvent<HTMLDivElement>) => {
    const dataTransfer = event?.dataTransfer;
    if (dataTransfer) {
      dataTransfer.setData("text/plain", imageId);
      dataTransfer.effectAllowed = "move";
    }
    setDraggingId(imageId);
  };

  const handleDrop = (targetId: string, event?: DragEvent<HTMLDivElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    setLocalModel((prev) => {
      const images = [...prev.images];
      const fromIndex = images.findIndex((image) => image.id === draggingId);
      const toIndex = images.findIndex((image) => image.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, moved);
      const newOrders: Record<string, number> = {};
      images.forEach((image, index) => {
        newOrders[image.id] = index * 10;
      });
      const updatedImages = images.map((image) => ({
        ...image,
        order: newOrders[image.id],
      }));
      setOrders((prevOrders) => ({ ...prevOrders, ...newOrders }));
      setBookDirty(true);
      return { ...prev, images: updatedImages };
    });
    setDraggingId(null);
  };

  return (
    <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4">
      <div className="flex flex-col gap-2 border-b border-[var(--border-color)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-[var(--muted)]">
            {localModel.division}
          </p>
          <h3 className="text-2xl font-light tracking-[0.1em]">
            {localModel.name}
            {shortHeightModel ? (
              <span
                className="ml-3 inline-flex h-2.5 w-2.5 align-middle rounded-full bg-red-500"
                title={shortHeightModelLabel}
                aria-label={shortHeightModelLabel}
              />
            ) : null}
            {modelAge !== null ? (
              <span className="ml-3 text-sm uppercase tracking-[0.4em] text-[var(--muted)]">
                {modelAge} yrs
              </span>
            ) : null}
          </h3>
          {localModel.email ? (
            <p className="text-sm text-[var(--muted)] lowercase">
              {localModel.email}
            </p>
          ) : null}
          {localModel.agencyPlacements && localModel.agencyPlacements.length > 0 ? (
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
              {localModel.agencyPlacements.length} {localModel.agencyPlacements.length === 1 ? "placement" : "placements"}
            </p>
          ) : null}
          {localModel.bookUpdatedAt ? (
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              <span
                className={`inline-flex h-2 w-2 rounded-full ${
                  getBookEditDotColor(localModel.bookUpdatedAt) === "green"
                    ? "bg-green-500"
                    : getBookEditDotColor(localModel.bookUpdatedAt) === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                title={
                  getBookEditDotColor(localModel.bookUpdatedAt) === "green"
                    ? "Edited within 1 month"
                    : getBookEditDotColor(localModel.bookUpdatedAt) === "yellow"
                      ? "Edited within 3 months"
                      : "Edited over 3 months ago"
                }
              />
              Book edited {formatRelativeTime(localModel.bookUpdatedAt)}
            </p>
          ) : (
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Book never edited
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={deleteModel}
            disabled={pending}
            className="rounded-full border border-red-500 px-4 py-1 text-xs uppercase tracking-[0.4em] text-red-600 disabled:opacity-60"
          >
            Delete
          </button>
          <button
            onClick={toggleHide}
            disabled={pending}
            className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.4em] disabled:opacity-60 ${
              localModel.hidden
                ? "border-yellow-500 text-yellow-600"
                : "border-orange-500 text-orange-600"
            }`}
          >
            {localModel.hidden ? "Unhide" : "Hide"}
          </button>
        </div>
      </div>


      <div ref={bookImagesSectionRef} className="mt-6 border-t border-[var(--border-color)] pt-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Book images
          </p>
          <p className="text-sm text-[var(--muted)]">
            Upload JPG/PNG files. They will appear immediately on the public board.
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          className={`relative rounded-2xl border-2 border-dashed transition ${
            isDragOver
              ? "border-black bg-black/5"
              : "border-[var(--border-color)] bg-white/50 hover:border-black/40"
          } ${pending ? "opacity-60" : ""}`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={uploadImage}
            disabled={pending}
            className="absolute inset-0 cursor-pointer opacity-0"
            id={`file-upload-${localModel.id}`}
          />
          <label
            htmlFor={`file-upload-${localModel.id}`}
            className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 p-6"
          >
            {pending ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <p className="text-sm text-[var(--muted)]">
                  Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? "s" : ""}...
                </p>
                {uploadingFiles.length > 0 && (
                  <div className="w-full max-w-xs space-y-1">
                    {uploadingFiles.map((file) => (
                      <div key={file.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate text-[var(--muted)]">{file.name}</span>
                          <span className="text-[var(--muted)]">
                            {uploadProgress[file.name] || 0}%
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border-color)]">
                          <div
                            className="h-full bg-black transition-all duration-300"
                            style={{ width: `${uploadProgress[file.name] || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <svg
                  className="h-10 w-10 text-[var(--muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Multiple images supported • Max 10MB per file
                  </p>
                </div>
              </>
            )}
          </label>
        </div>

        {sortedImages.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No images yet—upload to start the book.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={(event) => handleDragStart(image.id, event)}
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.currentTarget.classList.add("outline", "outline-4", "outline-black", "outline-offset-2");
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.currentTarget.classList.remove("outline", "outline-4", "outline-black", "outline-offset-2");
                }}
                onDrop={(event) => {
                  event.currentTarget.classList.remove("outline", "outline-4", "outline-black", "outline-offset-2");
                  handleDrop(image.id, event);
                }}
                className={`group relative flex flex-col gap-2 rounded-2xl border-2 transition-all ${
                  draggingId === image.id
                    ? "scale-105 border-black shadow-2xl z-50"
                    : "border-[var(--border-color)] hover:border-black/60 hover:shadow-lg"
                }`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl bg-[var(--background)]">
                  <img
                    src={image.url}
                    alt={localModel.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute top-2 left-2">
                    <span className="rounded-full bg-black/80 px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
                      #{Math.floor((orders[image.id] ?? image.order ?? 0) / 10) + 1}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-white shadow-lg hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      disabled={pending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <p className="text-center text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
                    Drag to reorder
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={async () => {
            await saveOrder();
            onShowConfirmation("Model info saved", "Fields updated");
          }}
          disabled={pending}
          className={`rounded-full border px-8 py-1.5 text-xs uppercase tracking-[0.4em] disabled:opacity-60 ${
            bookDirty ? "border-green-600 text-green-700" : "border-black"
          }`}
        >
          Save order
        </button>
      </div>

      <section className="mt-4 space-y-4 rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4">
        <button
          type="button"
          onClick={() => setIsProfileInfoCollapsed(!isProfileInfoCollapsed)}
          className="flex w-full items-center justify-between border-b border-[var(--border-color)] pb-3 text-left"
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Profile information</p>
            <p className="text-sm text-[var(--muted)]">Update contact details, measurements, and private notes.</p>
          </div>
          <span className="text-[var(--muted)]">
            {isProfileInfoCollapsed ? "▼" : "▲"}
          </span>
        </button>

        {!isProfileInfoCollapsed && (
          <>
        <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          First name
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.firstName ?? ""}
            onChange={(event) => handleFieldChange("firstName", event.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Last name
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.lastName ?? ""}
            onChange={(event) => handleFieldChange("lastName", event.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          City
          <div className="relative mt-1" ref={cityInputRef}>
            <input
              type="text"
              className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
              value={cityInput}
              onChange={(event) => {
                const value = event.target.value;
                setCityInput(value);
                handleFieldChange("city", value);
                setShowCitySuggestions(true);
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onKeyDown={(event) => {
                const filtered = cityInput.trim()
                  ? cityOptions.filter((city) =>
                      city.toLowerCase().includes(cityInput.toLowerCase())
                    )
                  : [];
                if (event.key === "Enter" && filtered.length > 0) {
                  event.preventDefault();
                  const selectedCity = filtered[0];
                  setCityInput(selectedCity);
                  handleFieldChange("city", selectedCity);
                  setShowCitySuggestions(false);
                }
              }}
              placeholder="Type and select city"
            />
            {showCitySuggestions && cityInput.trim() && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-white shadow-lg">
                {cityOptions
                  .filter((city) =>
                    city.toLowerCase().includes(cityInput.toLowerCase())
                  )
                  .map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setCityInput(city);
                        handleFieldChange("city", city);
                        setShowCitySuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {city}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Nationality
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.nationality ?? ""}
            onChange={(event) => handleFieldChange("nationality", event.target.value)}
          >
            <option value="">Select nationality</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Citizenship
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.citizenship ?? ""}
            onChange={(event) => handleFieldChange("citizenship", event.target.value)}
          >
            <option value="">Select citizenship</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Instagram
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.instagram ?? ""}
            onChange={(event) =>
              handleFieldChange("instagram", event.target.value)
            }
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Models.com
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.modelsComUrl ?? ""}
            onChange={(event) =>
              handleFieldChange("modelsComUrl", event.target.value)
            }
            placeholder="https://models.com/people/..."
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          TikTok
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.tiktok ?? ""}
            onChange={(event) =>
              handleFieldChange("tiktok", event.target.value)
            }
            placeholder="@username"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Height
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.height ?? ""}
            onChange={(event) => handleFieldChange("height", event.target.value)}
          >
            <option value="">Select height</option>
            {heightOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Bust
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.bust ?? ""}
            onChange={(event) => handleFieldChange("bust", event.target.value)}
          >
            <option value="">Select bust</option>
            {measurementOptions.map((option) => (
              <option key={`bust-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Waist
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.waist ?? ""}
            onChange={(event) => handleFieldChange("waist", event.target.value)}
          >
            <option value="">Select waist</option>
            {measurementOptions.map((option) => (
              <option key={`waist-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Hips
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.hips ?? ""}
            onChange={(event) => handleFieldChange("hips", event.target.value)}
          >
            <option value="">Select hips</option>
            {measurementOptions.map((option) => (
              <option key={`hips-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Shoes
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.shoes ?? ""}
            onChange={(event) => handleFieldChange("shoes", event.target.value)}
          >
            <option value="">Select shoes</option>
            {divisionShoeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Eyes
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.eyes ?? ""}
            onChange={(event) => handleFieldChange("eyes", event.target.value)}
          >
            <option value="">Select eyes</option>
            {eyeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Hair
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.hair ?? ""}
            onChange={(event) => handleFieldChange("hair", event.target.value)}
          >
            <option value="">Select hair</option>
            {hairOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] sm:col-span-2">
          Languages
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.languages ?? ""}
            onChange={(event) => handleFieldChange("languages", event.target.value)}
            placeholder="e.g., English, Italian, French"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] sm:col-span-2">
          Experience
          <textarea
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.experience ?? ""}
            onChange={(event) => handleFieldChange("experience", event.target.value)}
            rows={3}
            placeholder="Modeling experience, agencies, campaigns..."
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Travel Availability
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.travelAvailability ?? ""}
            onChange={(event) => handleFieldChange("travelAvailability", event.target.value)}
            placeholder="e.g., Worldwide, Europe only"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Source
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.source ?? ""}
            onChange={(event) => handleFieldChange("source", event.target.value)}
            placeholder="How did you hear about us?"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] sm:col-span-2">
          Notes
          <textarea
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.notes ?? ""}
            onChange={(event) => handleFieldChange("notes", event.target.value)}
            rows={3}
            placeholder="Additional notes or information..."
          />
        </label>
      </div>

      <div className="mt-4 border-t border-[var(--border-color)] pt-4">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Private contact information
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
              value={localModel.email ?? ""}
              onChange={(event) => handleFieldChange("email", event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Phone
            <div className="mt-1 flex gap-2">
              <select
                className="w-28 rounded-lg border border-[var(--border-color)] px-2 py-2 text-xs"
                value={localModel.phonePrefix ?? ""}
                onChange={(event) =>
                  handleFieldChange("phonePrefix", event.target.value || undefined)
                }
              >
                <option value="">Prefix</option>
                {phonePrefixOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 rounded-lg border border-[var(--border-color)] px-3 py-2"
                value={localModel.phone ?? ""}
                onChange={(event) => handleFieldChange("phone", event.target.value)}
              />
            </div>
          </label>
          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            WhatsApp
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
              value={localModel.whatsapp ?? ""}
              onChange={(event) =>
                handleFieldChange("whatsapp", event.target.value)
              }
            />
          </label>
          <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Birthday
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
              value={localModel.birthday ?? ""}
              onChange={(event) =>
                handleFieldChange("birthday", event.target.value)
              }
            />
          </label>
        </div>
      </div>

        {(localModel.email || formattedPhone || localModel.whatsapp || localModel.birthday) ? (
          <div className="rounded-[20px] border border-[var(--border-color)] bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">
              Private contact
            </p>
            <dl className="mt-3 space-y-1 text-[var(--foreground)]">
              {localModel.email ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--muted)]">Email</dt>
                  <dd className="text-right text-[11px] normal-case">{localModel.email}</dd>
                </div>
              ) : null}
              {formattedPhone ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--muted)]">Phone</dt>
                  <dd className="text-right text-[11px] normal-case">{formattedPhone}</dd>
                </div>
              ) : null}
              {localModel.whatsapp ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--muted)]">WhatsApp</dt>
                  <dd className="text-right text-[11px] normal-case">{localModel.whatsapp}</dd>
                </div>
              ) : null}
              {localModel.birthday ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--muted)]">Birthday</dt>
                  <dd className="text-right text-[11px] normal-case">{localModel.birthday}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={saveModel}
            disabled={!infoDirty || pending}
            className={`rounded-full border px-8 py-1.5 text-xs uppercase tracking-[0.4em] disabled:opacity-60 ${
              infoDirty ? "border-green-600 text-green-700" : "border-black text-black"
            }`}
          >
            Save info
          </button>
        </div>
          </>
        )}
      </section>

      <section className="mt-4 space-y-4 rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4">
        <div className="flex flex-col gap-1 border-b border-[var(--border-color)] pb-3">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Agencies Placements
            {localModel.agencyPlacements && localModel.agencyPlacements.length > 0 && (
              <span className="ml-2 text-[var(--foreground)]">
                ({localModel.agencyPlacements.length})
              </span>
            )}
          </p>
          <p className="text-sm text-[var(--muted)]">Manage agency contracts and placements.</p>
        </div>
        
        {(localModel.agencyPlacements && localModel.agencyPlacements.length > 0) && (
          <div className="space-y-3">
            {localModel.agencyPlacements.map((placement) => (
              <div
                key={placement.id}
                className="rounded-lg border border-[var(--border-color)] bg-white/50 p-3"
              >
                {editingPlacementId === placement.id ? (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div
                      className="relative"
                      ref={(el) => {
                        editingPlacementCityInputRef.current[placement.id] = el;
                      }}
                    >
                      <input
                        type="text"
                        placeholder="City"
                        className="rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-sm w-full"
                        value={editingPlacementCityInput[placement.id] ?? placement.city}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditingPlacementCityInput((prev) => ({ ...prev, [placement.id]: value }));
                          setShowEditingPlacementCitySuggestions((prev) => ({ ...prev, [placement.id]: true }));
                        }}
                        onFocus={() => {
                          setShowEditingPlacementCitySuggestions((prev) => ({ ...prev, [placement.id]: true }));
                          if (!editingPlacementCityInput[placement.id]) {
                            setEditingPlacementCityInput((prev) => ({ ...prev, [placement.id]: placement.city }));
                          }
                        }}
                        onBlur={(e) => {
                          setTimeout(() => {
                            const city = editingPlacementCityInput[placement.id] ?? e.target.value;
                            if (city !== placement.city) {
                              updatePlacement(placement.id, {
                                city,
                                agencyName: placement.agencyName,
                                startDate: placement.startDate,
                              });
                            }
                            setShowEditingPlacementCitySuggestions((prev) => ({ ...prev, [placement.id]: false }));
                          }, 200);
                        }}
                        onKeyDown={(event) => {
                          const currentInput = editingPlacementCityInput[placement.id] ?? placement.city;
                          const filtered = currentInput.trim()
                            ? cityOptions.filter((city) =>
                                city.toLowerCase().includes(currentInput.toLowerCase())
                              )
                            : [];
                          if (event.key === "Enter" && filtered.length > 0) {
                            event.preventDefault();
                            const selectedCity = filtered[0];
                            setEditingPlacementCityInput((prev) => ({ ...prev, [placement.id]: selectedCity }));
                            setShowEditingPlacementCitySuggestions((prev) => ({ ...prev, [placement.id]: false }));
                            updatePlacement(placement.id, {
                              city: selectedCity,
                              agencyName: placement.agencyName,
                              startDate: placement.startDate,
                            });
                          }
                        }}
                      />
                      {showEditingPlacementCitySuggestions[placement.id] &&
                        (editingPlacementCityInput[placement.id] ?? placement.city).trim() && (
                          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-white shadow-lg">
                            {cityOptions
                              .filter((city) =>
                                city
                                  .toLowerCase()
                                  .includes((editingPlacementCityInput[placement.id] ?? placement.city).toLowerCase())
                              )
                              .map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => {
                                    setEditingPlacementCityInput((prev) => ({ ...prev, [placement.id]: city }));
                                    setShowEditingPlacementCitySuggestions((prev) => ({ ...prev, [placement.id]: false }));
                                    updatePlacement(placement.id, {
                                      city,
                                      agencyName: placement.agencyName,
                                      startDate: placement.startDate,
                                    });
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                >
                                  {city}
                                </button>
                              ))}
                          </div>
                        )}
                    </div>
                    <input
                      type="text"
                      placeholder="Agency Name"
                      className="rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-sm"
                      defaultValue={placement.agencyName}
                      onBlur={(e) => {
                        const agencyName = e.target.value;
                        if (agencyName !== placement.agencyName) {
                          updatePlacement(placement.id, {
                            city: placement.city,
                            agencyName,
                            startDate: placement.startDate,
                          });
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="flex-1 rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-sm"
                        defaultValue={placement.startDate}
                        onBlur={(e) => {
                          const startDate = e.target.value;
                          if (startDate !== placement.startDate) {
                            updatePlacement(placement.id, {
                              city: placement.city,
                              agencyName: placement.agencyName,
                              startDate,
                            });
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlacementId(null);
                          setEditingPlacementCityInput((prev) => {
                            const updated = { ...prev };
                            delete updated[placement.id];
                            return updated;
                          });
                          setShowEditingPlacementCitySuggestions((prev) => {
                            const updated = { ...prev };
                            delete updated[placement.id];
                            return updated;
                          });
                        }}
                        className="rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-xs uppercase tracking-[0.3em]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {placement.agencyName}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {placement.city} • Started {new Date(placement.startDate).toLocaleDateString()} • {formatDuration(placement.startDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPlacementId(placement.id)}
                        className="rounded-lg border border-[var(--border-color)] px-3 py-1 text-xs uppercase tracking-[0.3em] hover:bg-[var(--border-color)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlacement(placement.id)}
                        disabled={pending}
                        className="rounded-lg border border-red-500 px-3 py-1 text-xs uppercase tracking-[0.3em] text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="relative" ref={placementCityInputRef}>
            <input
              type="text"
              placeholder="City"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
              value={placementCityInput}
              onChange={(e) => {
                const value = e.target.value;
                setPlacementCityInput(value);
                setNewPlacement({ ...newPlacement, city: value });
                setShowPlacementCitySuggestions(true);
              }}
              onFocus={() => setShowPlacementCitySuggestions(true)}
              onKeyDown={(event) => {
                const filtered = placementCityInput.trim()
                  ? cityOptions.filter((city) =>
                      city.toLowerCase().includes(placementCityInput.toLowerCase())
                    )
                  : [];
                if (event.key === "Enter" && filtered.length > 0) {
                  event.preventDefault();
                  const selectedCity = filtered[0];
                  setPlacementCityInput(selectedCity);
                  setNewPlacement({ ...newPlacement, city: selectedCity });
                  setShowPlacementCitySuggestions(false);
                }
              }}
            />
            {showPlacementCitySuggestions && placementCityInput.trim() && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-white shadow-lg">
                {cityOptions
                  .filter((city) =>
                    city.toLowerCase().includes(placementCityInput.toLowerCase())
                  )
                  .map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setPlacementCityInput(city);
                        setNewPlacement({ ...newPlacement, city });
                        setShowPlacementCitySuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {city}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Agency Name"
            className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            value={newPlacement.agencyName}
            onChange={(e) => setNewPlacement({ ...newPlacement, agencyName: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="date"
              placeholder="Start Date"
              className="flex-1 rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
              value={newPlacement.startDate}
              onChange={(e) => setNewPlacement({ ...newPlacement, startDate: e.target.value })}
            />
            <button
              type="button"
              onClick={addPlacement}
              disabled={pending || !placementCityInput || !newPlacement.agencyName || !newPlacement.startDate}
              className="rounded-lg border border-black bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-white disabled:opacity-60"
            >
              Add
            </button>
          </div>
        </div>

        {placementCities.length > 0 && (
          <PlacementsMap cities={placementCities} />
        )}
      </section>
    </div>
  );
}

type SubmissionCardProps = {
  submission: SubmissionRecord;
  onApprove(): Promise<void> | void;
  onDelete(): void;
  onPreview(images: PreviewImage[], index: number): void;
};

function SubmissionCard({ submission, onApprove, onDelete, onPreview }: SubmissionCardProps) {
  const statusBadge =
    submission.status === "approved"
      ? "text-green-700 border-green-600"
      : "text-[var(--muted)] border-[var(--border-color)]";

  const age = submission.birthday
    ? Math.floor(
        (Date.now() - new Date(submission.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;
  const shortHeightSubmission = shouldFlagShortTalent(submission.gender, submission.height);
  const shortHeightSubmissionLabel = shortHeightLabel(submission.gender);
  const previewImages = submission.images.map((image) => ({
    url: image.url,
    alt: `${submission.firstName} ${submission.lastName}`,
  }));
  const formattedSubmissionPhone = formatPhoneNumber(submission.phonePrefix, submission.phone);

  return (
    <article className="rounded-[24px] border border-[var(--border-color)] bg-white/85 p-4">
      <header className="flex flex-col gap-2 border-b border-[var(--border-color)] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            {submission.gender ?? "Unspecified"}
          </p>
          <h3 className="text-2xl font-light tracking-[0.1em]">
            {submission.firstName} {submission.lastName}
            {age ? (
              <span className="ml-3 text-sm uppercase tracking-[0.4em] text-[var(--muted)]">{age} yrs</span>
            ) : null}
            {shortHeightSubmission ? (
              <span
                className="ml-3 inline-flex h-2.5 w-2.5 align-middle rounded-full bg-red-500"
                title={shortHeightSubmissionLabel}
                aria-label={shortHeightSubmissionLabel}
              />
            ) : null}
          </h3>
          <p className="text-sm text-[var(--muted)]">{submission.email}</p>
        </div>
        <div className="flex flex-col items-end text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.4em] ${statusBadge}`}>
            {submission.status}
          </span>
          <span className="mt-2 text-[10px]">
            {submission.status === "pending" ? "Submitted" : "Updated"} ·{" "}
            {new Date(submission.updatedAt).toLocaleDateString()}{" "}
            {new Date(submission.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      <div className="mt-4 grid gap-4 text-sm text-[var(--muted)] sm:grid-cols-2">
        <div>
          <p className="section-title">Location</p>
          <p>{submission.currentCity || "—"}</p>
        </div>
        <div>
          <p className="section-title">Measurements</p>
          <p>
            H: {submission.height || "—"} · C: {submission.chest || "—"} · W: {submission.waist || "—"} · H:{" "}
            {submission.hips || "—"}
          </p>
        </div>
        <div>
          <p className="section-title">Contact</p>
          <p>
            {formattedSubmissionPhone || "—"}
            <br />
            {submission.instagram ? (
              <a
                href={`https://instagram.com/${submission.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[var(--foreground)] underline-offset-4 hover:underline"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
                {submission.instagram}
              </a>
            ) : (
              "No Instagram"
            )}
            {submission.tiktok && (
              <>
                <br />
                <a
                  href={`https://tiktok.com/@${submission.tiktok.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--foreground)] underline-offset-4 hover:underline"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                  {submission.tiktok}
                </a>
              </>
            )}
          </p>
        </div>
        <div>
          <p className="section-title">Experience</p>
          <p>{submission.experience || "No experience info"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {submission.images.map((image: SubmissionRecord["images"][number], index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onPreview(previewImages, index)}
            className="group"
          >
            <img
              src={image.url}
              alt={`${submission.firstName} ${submission.lastName}`}
              className="h-40 w-32 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          disabled={submission.status === "approved"}
          className="rounded-full border border-black px-4 py-1 text-xs uppercase tracking-[0.4em] disabled:opacity-50"
        >
          Approve & add to board
        </button>
        <button
          onClick={onDelete}
          className="rounded-full border border-red-500 px-4 py-1 text-xs uppercase tracking-[0.4em] text-red-600"
        >
          Delete
        </button>
      </div>
    </article>
  );
}


