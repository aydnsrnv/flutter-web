"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useI18n } from "@/lib/i18n/client";
import { SingleSelectDropdown } from "@/components/single-select-dropdown";
import { Input } from "@/components/ui/input";

type Opt = { value: string; label: string };

const LANGUAGE_OPTIONS = [
  "Azərbaycan dili",
  "English",
  "Русский",
  "Türkçe",
  "Deutsch",
  "Français",
  "Español",
  "Português",
  "Italiano",
  "العربية",
  "فارسی",
  "中文",
  "한국어",
  "हिन्दी",
] as const;

const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function normalizeTokenList(value: string) {
  const tokens = value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return tokens.join(", ");
}

export default function ResumeFiltersPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [positionContains, setPositionContains] = useState("");
  const [city, setCity] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [gender, setGender] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [skills, setSkills] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageName, setLanguageName] = useState("");
  const [languageLevel, setLanguageLevel] = useState("");

  const cityOptions: Opt[] = useMemo(() => {
    const keys = [
      "city_baku",
      "city_absheron",
      "city_ganja",
      "city_sumgait",
      "city_mingechevir",
      "city_khankendi",
      "city_lenkeran",
      "city_sheki",
      "city_shirvan",
      "city_nakhchivan",
      "city_quba",
      "city_qusar",
      "city_qabala",
      "city_zaqatala",
      "city_shamakhi",
      "city_tovuz",
      "city_agdam",
      "city_fuzuli",
      "city_shamkir",
      "city_barda",
      "city_masalli",
      "city_salyan",
      "city_astara",
      "city_yevlakh",
      "city_qazakh",
      "city_gadabay",
      "city_sabirabad",
      "city_zardab",
      "city_imishli",
      "city_balakan",
      "city_saatli",
      "city_ujar",
      "city_beylagan",
      "city_agjabadi",
      "city_agdash",
      "city_hajigabul",
      "city_gobustan",
      "city_qakh",
      "city_samukh",
      "city_tartar",
      "city_khizi",
      "city_goychay",
      "city_kurdamir",
      "city_siazan",
      "city_aghstafa",
      "city_neftchala",
      "city_shabran",
      "city_lerik",
      "city_yardimli",
      "city_jalilabad",
      "city_aghdara",
      "city_agsu",
      "city_ali_bayramli",
      "city_culfa",
      "city_dashkasan",
      "city_goygol",
      "city_goytepe",
      "city_ismayilli",
      "city_kalbajar",
      "city_lachin",
      "city_naftalan",
      "city_oguz",
      "city_ordubad",
      "city_garadag",
      "city_qubadli",
      "city_shahbuz",
      "city_sharur",
      "city_shusha",
      "city_khirdalan",
      "city_khojali",
      "city_khojavend",
      "city_khudat",
      "city_zangilan",
    ];

    return keys.map((key) => ({
      value: key,
      label: t(key),
    }));
  }, [t]);

  const educationOptions: Opt[] = useMemo(() => {
    const keys = [
      "education_higher",
      "education_incomplete_higher",
      "education_secondary_special",
    ];

    return keys.map((key) => ({
      value: key,
      label: t(key),
    }));
  }, [t]);

  const experienceOptions: Opt[] = useMemo(() => {
    const keys = [
      "exp_none",
      "exp_less_than_one",
      "exp_one_to_three",
      "exp_three_to_five",
      "exp_more_than_five",
    ];

    return keys.map((key) => ({
      value: key,
      label: t(key),
    }));
  }, [t]);

  const genderOptions: Opt[] = useMemo(
    () => [
      { value: "male", label: t("male") },
      { value: "female", label: t("female") },
    ],
    [t],
  );

  const languageOptions: Opt[] = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((item) => ({
        value: item,
        label: item,
      })),
    [],
  );

  const languageLevelOptions: Opt[] = useMemo(
    () =>
      LANGUAGE_LEVELS.map((item) => ({
        value: item,
        label: item,
      })),
    [],
  );

  const languagesValue = useMemo(
    () => selectedLanguages.join(", "),
    [selectedLanguages],
  );

  function addLanguage() {
    const name = languageName.trim();
    const level = languageLevel.trim();
    if (!name || !level) return;

    const entry = `${name} (${level})`;
    setSelectedLanguages((prev) =>
      prev.includes(entry) ? prev : [...prev, entry],
    );
    setLanguageName("");
    setLanguageLevel("");
  }

  function removeLanguage(entry: string) {
    setSelectedLanguages((prev) => prev.filter((item) => item !== entry));
  }

  function clearAll() {
    setPositionContains("");
    setCity("");
    setEducation("");
    setExperience("");
    setGender("");
    setPremiumOnly(false);
    setMinAge("");
    setMaxAge("");
    setMinSalary("");
    setMaxSalary("");
    setSkills("");
    setSelectedLanguages([]);
    setLanguageName("");
    setLanguageLevel("");
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (positionContains.trim())
      params.set("positionContains", positionContains.trim());
    if (city) params.set("city", city);
    if (education) params.set("education", education);
    if (experience) params.set("experience", experience);
    if (gender) params.set("gender", gender);
    if (premiumOnly) params.set("premiumOnly", "1");
    if (minAge.trim()) params.set("minAge", minAge.trim());
    if (maxAge.trim()) params.set("maxAge", maxAge.trim());
    if (minSalary.trim()) params.set("minSalary", minSalary.trim());
    if (maxSalary.trim()) params.set("maxSalary", maxSalary.trim());

    const normalizedSkills = normalizeTokenList(skills);
    if (normalizedSkills) params.set("skills", normalizedSkills);

    if (languagesValue) params.set("languages", languagesValue);

    const qs = params.toString();
    router.push(qs ? `/resume-filter-results?${qs}` : "/resume-filter-results");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-2">
        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-1 text-[14px] font-semibold">
              {t("filtersPositionIncludes")}
            </div>
            <Input
              value={positionContains}
              onChange={(e) => setPositionContains(e.target.value)}
              placeholder={t("filtersPositionHint")}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t("city")}</div>
            <SingleSelectDropdown
              value={city}
              onChange={setCity}
              placeholder={t("select_city")}
              searchPlaceholder={t("search_city")}
              options={cityOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">
              {t("education")}
            </div>
            <SingleSelectDropdown
              value={education}
              onChange={setEducation}
              placeholder={t("select_education")}
              options={educationOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">
              {t("experience")}
            </div>
            <SingleSelectDropdown
              value={experience}
              onChange={setExperience}
              placeholder={t("select_experience")}
              options={experienceOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t("gender")}</div>
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((opt) => {
                const selected = gender === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    className="h-12 rounded-[16px] border text-[14px] font-semibold transition-colors"
                    style={{
                      borderColor: selected ? "#245BEB" : "var(--border)",
                      backgroundColor: selected
                        ? "rgba(36, 91, 235, 0.10)"
                        : "transparent",
                      color: selected ? "#245BEB" : "var(--foreground)",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">
              {t("filtersAgeRange")}
            </div>
            <div className="flex gap-3">
              <Input
                placeholder={t("filters_min_short")}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                inputMode="numeric"
              />
              <Input
                placeholder={t("filters_max_short")}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">
              {t("filtersSalaryRangeAzn")}
            </div>
            <div className="flex gap-3">
              <Input
                placeholder={t("filters_min_short")}
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                inputMode="numeric"
              />
              <Input
                placeholder={t("filters_max_short")}
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">
              {t("filtersSkillsCommaSeparated")}
            </div>
            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder={t("filtersSkillsHint")}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">
              {t("filtersLanguages")}
            </div>
            <div className="grid gap-3">
              <SingleSelectDropdown
                value={languageName}
                onChange={setLanguageName}
                placeholder={t("filtersSelectLanguage")}
                options={languageOptions}
              />

              <SingleSelectDropdown
                value={languageLevel}
                onChange={setLanguageLevel}
                placeholder={t("filtersSelectLevel")}
                options={languageLevelOptions}
              />

              <button
                type="button"
                onClick={addLanguage}
                className="h-11 rounded-[14px] border"
                style={{
                  borderColor: "#245BEB",
                  color: "#245BEB",
                  fontWeight: 600,
                  backgroundColor: "transparent",
                }}
              >
                {t("add")}
              </button>

              {selectedLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedLanguages.map((entry) => (
                    <div
                      key={entry}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold"
                      style={{
                        backgroundColor: "rgba(36, 91, 235, 0.10)",
                        color: "#245BEB",
                      }}
                    >
                      <span>{entry}</span>
                      <button
                        type="button"
                        onClick={() => removeLanguage(entry)}
                        className="leading-none"
                        aria-label={t("clear")}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[14px] font-semibold">
              {t("filtersPremiumOnly")}
            </div>
            <input
              type="checkbox"
              checked={premiumOnly}
              onChange={(e) => setPremiumOnly(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>

      <div className="pb-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 flex-1 rounded-[14px]"
            style={{
              backgroundColor: "#245BEB",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {t("apply")}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="h-11 rounded-[14px] px-4"
            style={{
              color: "#245BEB",
              fontWeight: 600,
              backgroundColor: "transparent",
            }}
          >
            {t("clear")}
          </button>
        </div>
      </div>
    </div>
  );
}
