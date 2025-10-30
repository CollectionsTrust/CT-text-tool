/**
 * Search utilities for the Objects Page
 */

// Main search function
export const searchRecords = (jsonData, query) => {
  if (!query || !query.trim()) {
    return jsonData;
  }

  // Parse boolean operators
  let searchTerms = parseSearchQuery(query);

  return jsonData.filter((record) => {
    const recordString = JSON.stringify(record).toLowerCase();
    return evaluateSearchTerms(recordString, searchTerms);
  });
};

// Parse search query for boolean operators
export const parseSearchQuery = (query) => {
  // Split on spaces but keep quoted phrases together
  const parts = [];
  let currentPart = "";
  let inQuotes = false;

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentPart += char;
    } else if (char === " " && !inQuotes) {
      if (currentPart) {
        parts.push(currentPart);
        currentPart = "";
      }
    } else {
      currentPart += char;
    }
  }

  if (currentPart) {
    parts.push(currentPart);
  }

  // Process parts into terms with operators
  return parts.map((part) => {
    if (part.toLowerCase() === "and") return { type: "AND" };
    if (part.toLowerCase() === "or") return { type: "OR" };
    if (part.toLowerCase() === "not" || part === "-") return { type: "NOT" };

    // Handle quoted phrases
    if (part.startsWith('"') && part.endsWith('"')) {
      return {
        type: "TERM",
        value: part.slice(1, -1).toLowerCase(),
      };
    }

    // Handle NOT prefix
    if (part.startsWith("-")) {
      return {
        type: "NOT_TERM",
        value: part.slice(1).toLowerCase(),
      };
    }

    return { type: "TERM", value: part.toLowerCase() };
  });
};

// Evaluate search terms against a record string
export const evaluateSearchTerms = (recordString, terms) => {
  if (terms.length === 0) return true;

  let result = false;
  let operator = "OR"; // Default operator

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];

    // Handle operators
    if (term.type === "AND") {
      operator = "AND";
      continue;
    }

    if (term.type === "OR") {
      operator = "OR";
      continue;
    }

    // Handle terms
    let termResult = false;

    if (term.type === "TERM") {
      termResult = recordString.includes(term.value);
    } else if (term.type === "NOT_TERM") {
      termResult = !recordString.includes(term.value);
    }

    // Apply operator
    if (i === 0 || operator === "OR") {
      result = result || termResult;
    } else if (operator === "AND") {
      result = result && termResult;
    }
  }

  return result;
};
