import {
  cleanHtml,
  formatDate,
  downloadFile,
  formatObjectUrl,
} from "./exportUtils";

export function exportToCsv(texts, projectInfo, projectSettings = {}) {
  // Determine if we should include authors based on project settings
  const includeAuthors = !projectInfo.doNotSaveAuthorNames;

  // Create the project metadata as JSON
  const projectMetadata = createProjectMetadata(projectInfo, projectSettings);

  // Encode the JSON as base64 to ensure it doesn't interfere with CSV parsing
  const encodedMetadata = btoa(JSON.stringify(projectMetadata));

  // Start with a JSON metadata header line that's commented out in the CSV
  let csvContent = `# PROJECT_METADATA_JSON_BASE64:${encodedMetadata}\r\n`;

  // Define headers for the texts CSV - using sentence case
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

  // Add headers to CSV
  csvContent += headers.map((header) => `"${header}"`).join(",") + "\r\n";

  // Map texts to rows
  const rows = texts.map((text) => {
    const row = [
      projectInfo.projectReferenceNumber || "", // Using project reference number instead of ID
      text.textReferenceNumber || "",
      cleanHtml(text.text || ""), // Preserve HTML markup
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

  // Download the CSV file
  downloadFile(
    projectInfo.projectReferenceNumber || "project_texts",
    csv,
    "text/csv;charset=utf-8"
  );
}

/**
 * Creates a structured object with all relevant project metadata
 */
function createProjectMetadata(projectInfo, projectSettings = {}) {
  // Create a clean metadata object with the same fields as in the JSON export
  const metadata = {
    project: {
      id: projectInfo.id || "",
      projectReferenceNumber: projectInfo.projectReferenceNumber || "",
      textNumberPrefix: projectInfo.textNumberPrefix || "",
      projectTitle: projectInfo.projectTitle || "",
      projectOrganiser: projectInfo.projectOrganiser || "",
      projectStartDate: projectInfo.projectStartDate || "",
      projectEndDate: projectInfo.projectEndDate || "",
      projectNote: projectInfo.projectNote || "",
      copyrightLicensor: projectInfo.copyrightLicensor || "",
      usageLicence: projectInfo.usageLicence || "",
      projectType: projectInfo.projectType || "",
      projectVenue: projectInfo.projectVenue || "",
      creditLine: projectInfo.creditLine || "",
      textAudience: projectInfo.textAudience || "",
      rightsReferenceNumber: projectInfo.rightsReferenceNumber || "",
      hasHierarchicalText:
        projectSettings.hasHierarchicalText ||
        projectInfo.hasHierarchicalText ||
        false,
      tracksTextStatus:
        projectSettings.tracksTextStatus ||
        projectInfo.tracksTextStatus ||
        false,
      wantsTextTags:
        projectSettings.wantsTextTags || projectInfo.wantsTextTags || false,
      doNotSaveAuthorNames:
        projectSettings.doNotSaveAuthorNames ||
        projectInfo.doNotSaveAuthorNames ||
        false,
      textStatuses: projectInfo.textStatuses || [],
      textTags: projectInfo.textTags || [],
      languages: projectInfo.languages || [],
      mdsApiToken: projectInfo.mdsApiToken || "",
      authors: projectInfo.authors || [],
    },
    settings: projectSettings || {},
    exportDate: new Date().toISOString(),
  };

  return metadata;
}
