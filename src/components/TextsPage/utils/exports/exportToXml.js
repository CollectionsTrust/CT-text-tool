import { formatDate, downloadFile, formatObjectUrl } from "./exportUtils";

function escapeXml(unsafe = "") {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export function exportToXml(texts, projectInfo, projectSettings = {}) {
  // Determine if we should include authors based on project settings
  const includeAuthors = !projectInfo.doNotSaveAuthorNames;

  // Define all metadata fields to match JSON export
  const metadataFields = [
    "projectReferenceNumber",
    "textNumberPrefix",
    "projectTitle",
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
  ];

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<project>`;

  // Add standard metadata fields
  const metadata = metadataFields
    .map((key) => {
      if (projectInfo[key]) {
        return `  <${key}>${escapeXml(projectInfo[key])}</${key}>`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  // Export date as a separate field
  const exportDate = `  <exportDate>${new Date().toISOString()}</exportDate>`;

  // Add settings section
  const settings = `  <settings>
    <hasHierarchicalText>${
      projectSettings.hasHierarchicalText ||
      projectInfo.hasHierarchicalText ||
      false
    }</hasHierarchicalText>
    <tracksTextStatus>${
      projectSettings.tracksTextStatus || projectInfo.tracksTextStatus || false
    }</tracksTextStatus>
    <wantsTextTags>${
      projectSettings.wantsTextTags || projectInfo.wantsTextTags || false
    }</wantsTextTags>
    <doNotSaveAuthorNames>${
      projectSettings.doNotSaveAuthorNames ||
      projectInfo.doNotSaveAuthorNames ||
      false
    }</doNotSaveAuthorNames>
  </settings>`;

  // Sort texts by reference number
  const sortedTexts = [...texts].sort((a, b) =>
    a.textReferenceNumber.localeCompare(b.textReferenceNumber)
  );

  // Generate XML for texts, including the HTML markup
  const textXml = sortedTexts
    .map(
      (text) => `    <text>
      <referenceNumber>${escapeXml(text.textReferenceNumber)}</referenceNumber>
      <dateCreated>${formatDate(text.textDate)}</dateCreated>
      <content><![CDATA[${text.text}]]></content>
      ${
        includeAuthors && text.textAuthors?.length
          ? `<authors>${text.textAuthors
              .map((a) => `<author>${escapeXml(a)}</author>`)
              .join("")}</authors>`
          : ""
      }
      ${
        text.textLanguages?.length
          ? `<languages>${text.textLanguages
              .map((l) => `<language>${escapeXml(l)}</language>`)
              .join("")}</languages>`
          : ""
      }
      ${text.textStatus ? `<status>${escapeXml(text.textStatus)}</status>` : ""}
      ${
        text.parentText
          ? `<parentText>${escapeXml(text.parentText)}</parentText>`
          : ""
      }
      ${text.textTag ? `<tag>${escapeXml(text.textTag)}</tag>` : ""}
      ${text.textNote ? `<note>${escapeXml(text.textNote)}</note>` : ""}
      ${
        text.linkedObjects?.length
          ? `<linkedObjects>${text.linkedObjects
              .map(
                (uid) => `<object>${escapeXml(formatObjectUrl(uid))}</object>`
              )
              .join("")}</linkedObjects>`
          : ""
      }
      ${
        text.linkedObjectsNumbers?.length
          ? `<linkedObjectsNumbers>${text.linkedObjectsNumbers
              .map((num) => `<object>${escapeXml(num)}</object>`)
              .join("")}</linkedObjectsNumbers>`
          : ""
      }
    </text>`
    )
    .join("\n");

  // Combine all XML parts
  const xml = [
    xmlHeader,
    metadata,
    exportDate,
    settings,
    `  <texts>\n${textXml}\n  </texts>`,
    `</project>`,
  ].join("\n");

  downloadFile(
    projectInfo.projectReferenceNumber || "texts",
    xml,
    "application/xml"
  );
}
