// File: exportToHtml.js (Updated with Correct Sentence Case and HTML Preservation)

import {
  formatDate,
  downloadFile,
  cleanHtml,
  toSentenceCase,
  formatObjectUrl,
} from "./exportUtils";

function buildObjectUidMap(projectId) {
  const map = {};
  try {
    const meta = JSON.parse(
      localStorage.getItem(`mdsRecordsMeta_${projectId}`)
    );
    const chunks = meta?.chunks || 0;

    for (let i = 0; i < chunks; i++) {
      const chunkStr = localStorage.getItem(
        `mdsRecordsData_${projectId}_chunk_${i}`
      );
      if (!chunkStr) continue;

      const records = JSON.parse(chunkStr);
      for (const record of records) {
        const uid = record["@admin"]?.uid;
        const collection =
          record["@admin"]?.data_source?.organisation || "Unknown Collection";
        const objectNumberUnit = record["@document"]?.units?.find(
          (u) => u.type === "spectrum/object_number"
        );
        const objectNumber = objectNumberUnit?.value || "Unknown Object";

        if (uid) {
          map[uid] = `${collection} ${objectNumber}`;
        }
      }
    }
  } catch (err) {
    console.error("Failed to build UID map from localStorage:", err);
  }
  return map;
}

export function exportToHtml(texts, projectInfo) {
  const objectUidMap = buildObjectUidMap(projectInfo.id);
  // Determine if we should include authors based on project settings
  const includeAuthors = !projectInfo.doNotSaveAuthorNames;

  // Define metadata fields to include, ordered with reference number first
  const metadataFields = [
    "projectReferenceNumber",
    "projectOrganiser",
    "projectStartDate",
    "projectEndDate",
    "projectNote",
    "copyrightLicensor",
    "usageLicence",
    "projectType",
    "projectVenue",
    "creditLine",
    "textAudience",
    "rightsReferenceNumber",
    "textNumberPrefix",
  ];

  // Generate HTML for project metadata, with sentence case field names
  const projectMetadata = metadataFields
    .map((key) => {
      if (projectInfo[key]) {
        // Apply proper sentence case to field names
        return `<div><strong>${toSentenceCase(key)}:</strong> ${
          projectInfo[key]
        }</div>`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  const sortedTexts = [...texts].sort((a, b) =>
    a.textReferenceNumber.localeCompare(b.textReferenceNumber)
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${projectInfo.projectTitle || "Project Texts"}</title>
  <style>
    body { font-family: sans-serif; padding: 20px; color: #333; max-width: 800px; margin: auto; }
    h1 { color: #444; }
    .project-info { font-style: italic; color: #666; margin-bottom: 1em; }
    .text-item { border-bottom: 1px solid #ccc; margin-bottom: 2em; padding-bottom: 1em; }
    .text-metadata { font-size: 0.9em; color: #555; margin-top: 0.5em; }
    .text-metadata div { margin: 0.25em 0; }
  </style>
</head>
<body>
  <h1>${projectInfo.projectTitle}</h1>
  <div class="project-info">
    ${projectMetadata}
  </div>

  ${sortedTexts
    .map(
      (text) => `
    <div class="text-item">
      <h2>${text.textReferenceNumber}</h2>
      <div class="text-content">${cleanHtml(text.text)}</div>
      <div class="text-metadata">
        ${
          includeAuthors
            ? `<div><strong>${toSentenceCase("authors")}:</strong> ${(
                text.textAuthors || []
              ).join(", ")}</div>`
            : ""
        }
        <div><strong>${toSentenceCase("languages")}:</strong> ${(
        text.textLanguages || []
      ).join(", ")}</div>
        <div><strong>${toSentenceCase("date")}:</strong> ${formatDate(
        text.textDate
      )}</div>
        ${
          text.textStatus
            ? `<div><strong>${toSentenceCase("status")}:</strong> ${
                text.textStatus
              }</div>`
            : ""
        }
        ${
          text.parentText
            ? `<div><strong>${toSentenceCase("parentText")}:</strong> ${
                text.parentText
              }</div>`
            : ""
        }
        ${
          text.textTag
            ? `<div><strong>${toSentenceCase("tag")}:</strong> ${
                text.textTag
              }</div>`
            : ""
        }
        ${
          text.textNote
            ? `<div><strong>${toSentenceCase("note")}:</strong> ${
                text.textNote
              }</div>`
            : ""
        }
        ${
          (text.linkedObjects || []).length > 0
            ? `<div><strong>${toSentenceCase(
                "linkedObjects"
              )}:</strong> ${text.linkedObjects
                .map((uid) => {
                  const label = objectUidMap[uid] || uid;
                  const url = formatObjectUrl(uid);
                  return `<a href="${url}" target="_blank">${label}</a>`;
                })
                .join(", ")}</div>`
            : ""
        }
        ${
          (text.linkedObjectsNumbers || []).length > 0
            ? `<div>
                <strong>${toSentenceCase(
                  "linkedObjectNumbers"
                )}:</strong>&nbsp;${text.linkedObjectsNumbers.join(", ")}
              </div>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("")}

  <footer style="margin-top: 2em; font-size: 0.8em; color: #999; text-align: right;">
    Exported on ${formatDate(new Date())}
  </footer>
</body>
</html>`;

  downloadFile(
    projectInfo.projectReferenceNumber || "texts",
    html,
    "text/html;charset=utf-8"
  );
}
