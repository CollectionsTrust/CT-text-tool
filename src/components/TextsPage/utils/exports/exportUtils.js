// Updated exportUtils.js with new HTML cleaning function

export function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// This function now preserves HTML markup but removes outer paragraph tags if there's only one paragraph
export function cleanHtml(html) {
  if (!html) return '';
  
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // If there's only one paragraph, strip the paragraph tags but keep other markup
  if (tempDiv.children.length === 1 && tempDiv.children[0].nodeName === 'P') {
    return tempDiv.children[0].innerHTML;
  }
  
  // Otherwise, return the full HTML
  return html;
}

// The old clean function is renamed to stripHtml
export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

export function simplifyHtmlForCsv(html) {
  return stripHtml(html).replace(/\s+/g, ' ');
}

export function formatObjectUrl(uid) {
  // Make sure the UID is properly formatted as a URL
  if (uid.startsWith('https://museumdata.uk/objects/')) {
    return uid;
  }
  return `https://museumdata.uk/objects/${uid}`;
}

export function downloadFile(filenameBase, content, mimeType, customExt) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const timestamp = `${date}_${time}`;
  const ext = customExt || (
    mimeType.includes('json') ? '.json'
    : mimeType.includes('xml') ? '.xml'
    : mimeType.includes('csv') ? '.csv'
    : '.html'
  );

  const fullFilename = `${filenameBase}_${timestamp}${ext}`;

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFilename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Helper function to convert various cases to sentence case
export function toSentenceCase(str) {
  if (!str) return '';
  
  // Handle camelCase and PascalCase
  const spaced = str.replace(/([A-Z])/g, ' $1');
  
  // Capitalize first letter and lowercase the rest
  return spaced.charAt(0).toUpperCase() + 
         spaced.slice(1).toLowerCase();
}
