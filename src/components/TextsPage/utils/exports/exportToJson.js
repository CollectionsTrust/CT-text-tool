// File: exportToJson.js (Fixed with Object URL Prefixing and HTML Preservation)

import {
  downloadFile,
  cleanHtml,
  formatDate,
  formatObjectUrl,
} from "./exportUtils";

export function exportToJson(texts, projectInfo, projectSettings = {}) {
  // Determine if we should include authors based on project settings
  const includeAuthors = !projectInfo.doNotSaveAuthorNames;

  // Create a complete project object with all fields included in other export formats
  const project = {
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
      projectSettings.tracksTextStatus || projectInfo.tracksTextStatus || false,
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
    settings: projectSettings || {},
    exportDate: new Date().toISOString(),
  };

  // Sort texts by reference number
  const sortedTexts = [...texts].sort((a, b) =>
    a.textReferenceNumber.localeCompare(b.textReferenceNumber)
  );

  // Create serialized text objects
  const serializedTexts = sortedTexts.map((text) => {
    const textObj = {
      referenceNumber: text.textReferenceNumber || "",
      dateCreated: formatDate(text.textDate),
      content: {
        html: text.text || "", // Preserve the original HTML
        plainText: cleanHtml(text.text || ""), // This will now keep formatting but remove outer p tags if single paragraph
      },
      languages: text.textLanguages || [],
      status: text.textStatus || "",
      parentText: text.parentText || "",
      tag: text.textTag || "",
      note: text.textNote || "",
      linkedObjectUids: (text.linkedObjects || []).map((uid) =>
        formatObjectUrl(uid)
      ), // Ensure all object UIDs are full URLs
      linkedObjectNumbers: text.linkedObjectsNumbers || [],
    };

    // Only add authors if the flag allows it
    if (includeAuthors) {
      textObj.authors = text.textAuthors || [];
    }

    return textObj;
  });

  // Create the complete JSON data object
  const jsonData = {
    project,
    texts: serializedTexts,
  };

  // Convert to JSON string with nice formatting
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Download the file
  downloadFile(
    project.projectReferenceNumber || "texts",
    jsonString,
    "application/json"
  );
}
