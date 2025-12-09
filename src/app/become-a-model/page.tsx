"use client";

import { useEffect, useId, useState, useRef } from "react";
import type { ChangeEvent } from "react";

import {
  countryOptions,
  eyeOptions,
  hairOptions,
  heightOptions,
  measurementOptions,
  phonePrefixOptions,
  shoeOptions,
} from "@/lib/modelOptions";

const genderOptions = ["Female", "Male", "Non Binary"];
const MAX_UPLOAD_FILES = 10;
const MIN_AGE_YEARS = 16;

const languageOptions = [
  "English",
  "Italian",
  "French",
  "Spanish",
  "German",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Greek",
  "Turkish",
  "Hebrew",
  "Hindi",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Other",
];

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

const getShoeOptionsForGender = (gender: string) => {
  const normalized = gender.toLowerCase();
  if (normalized.includes("male") && !normalized.includes("fe")) {
    return shoeOptions.male;
  }
  if (normalized.includes("female")) {
    return shoeOptions.female;
  }
  return shoeOptions.neutral;
};

export default function BecomeModelPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthday: "",
    gender: "Female",
    nationality: "",
    citizenship: "",
    languages: "",
    currentCity: "",
    phone: "",
    phonePrefix: "",
    instagram: "",
    tiktok: "",
    height: "",
    chest: "",
    waist: "",
    hips: "",
    shoes: "",
    eyes: "",
    hair: "",
    experience: "",
    travelAvailability: "",
    source: "",
    notes: "",
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const languageInputRef = useRef<HTMLDivElement>(null);
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputId = useId();
  const [formError, setFormError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageAdd = (language: string) => {
    if (language.trim() && !selectedLanguages.includes(language.trim())) {
      const newSelection = [...selectedLanguages, language.trim()];
      setSelectedLanguages(newSelection);
      setForm((prev) => ({ ...prev, languages: newSelection.join(", ") }));
      setLanguageInput("");
      setShowLanguageSuggestions(false);
    }
  };

  const handleLanguageRemove = (language: string) => {
    const newSelection = selectedLanguages.filter((lang) => lang !== language);
    setSelectedLanguages(newSelection);
    setForm((prev) => ({ ...prev, languages: newSelection.join(", ") }));
  };

  const filteredLanguageSuggestions = languageInput.trim()
    ? languageOptions.filter(
        (lang) =>
          lang.toLowerCase().includes(languageInput.toLowerCase()) &&
          !selectedLanguages.includes(lang)
      )
    : [];

  const filteredCitySuggestions = cityInput.trim()
    ? cityOptions.filter((city) =>
        city.toLowerCase().includes(cityInput.toLowerCase())
      )
    : [];

  const handleCitySelect = (city: string) => {
    setCityInput(city);
    setForm((prev) => ({ ...prev, currentCity: city }));
    setShowCitySuggestions(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selection = Array.from(event.target.files ?? []);
    if (selection.length > MAX_UPLOAD_FILES) {
      setFileError(`Please upload up to ${MAX_UPLOAD_FILES} images.`);
    } else {
      setFileError(null);
    }
    setFiles(selection.slice(0, MAX_UPLOAD_FILES));
  };

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Initialize city input from form
  useEffect(() => {
    if (form.currentCity && !cityInput) {
      setCityInput(form.currentCity);
    }
  }, [form.currentCity, cityInput]);

  // Close language suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageInputRef.current &&
        !languageInputRef.current.contains(event.target as Node)
      ) {
        setShowLanguageSuggestions(false);
      }
      if (
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const minBirthDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - MIN_AGE_YEARS);
    return date.toISOString().split("T")[0];
  })();

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const fillRandomData = () => {
    const firstNames = ["Emma", "Sophia", "Olivia", "Isabella", "Ava", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "James", "Liam", "Noah", "Oliver", "William", "Elijah", "Benjamin", "Lucas", "Mason", "Ethan"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"];
    const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
    const instagramHandles = ["model", "fashion", "style", "beauty", "photography"];
    const tiktokHandles = ["model", "fashion", "style", "beauty", "photography"];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomEmail = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const randomInstagram = `@${randomFirstName.toLowerCase()}_${instagramHandles[Math.floor(Math.random() * instagramHandles.length)]}`;
    const randomTiktok = `@${randomFirstName.toLowerCase()}_${tiktokHandles[Math.floor(Math.random() * tiktokHandles.length)]}`;
    
    // Generate random birthday (age between 18-30)
    const age = 18 + Math.floor(Math.random() * 13);
    const birthYear = new Date().getFullYear() - age;
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const randomBirthday = `${birthYear}-${birthMonth}-${birthDay}`;
    
    // Random gender
    const randomGender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
    
    // Random nationality and citizenship
    const randomCountry = countryOptions[Math.floor(Math.random() * countryOptions.length)];
    
    // Random languages (2-3 languages)
    const numLanguages = 2 + Math.floor(Math.random() * 2);
    const shuffledLanguages = [...languageOptions].sort(() => 0.5 - Math.random());
    const randomLanguages = shuffledLanguages.slice(0, numLanguages);
    
    // Random city
    const randomCity = cityOptions[Math.floor(Math.random() * cityOptions.length)];
    
    // Random phone prefix and number
    const randomPhonePrefix = phonePrefixOptions[Math.floor(Math.random() * phonePrefixOptions.length)].value;
    const randomPhone = String(Math.floor(1000000000 + Math.random() * 9000000000)).slice(0, 10);
    
    // Random height based on gender
    let randomHeight = "";
    if (randomGender === "Female") {
      const femaleHeights = ["173cm - 5' 8''", "175cm - 5' 9''", "178cm - 5' 10''", "180cm - 5' 11''"];
      randomHeight = femaleHeights[Math.floor(Math.random() * femaleHeights.length)];
    } else if (randomGender === "Male") {
      const maleHeights = ["184cm - 6' 0''", "188cm - 6' 2''", "190cm - 6' 3''", "193cm - 6' 4''", "195cm - 6' 5''"];
      randomHeight = maleHeights[Math.floor(Math.random() * maleHeights.length)];
    } else {
      randomHeight = heightOptions[Math.floor(Math.random() * heightOptions.length)];
    }
    
    // Random measurements
    const randomMeasurement = measurementOptions[Math.floor(Math.random() * measurementOptions.length)];
    const randomShoeSize = getShoeOptionsForGender(randomGender)[Math.floor(Math.random() * getShoeOptionsForGender(randomGender).length)];
    const randomEyeColor = eyeOptions[Math.floor(Math.random() * eyeOptions.length)];
    const randomHairColor = hairOptions[Math.floor(Math.random() * hairOptions.length)];
    
    // Set form data
    setForm({
      firstName: randomFirstName,
      lastName: randomLastName,
      email: randomEmail,
      birthday: randomBirthday,
      gender: randomGender,
      nationality: randomCountry,
      citizenship: randomCountry,
      languages: randomLanguages.join(", "),
      currentCity: randomCity,
      phone: randomPhone,
      phonePrefix: randomPhonePrefix,
      instagram: randomInstagram,
      tiktok: randomTiktok,
      height: randomHeight,
      chest: randomMeasurement,
      waist: randomMeasurement,
      hips: randomMeasurement,
      shoes: randomShoeSize,
      eyes: randomEyeColor,
      hair: randomHairColor,
      experience: "Previous modeling experience with various agencies and fashion shows.",
      travelAvailability: "Available for international travel. Flexible schedule.",
      source: "Social media / Direct application",
      notes: "Professional model with portfolio experience.",
    });
    
    // Set languages
    setSelectedLanguages(randomLanguages);
    setCityInput(randomCity);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.birthday) {
      setFormError("Birthday is required so we can verify you are at least 16.");
      return;
    }
    const age = calculateAge(form.birthday);
    if (age < MIN_AGE_YEARS) {
      setFormError("Applicants must be at least 16 years old.");
      return;
    }
    if (!acceptedTerms) {
      setFormError("You must accept the Application Process and Rules and the Privacy Policy to submit.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("acceptedTerms", acceptedTerms.toString());
    files.slice(0, MAX_UPLOAD_FILES).forEach((file) => data.append("images", file));

    const response = await fetch("/api/submissions", {
      method: "POST",
      body: data,
    });

    setSubmitting(false);
    if (response.ok) {
      setSuccess(true);
      setShowSuccessPopup(true);
      setForm((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        email: "",
        instagram: "",
        tiktok: "",
        phone: "",
        phonePrefix: "",
        languages: "",
      }));
      setSelectedLanguages([]);
      setLanguageInput("");
      setCityInput("");
      setFiles([]);
      setFileError(null);
      setAcceptedTerms(false);
    }
  };

  const genderedShoeOptions = getShoeOptionsForGender(form.gender);

  return (
    <section className="space-y-10">
      <header className="space-y-4 text-center">
        <p className="section-title">Become a model</p>
        <h1 className="text-4xl font-light tracking-[0.1em] text-[var(--foreground)] sm:text-5xl">
          Submit your digitals for 3MMODELS consideration.
        </h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          We review applications for Women (173-180cm) and Men (184-195cm). Please fill the form and upload natural digitals:
          full-length, profile, and close-up.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <div className="space-y-6 rounded-[32px] border border-[var(--border-color)] bg-white/85 p-8">
          <p className="section-title">Submission rules</p>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li>Photos must be recent, natural light, no heavy makeup.</li>
            <li>Include accurate measurements and current location.</li>
            <li>Applicants must be at least 16 years old.</li>
            <li>Applicants under 18 must have a parent or guardian submit.</li>
            <li>List availability to travel for show seasons or development.</li>
            <li>Files accepted: JPG/PNG up to 10 images.</li>
          </ul>
          <div>
            <p className="section-title">Contact</p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              scouting@3mmodels.com
              <br />
              +44 203 239 8236
              <br />
              Milan · London · Paris
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[32px] border border-[var(--border-color)] bg-white/90 p-8">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={fillRandomData}
              className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
            >
              Fill with sample data
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              value={form.firstName}
              onChange={(event) => handleChange("firstName", event.target.value)}
              placeholder="First name*"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
            <input
              required
              value={form.lastName}
              onChange={(event) => handleChange("lastName", event.target.value)}
              placeholder="Last name*"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="Email*"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
            <input
              type="date"
              required
              value={form.birthday}
              onChange={(event) => handleChange("birthday", event.target.value)}
              max={minBirthDate}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <select
              value={form.gender}
              onChange={(event) => handleChange("gender", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            >
              {genderOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={form.nationality}
              onChange={(event) => handleChange("nationality", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            >
              <option value="">Nationality</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <select
              value={form.citizenship}
              onChange={(event) => handleChange("citizenship", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            >
              <option value="">Citizenship</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative" ref={languageInputRef}>
              <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Languages
              </label>
              {selectedLanguages.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedLanguages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-white px-2 py-1 text-xs"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => handleLanguageRemove(language)}
                        className="ml-1 text-[var(--muted)] hover:text-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(event) => {
                    setLanguageInput(event.target.value);
                    setShowLanguageSuggestions(true);
                  }}
                  onFocus={() => setShowLanguageSuggestions(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && languageInput.trim()) {
                      event.preventDefault();
                      const trimmed = languageInput.trim();
                      // Allow adding custom languages not in the list
                      if (!selectedLanguages.includes(trimmed)) {
                        handleLanguageAdd(trimmed);
                      }
                    }
                  }}
                  placeholder="Type and select languages"
                  className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
                />
                {showLanguageSuggestions && filteredLanguageSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-white shadow-lg">
                    {filteredLanguageSuggestions.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageAdd(language)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="relative" ref={cityInputRef}>
              <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Current City
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCityInput(value);
                    setForm((prev) => ({ ...prev, currentCity: value }));
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && filteredCitySuggestions.length > 0) {
                      event.preventDefault();
                      handleCitySelect(filteredCitySuggestions[0]);
                    }
                  }}
                  placeholder="Type and select city"
                  className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
                />
                {showCitySuggestions && filteredCitySuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-white shadow-lg">
                    {filteredCitySuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)]">
            <select
              value={form.phonePrefix}
              onChange={(event) => handleChange("phonePrefix", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-2 py-2 text-sm sm:w-[110px]"
            >
              <option value="">Prefix</option>
              {phonePrefixOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              value={form.phone}
              onChange={(event) =>
                handleChange("phone", event.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="Phone"
              inputMode="numeric"
              pattern="[0-9]*"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
            <input
              value={form.instagram}
              onChange={(event) => handleChange("instagram", event.target.value)}
              placeholder="Instagram"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <input
              value={form.tiktok}
              onChange={(event) => handleChange("tiktok", event.target.value)}
              placeholder="TikTok"
              className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <select
              value={form.height}
              onChange={(event) => handleChange("height", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            >
              <option value="">Height (cm)</option>
              {heightOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            {["chest", "waist", "hips"].map((field) => (
              <select
                key={field}
                value={(form as any)[field]}
                onChange={(event) => handleChange(field, event.target.value)}
                className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
              >
                <option value="">{`${field.charAt(0).toUpperCase() + field.slice(1)} (cm)`}</option>
                {measurementOptions.map((option) => (
                  <option key={`${field}-${option}`}>{option}</option>
                ))}
              </select>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <select
              value={form.shoes}
              onChange={(event) => handleChange("shoes", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            >
              <option value="">Shoes (EU/US)</option>
              {genderedShoeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={form.eyes}
              onChange={(event) => handleChange("eyes", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            >
              <option value="">Eyes</option>
              {eyeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={form.hair}
              onChange={(event) => handleChange("hair", event.target.value)}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            >
              <option value="">Hair</option>
              {hairOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <textarea
            value={form.experience}
            onChange={(event) => handleChange("experience", event.target.value)}
            rows={3}
            placeholder="Modeling experience / agencies"
            className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
          />

          <textarea
            value={form.travelAvailability}
            onChange={(event) => handleChange("travelAvailability", event.target.value)}
            rows={2}
            placeholder="Availability to travel (dates / duration)"
            className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
          />

          <textarea
            value={form.notes}
            onChange={(event) => handleChange("notes", event.target.value)}
            rows={2}
            placeholder="Additional notes (scars, tattoos, references)"
            className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
          />

          <div className="space-y-2 rounded-2xl border border-dashed border-[var(--border-color)] p-4 text-center">
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
            <label
              htmlFor={fileInputId}
              className="mx-auto inline-flex cursor-pointer items-center rounded-full border border-black px-4 py-1 text-xs uppercase tracking-[0.4em]"
            >
              Select images
            </label>
            <p className="text-xs text-[var(--muted)]">
              Drag and drop digitals (full-length front, profile, close-up). Max {MAX_UPLOAD_FILES} files.
            </p>
            <p className="text-xs text-[var(--muted)]">
              {files.length}/{MAX_UPLOAD_FILES} selected
            </p>
            {fileError ? (
              <p className="text-xs text-red-600" role="alert">
                {fileError}
              </p>
            ) : null}
            {previewUrls.length ? (
              <div className="grid gap-3 pt-3 sm:grid-cols-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white"
                  >
                    <img
                      src={url}
                      alt={`Upload preview ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {formError ? (
            <p className="text-center text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border-color)] text-black focus:ring-black"
              required
            />
            <span className="text-sm text-[var(--muted)]">
              I have read and accept the Application Process and Rules and the Privacy Policy.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.4em] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-white p-8 shadow-xl">
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-black transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-light tracking-[0.1em] text-[var(--foreground)]">
                Submission Received
              </h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                Thank you! Your submission has been received. Our scouts will review your application and reply if there is interest.
                <br />
                <br />
                Follow our Instagram to stay updated.
              </p>
              <a
                href="https://www.instagram.com/3mmodels_official/"
                target="_blank"
                rel="noreferrer"
                onClick={async () => {
                  // Track Instagram click from submission popup
                  try {
                    await fetch("/api/metrics/instagram", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ source: "submission" }),
                    });
                  } catch {
                    // ignore failures, don't block navigation
                  }
                  setShowSuccessPopup(false);
                }}
                className="block w-full rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.4em] transition hover:bg-black hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

