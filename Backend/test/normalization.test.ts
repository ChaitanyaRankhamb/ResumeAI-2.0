import assert from "node:assert/strict";
import test from "node:test";
import { processResume } from "../src/modules/resume/Normalization";
import { validateStructuredData } from "../src/validations/resumeStructureData.validation";

test("validation normalizes certification date aliases into issueDate", () => {
  const validated = validateStructuredData({
    certifications: [{ name: "aws cloud practitioner", issuer: "AWS", year: "2024" }],
  });

  assert.equal(validated.certifications[0].issueDate, "2024");
  assert.equal("year" in validated.certifications[0], false);
});

test("normalization sanitizes text and keeps URL protocols safe", async () => {
  const result = await processResume(
    validateStructuredData({
      identity: {
        name: "<b>jane DOE</b>",
        email: "JANE@EXAMPLE.COM",
        phone: "+1 415 555 2671",
        github: "javascript:alert(1)",
        portfolio: "Example.com/Portfolio",
      },
      summary: "<script>alert(1)</script> Full stack engineer with production systems.",
    }),
  );

  assert.equal(result.success, true);
  assert.equal(result.data?.identity.email, "jane@example.com");
  assert.equal(result.data?.identity.phone, "+14155552671");
  assert.equal(result.data?.identity.github, null);
  assert.equal(result.data?.identity.portfolio, "https://example.com/Portfolio");
  assert.match(result.data?.summary ?? "", /Full stack engineer/);
});

test("normalization preserves present roles for deterministic duration enrichment", async () => {
  const result = await processResume(
    validateStructuredData({
      experience: [
        {
          company: "acme",
          role: "senior REST API engineer",
          startDate: "Jan 2024",
          endDate: "Present",
          technologies: ["nodejs", "aws"],
          description: ["built APIs"],
        },
      ],
    }),
  );

  assert.equal(result.success, true);
  assert.equal(result.data?.experience[0].startDate, "2024-01");
  assert.equal(result.data?.experience[0].endDate, "present");
  assert.ok((result.data?.enrichedExperience?.[0].durationInMonths ?? 0) > 0);
  assert.equal(result.data?.experience[0].role, "Senior REST API Engineer");
});
