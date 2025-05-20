/**
 * Helper functions for extracting data from MDS records
 */

// Extract organisation from a record
export const getOrganisation = (record) => {
  if (record && record["@admin"] && record["@admin"].data_source) {
    return record["@admin"].data_source.organisation || "-";
  }
  return "-";
};

// Find unit by type or label in a record
export const findUnitByType = (record, typeValue) => {
  if (!record || !record["@document"] || !record["@document"].units || !Array.isArray(record["@document"].units)) {
    return null;
  }
  
  return record["@document"].units.find(unit => unit.type === typeValue || unit.label === typeValue);
};

// Find units by label or type in a record
export const findUnitsByLabelOrType = (record, labelOrType) => {
  if (!record || !record["@document"] || !record["@document"].units || !Array.isArray(record["@document"].units)) {
    return [];
  }
  
  return record["@document"].units.filter(unit => 
    unit.type === labelOrType || unit.label === labelOrType
  );
};

// Get a property value from a record
export const getPropertyValue = (record, propertyName) => {
  const unit = findUnitByType(record, propertyName);
  return unit ? unit.value : null;
};

// Get array property values from a record
export const getArrayPropertyValues = (record, propertyName) => {
  const units = findUnitsByLabelOrType(record, propertyName);
  return units.map(unit => unit.value);
};

// Truncate text to specific number of words
export const truncateToWords = (text, wordCount) => {
  if (!text) return '';
  
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  
  return words.slice(0, wordCount).join(' ') + '...';
};
