import {
  cleanHtml,
  formatDate,
  downloadFile,
  formatObjectUrl,
} from "./exportUtils";

export function exportToCsvTwoFiles(texts, projectInfo, projectSettings = {}) {
  // Determine if we should include authors based on project settings
  const includeAuthors = !projectInfo.doNotSaveAuthorNames;

  // Export project metadata CSV first
  exportProjectMetadataCsv(projectInfo, projectSettings);

  // Export texts CSV second (with a small delay to ensure both downloads work)
  setTimeout(() => {
    exportTextsCsv(texts, projectInfo, projectSettings, includeAuthors);
  }, 500);
}

/**
 * Export project metadata as a separate CSV file
 */
function exportProjectMetadataCsv(projectInfo, projectSettings = {}) {
  // Define all project metadata fields in logical order
  const metadataFields = [
    { key: "projectReferenceNumber", label: "Project reference number" },
    { key: "projectTitle", label: "Project title" },
    { key: "projectOrganiser", label: "Project organiser" },
    { key: "projectStartDate", label: "Project start date" },
    { key: "projectEndDate", label: "Project end date" },
    { key: "textNumberPrefix", label: "Text number prefix" },
    { key: "projectType", label: "Project type" },
    { key: "projectVenue", label: "Project venue" },
    { key: "textAudience", label: "Text audience" },
    { key: "copyrightLicensor", label: "Copyright licensor" },
    { key: "usageLicence", label: "Usage licence" },
    { key: "creditLine", label: "Credit line" },
    { key: "rightsReferenceNumber", label: "Rights reference number" },
    { key: "projectNote", label: "Project note" },
    { key: "mdsApiToken", label: "MDS API token" },
  ];

  // Project settings fields
  const settingsFields = [
    { key: "hasHierarchicalText", label: "Has hierarchical text" },
    { key: "tracksTextStatus", label: "Tracks text status" },
    { key: "wantsTextTags", label: "Wants text tags" },
    { key: "doNotSaveAuthorNames", label: "Do not save author names" },
  ];

  // Array fields that need special handling
  const arrayFields = [
    { key: "authors", label: "Project authors" },
    { key: "languages", label: "Project languages" },
    { key: "textStatuses", label: "Text statuses" },
    { key: "textTags", label: "Text tags" },
  ];

  // CSV headers
  const headers = ["Field", "Value"];

  // Start CSV content
  let csvContent = headers.map((header) => `"${header}"`).join(",") + "\r\n";

  // Add basic metadata fields
  metadataFields.forEach((field) => {
    const value = projectInfo[field.key] || "";
    if (value || field.key === "projectReferenceNumber") {
      // Always include project reference number
      csvContent += `"${field.label}","${value
        .toString()
        .replace(/"/g, '""')}"\r\n`;
    }
  });

  // Add settings fields
  settingsFields.forEach((field) => {
    const value = projectSettings[field.key] || projectInfo[field.key] || false;
    csvContent += `"${field.label}","${value}"\r\n`;
  });

  // Add array fields (join with semicolons)
  arrayFields.forEach((field) => {
    const value = projectInfo[field.key] || [];
    if (Array.isArray(value) && value.length > 0) {
      csvContent += `"${field.label}","${value.join("; ")}"\r\n`;
    }
  });

  // Add export timestamp
  csvContent += `"Export date","${new Date().toISOString()}"\r\n`;

  // Prepend BOM for UTF-8 encoding
  const BOM = "\uFEFF";
  const csv = BOM + csvContent;

  // Download the project metadata CSV
  downloadFile(
    `${projectInfo.projectReferenceNumber || "project"}_metadata`,
    csv,
    "text/csv;charset=utf-8"
  );
}

/**
 * Export texts data as a separate CSV file
 */
function exportTextsCsv(
  texts,
  projectInfo,
  projectSettings = {},
  includeAuthors
) {
  // Define headers for the texts CSV
  const headers = [
    "Project reference number",
    "Reference number",
    "Text",
    "Date",
  ];

  // Conditionally add authors header
  if (includeAuthors) {
    headers.push("Authors");
  }

  // Add the rest of the headers
  headers.push(
    "Languages",
    "Status",
    "Parent text",
    "Tag",
    "Note",
    "Linked object UIDs"
  );

  // Start CSV content with headers
  let csvContent = headers.map((header) => `"${header}"`).join(",") + "\r\n";

  // Sort texts by reference number for consistent output
  const sortedTexts = [...texts].sort((a, b) =>
    (a.textReferenceNumber || "").localeCompare(b.textReferenceNumber || "")
  );

  // Map texts to rows
  const rows = sortedTexts.map((text) => {
    const row = [
      projectInfo.projectReferenceNumber || "", // Include project reference in each row
      text.textReferenceNumber || "",
      cleanHtml(text.text || ""), // Preserve HTML markup but clean for CSV
      formatDate(text.textDate),
    ];

    // Conditionally add authors field
    if (includeAuthors) {
      row.push((text.textAuthors || []).join(", "));
    }

    // Add the rest of the fields
    row.push(
      (text.textLanguages || []).join(", "),
      text.textStatus || "",
      text.parentText || "",
      text.textTag || "",
      text.textNote || "",
      // Ensure all object UIDs have the full URL
      (text.linkedObjects || []).map((uid) => formatObjectUrl(uid)).join("; ")
    );

    return row;
  });

  // Add data rows to CSV
  csvContent += rows
    .map((row) =>
      row
        .map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  // Prepend BOM for UTF-8 encoding
  const BOM = "\uFEFF";
  const csv = BOM + csvContent;

  // Download the texts CSV file
  downloadFile(
    `${projectInfo.projectReferenceNumber || "project"}_texts`,
    csv,
    "text/csv;charset=utf-8"
  );
}
