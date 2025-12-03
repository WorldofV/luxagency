"use client";

import { useState } from "react";

const genderOptions = ["Female", "Male", "Non Binary"];
const heightOptions = [
  "165cm - 5' 5''",
  "166cm - 5' 5.5''",
  "167cm - 5' 6''",
  "168cm - 5' 6''",
  "169cm - 5' 6.5''",
  "170cm - 5' 7''",
  "171cm - 5' 7.5''",
  "172cm - 5' 8''",
  "173cm - 5' 8.5''",
  "174cm - 5' 9''",
  "175cm - 5' 9''",
  "176cm - 5' 9.5''",
  "177cm - 5' 10''",
  "178cm - 5' 10.5''",
  "179cm - 5' 10.5''",
  "180cm - 5' 11''",
  "181cm - 5' 11.5''",
  "182cm - 6' 0''",
  "183cm - 6' 0''",
  "184cm - 6' 0.5''",
  "185cm - 6' 1''",
  "186cm - 6' 1''",
  "187cm - 6' 1.5''",
  "188cm - 6' 2''",
  "189cm - 6' 2''",
  "190cm - 6' 2.5''",
  "191cm - 6' 3''",
  "192cm - 6' 3.5''",
  "193cm - 6' 4''",
  "194cm - 6' 4.5''",
  "195cm - 6' 5''",
];

const measurementOptions = [
  "52 cm / 20''",
  "53 cm / 20''",
  "54 cm / 21''",
  "55 cm / 21''",
  "56 cm / 22''",
  "57 cm / 22''",
  "58 cm / 23''",
  "59 cm / 23''",
  "60 cm / 23''",
  "61 cm / 24''",
  "62 cm / 24''",
  "63 cm / 24''",
  "64 cm / 25''",
  "65 cm / 25''",
  "66 cm / 25''",
  "67 cm / 26''",
  "68 cm / 26''",
  "69 cm / 27''",
  "70 cm / 27''",
  "71 cm / 27''",
  "72 cm / 28''",
  "73 cm / 28''",
  "74 cm / 29''",
  "75 cm / 29''",
  "76 cm / 30''",
  "77 cm / 30''",
  "78 cm / 30''",
  "79 cm / 31''",
  "80 cm / 31''",
  "81 cm / 32''",
  "82 cm / 32''",
  "83 cm / 32''",
  "84 cm / 33''",
  "85 cm / 33''",
  "86 cm / 34''",
  "87 cm / 34''",
  "88 cm / 35''",
  "89 cm / 35''",
  "90 cm / 35''",
  "91 cm / 36''",
  "92 cm / 36''",
  "93 cm / 36''",
  "94 cm / 37''",
  "95 cm / 37''",
  "96 cm / 37''",
  "97 cm / 38''",
  "98 cm / 38''",
  "99 cm / 39''",
  "100 cm / 39''",
  "101 cm / 39''",
  "102 cm / 40''",
  "103 cm / 40''",
  "104 cm / 40''",
  "105 cm / 41''",
];

const shoeOptions = [
  "39 - 6.5",
  "40 - 7.5",
  "41 - 8",
  "42 - 8.5",
  "43 - 9",
  "43.5 - 9.5",
  "44 - 10",
  "44.5 - 10.5",
  "45 - 11",
  "45.5 - 11.5",
  "46 - 12",
];

const eyeOptions = ["Black", "Blue", "Brown", "Green", "Hazel", "Honey", "Gray"];
const hairOptions = [
  "Black",
  "Brown",
  "Light Brown",
  "Medium Brown",
  "Dark Brown",
  "Blond",
  "Light Blond",
  "Dark Blond",
  "Strawberry Blond",
  "Red",
  "Gray",
  "White",
];

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
  const [files, setFiles] = useState<FileList | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (files) {
      Array.from(files).forEach((file) => data.append("images", file));
    }

    const response = await fetch("/api/submissions", {
      method: "POST",
      body: data,
    });

    setSubmitting(false);
    if (response.ok) {
      setSuccess(true);
      setForm((prev) => ({ ...prev, firstName: "", lastName: "", email: "", instagram: "", phone: "" }));
      setFiles(null);
    }
  };

  return (
    <section className="space-y-10">
      <header className="space-y-4 text-center">
        <p className="section-title">Become a model</p>
        <h1 className="text-4xl font-light tracking-[0.1em] text-[var(--foreground)] sm:text-5xl">
          Submit your digitals for 3MMODELS consideration.
        </h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Following the requirements published on the official board{" "}
          <a href="https://3mmodels.com/become" className="underline" target="_blank" rel="noreferrer">
            (3mmodels.com/become)
          </a>{" "}
          we review applications for Women (15-23, 173-180cm) and Men (15-25, 184-195cm). Please fill the form and
          upload natural digitals: full-length, profile, and close-up.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <div className="space-y-6 rounded-[32px] border border-[var(--border-color)] bg-white/85 p-8">
          <p className="section-title">Submission rules</p>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li>Photos must be recent, natural light, no heavy makeup.</li>
            <li>Include accurate measurements and current location.</li>
            <li>Applicants under 18 must have a parent or guardian submit.</li>
            <li>List availability to travel for show seasons or development.</li>
            <li>Files accepted: JPG/PNG up to 5 images.</li>
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
              value={form.birthday}
              onChange={(event) => handleChange("birthday", event.target.value)}
              placeholder="Birthday"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder="Phone"
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
              {shoeOptions.map((option) => (
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
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Pictures*</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(event.target.files)}
              className="mx-auto block"
            />
            <p className="text-xs text-[var(--muted)]">
              Drag and drop digitals (full-length front, profile, close-up). Max 5 files.
            </p>
          </div>

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

