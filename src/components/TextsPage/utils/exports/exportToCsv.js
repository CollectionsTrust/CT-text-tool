import {
  cleanHtml,
  formatDate,
  downloadFile,
  formatObjectUrl,
} from "./exportUtils";

import { constructProjectMetadataCsv } from "./exportToCsvTwoFiles";

export function exportToCsv(texts, projectInfo, projectSettings = {}) {
  // Determine if we should include authors based on project settings
  const includeAuthors = !projectInfo.doNotSaveAuthorNames;

  // Create the project metadata as JSON
  const projectMetadata = constructProjectMetadataCsv(
    projectInfo,
    projectSettings
  );

  // Start with a JSON metadata header line that's commented out in the CSV
  let csvContent = projectMetadata;

  // Add a blank line between project metadata and texts
  csvContent += "\n";

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
    "Linked object UIDs",
    "Linked object numbers"
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
      (text.linkedObjects || [])
        .map((obj) => obj.uid)
        .filter((uid) => uid)
        .map((uid) => formatObjectUrl(uid))
        .join("; "),
      (text.linkedObjects || []).map((obj) => obj.objectNumber).join("; ")
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
