"use client";

import { useEffect, useId, useState } from "react";
import type { ChangeEvent } from "react";

import {
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
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputId = useId();
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    setFormError(null);
    setSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    files.slice(0, MAX_UPLOAD_FILES).forEach((file) => data.append("images", file));

    const response = await fetch("/api/submissions", {
      method: "POST",
      body: data,
    });

    setSubmitting(false);
    if (response.ok) {
      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        email: "",
        instagram: "",
        phone: "",
        phonePrefix: "",
      }));
      setFiles([]);
      setFileError(null);
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
          {success ? (
            <p className="rounded-2xl border border-green-600 bg-green-50 px-4 py-3 text-sm text-green-700">
              Thank you! Your submission has been received. Our scouts will reply if there is interest.
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[32px] border border-[var(--border-color)] bg-white/90 p-8">
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
            <input
              value={form.nationality}
              onChange={(event) => handleChange("nationality", event.target.value)}
              placeholder="Nationality"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
            <input
              value={form.citizenship}
              onChange={(event) => handleChange("citizenship", event.target.value)}
              placeholder="Citizenship"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={form.languages}
              onChange={(event) => handleChange("languages", event.target.value)}
              placeholder="Languages"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
            <input
              value={form.currentCity}
              onChange={(event) => handleChange("currentCity", event.target.value)}
              placeholder="Current city"
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm"
            />
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.4em] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </div>
    </section>
  );
}

