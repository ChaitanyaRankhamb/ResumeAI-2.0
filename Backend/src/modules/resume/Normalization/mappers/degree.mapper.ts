/**
 * Canonical degree mapping dictionary
 * Maps different degree variations to standardized forms
 */
export const DEGREE_CANONICAL_MAP: Record<string, string> = {
  // Bachelor's degrees
  "b.tech": "bachelor_of_technology",
  btech: "bachelor_of_technology",
  "bachelor of technology": "bachelor_of_technology",
  "b.e": "bachelor_of_engineering",
  be: "bachelor_of_engineering",
  "bachelor of engineering": "bachelor_of_engineering",
  "b.sc": "bachelor_of_science",
  bsc: "bachelor_of_science",
  "bachelor of science": "bachelor_of_science",
  "b.com": "bachelor_of_commerce",
  bcom: "bachelor_of_commerce",
  "bachelor of commerce": "bachelor_of_commerce",
  "b.a": "bachelor_of_arts",
  ba: "bachelor_of_arts",
  "bachelor of arts": "bachelor_of_arts",
  "b.ca": "bachelor_of_computer_applications",
  bca: "bachelor_of_computer_applications",
  "bachelor of computer applications": "bachelor_of_computer_applications",

  // Master's degrees
  "m.tech": "master_of_technology",
  mtech: "master_of_technology",
  "master of technology": "master_of_technology",
  "m.e": "master_of_engineering",
  me: "master_of_engineering",
  "master of engineering": "master_of_engineering",
  "m.sc": "master_of_science",
  msc: "master_of_science",
  "master of science": "master_of_science",
  "m.com": "master_of_commerce",
  mcom: "master_of_commerce",
  "master of commerce": "master_of_commerce",
  "m.a": "master_of_arts",
  ma: "master_of_arts",
  "master of arts": "master_of_arts",
  mca: "master_of_computer_applications",
  "master of computer applications": "master_of_computer_applications",
  mba: "master_of_business_administration",
  "master of business administration": "master_of_business_administration",

  // Doctorate
  phd: "doctor_of_philosophy",
  "ph.d": "doctor_of_philosophy",
  "doctor of philosophy": "doctor_of_philosophy",
};

/**
 * Normalizes a degree string to its canonical form
 * @param degree - The degree string to normalize
 * @returns The canonical degree name or the original if not found
 */
export function normalizeDegree(degree: string): string {
  if (!degree || typeof degree !== "string") {
    return "";
  }

  const key = degree.toLowerCase().trim();
  
  return DEGREE_CANONICAL_MAP[key] || key;
}
