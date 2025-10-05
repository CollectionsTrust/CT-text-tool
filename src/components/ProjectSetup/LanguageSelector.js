import { useState, useEffect } from "react";
import Tooltip from "../common/Tooltip";

// List of ISO languages
const isoLanguages = [
  "Abkhazian",
  "Afar",
  "Afrikaans",
  "Akan",
  "Albanian",
  "Amharic",
  "Arabic",
  "Aragonese",
  "Armenian",
  "Assamese",
  "Avaric",
  "Avestan",
  "Aymara",
  "Azerbaijani",
  "Bambara",
  "Bashkir",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bihari",
  "Bislama",
  "Bosnian",
  "Breton",
  "Bulgarian",
  "Burmese",
  "Catalan",
  "Chamorro",
  "Chechen",
  "Chichewa",
  "Chinese",
  "Church Slavic",
  "Chuvash",
  "Cornish",
  "Corsican",
  "Cree",
  "Croatian",
  "Czech",
  "Danish",
  "Divehi",
  "Dutch",
  "Dzongkha",
  "English",
  "Esperanto",
  "Estonian",
  "Ewe",
  "Faroese",
  "Fijian",
  "Finnish",
  "French",
  "Frisian",
  "Fulah",
  "Gaelic",
  "Galician",
  "Ganda",
  "Georgian",
  "German",
  "Greek",
  "Guarani",
  "Gujarati",
  "Haitian",
  "Hausa",
  "Hebrew",
  "Herero",
  "Hindi",
  "Hiri Motu",
  "Hungarian",
  "Icelandic",
  "Ido",
  "Igbo",
  "Indonesian",
  "Interlingua",
  "Interlingue",
  "Inuktitut",
  "Inupiaq",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kalaallisut",
  "Kannada",
  "Kanuri",
  "Kashmiri",
  "Kazakh",
  "Khmer",
  "Kikuyu",
  "Kinyarwanda",
  "Kirghiz",
  "Komi",
  "Kongo",
  "Korean",
  "Kuanyama",
  "Kurdish",
  "Lao",
  "Latin",
  "Latvian",
  "Limburgish",
  "Lingala",
  "Lithuanian",
  "Luba-Katanga",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Manx",
  "Maori",
  "Marathi",
  "Marshallese",
  "Mongolian",
  "Nauru",
  "Navajo",
  "Ndonga",
  "Nepali",
  "Northern Sami",
  "Norwegian",
  "Occitan",
  "Ojibwa",
  "Oriya",
  "Oromo",
  "Ossetian",
  "Pali",
  "Panjabi",
  "Persian",
  "Polish",
  "Portuguese",
  "Pushto",
  "Quechua",
  "Romanian",
  "Romansh",
  "Rundi",
  "Russian",
  "Samoan",
  "Sango",
  "Sanskrit",
  "Sardinian",
  "Serbian",
  "Shona",
  "Sichuan Yi",
  "Sindhi",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Sotho",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Swati",
  "Swedish",
  "Tagalog",
  "Tahitian",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Tibetan",
  "Tigrinya",
  "Tonga",
  "Tsonga",
  "Tswana",
  "Turkish",
  "Turkmen",
  "Twi",
  "Uighur",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Venda",
  "Vietnamese",
  "Volapük",
  "Walloon",
  "Welsh",
  "Western Frisian",
  "Wolof",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zhuang",
  "Zulu",
];

const LanguageSelector = ({
  selectedLanguages,
  onAddLanguage,
  onRemoveLanguage,
}) => {
  const [languageInput, setLanguageInput] = useState("");
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);

  // Handle language input change
  const handleLanguageInputChange = (e) => {
    const value = e.target.value;
    setLanguageInput(value);

    // Filter languages based on input
    if (value.trim() !== "") {
      const filtered = isoLanguages.filter(
        (lang) =>
          lang.toLowerCase().includes(value.toLowerCase()) &&
          !selectedLanguages.includes(lang)
      );
      setFilteredLanguages(filtered);
      setShowLanguageSuggestions(true);
    } else {
      setFilteredLanguages([]);
      setShowLanguageSuggestions(false);
    }
  };

  // Handle language selection from suggestions
  const handleLanguageSelection = (language) => {
    if (!selectedLanguages.includes(language)) {
      onAddLanguage(language);
      setLanguageInput("");
      setFilteredLanguages([]);
      setShowLanguageSuggestions(false);
    }
  };

  // Handle custom language addition
  const handleCustomLanguageAddition = () => {
    if (
      languageInput &&
      languageInput.trim() !== "" &&
      !selectedLanguages.includes(languageInput.trim())
    ) {
      onAddLanguage(languageInput.trim());
      setLanguageInput("");
      setFilteredLanguages([]);
      setShowLanguageSuggestions(false);
    }
  };

  // Handle key press events
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If there are filtered suggestions and the user presses Enter,
      // select the first suggestion
      if (filteredLanguages.length > 0) {
        handleLanguageSelection(filteredLanguages[0]);
      } else if (languageInput.trim() !== "") {
        // Otherwise, add the custom language
        handleCustomLanguageAddition();
      }
    }
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowLanguageSuggestions(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="form-group">
      <label htmlFor="languages">
        Languages
        <span className="required-indicator">*</span>
        <Tooltip>
          The language(s) used in the texts associated with this project. If
          multiple languages are used, select all that apply.
        </Tooltip>
      </label>
      <div className="language-selection">
        <div
          className="language-input-container"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            id="languageInput"
            value={languageInput}
            onChange={handleLanguageInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type to search or add a language"
            className="text-input"
            autoComplete="off"
            onClick={() => setShowLanguageSuggestions(true)}
          />
          {showLanguageSuggestions && filteredLanguages.length > 0 && (
            <ul className="language-suggestions">
              {filteredLanguages.slice(0, 5).map((lang) => (
                <li
                  key={lang}
                  onClick={() => handleLanguageSelection(lang)}
                  className="language-suggestion-item"
                >
                  {lang}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="selected-items-container">
          <h4>Project languages:</h4>
          <ul className="selected-items-list">
            {selectedLanguages.map((lang) => (
              <li key={lang} className="selected-item">
                <span>{lang}</span>
                <button
                  type="button"
                  onClick={() => onRemoveLanguage(lang)}
                  className="remove-item-btn"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
