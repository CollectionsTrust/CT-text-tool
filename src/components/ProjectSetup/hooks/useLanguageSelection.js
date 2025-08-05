import { useState, useEffect } from 'react';

// List of ISO languages
const isoLanguages = [
    'Abkhazian', 'Afar', 'Afrikaans', 'Akan', 'Albanian', 'Amharic', 'Arabic', 'Aragonese', 
  'Armenian', 'Assamese', 'Avaric', 'Avestan', 'Aymara', 'Azerbaijani', 'Bambara', 'Bashkir', 
  'Basque', 'Belarusian', 'Bengali', 'Bihari', 'Bislama', 'Bosnian', 'Breton', 'Bulgarian', 
  'Burmese', 'Catalan', 'Chamorro', 'Chechen', 'Chichewa', 'Chinese', 'Church Slavic', 'Chuvash', 
  'Cornish', 'Corsican', 'Cree', 'Croatian', 'Czech', 'Danish', 'Divehi', 'Dutch', 'Dzongkha', 
  'English', 'Esperanto', 'Estonian', 'Ewe', 'Faroese', 'Fijian', 'Finnish', 'French', 'Frisian', 
  'Fulah', 'Gaelic', 'Galician', 'Ganda', 'Georgian', 'German', 'Greek', 'Guarani', 'Gujarati', 
  'Haitian', 'Hausa', 'Hebrew', 'Herero', 'Hindi', 'Hiri Motu', 'Hungarian', 'Icelandic', 'Ido', 
  'Igbo', 'Indonesian', 'Interlingua', 'Interlingue', 'Inuktitut', 'Inupiaq', 'Irish', 'Italian', 
  'Japanese', 'Javanese', 'Kalaallisut', 'Kannada', 'Kanuri', 'Kashmiri', 'Kazakh', 'Khmer', 
  'Kikuyu', 'Kinyarwanda', 'Kirghiz', 'Komi', 'Kongo', 'Korean', 'Kuanyama', 'Kurdish', 'Lao', 
  'Latin', 'Latvian', 'Limburgish', 'Lingala', 'Lithuanian', 'Luba-Katanga', 'Luxembourgish', 
  'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Manx', 'Maori', 'Marathi', 
  'Marshallese', 'Mongolian', 'Nauru', 'Navajo', 'Ndonga', 'Nepali', 'Northern Sami', 'Norwegian', 
  'Occitan', 'Ojibwa', 'Oriya', 'Oromo', 'Ossetian', 'Pali', 'Panjabi', 'Persian', 'Polish', 
  'Portuguese', 'Pushto', 'Quechua', 'Romanian', 'Romansh', 'Rundi', 'Russian', 'Samoan', 'Sango', 
  'Sanskrit', 'Sardinian', 'Serbian', 'Shona', 'Sichuan Yi', 'Sindhi', 'Sinhala', 'Slovak', 
  'Slovenian', 'Somali', 'Sotho', 'Spanish', 'Sundanese', 'Swahili', 'Swati', 'Swedish', 'Tagalog', 
  'Tahitian', 'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Tibetan', 'Tigrinya', 'Tonga', 
  'Tsonga', 'Tswana', 'Turkish', 'Turkmen', 'Twi', 'Uighur', 'Ukrainian', 'Urdu', 'Uzbek', 
  'Venda', 'Vietnamese', 'Volapük', 'Walloon', 'Welsh', 'Western Frisian', 'Wolof', 'Xhosa', 
  'Yiddish', 'Yoruba', 'Zhuang', 'Zulu',
  // Add more languages as needed
];

const useLanguageSelection = (initialSelectedLanguages = []) => {
  const [languageInput, setLanguageInput] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  
  // Load saved languages from localStorage on initial mount
  useEffect(() => {
    // Initialize with the passed in selected languages
    setSelectedLanguages(initialSelectedLanguages);
  }, [initialSelectedLanguages]);
  
  // Handle language input change
  const handleLanguageInputChange = (e) => {
    const value = e.target.value;
    setLanguageInput(value);
    
    // Filter languages based on input
    if (value.trim() !== '') {
      const filtered = isoLanguages.filter(
        lang => lang.toLowerCase().includes(value.toLowerCase()) && 
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
      const updatedLanguages = [...selectedLanguages, language];
      
      // Update localStorage directly
      localStorage.setItem('selectedLanguages', JSON.stringify(updatedLanguages));
      
      // Update state
      setSelectedLanguages(updatedLanguages);
      setLanguageInput('');
      setFilteredLanguages([]);
      setShowLanguageSuggestions(false);
    }
  };
  
  // Handle custom language addition
  const handleCustomLanguageAddition = () => {
    if (languageInput && languageInput.trim() !== '' && !selectedLanguages.includes(languageInput.trim())) {
      const updatedLanguages = [...selectedLanguages, languageInput.trim()];
      
      // Update localStorage directly
      localStorage.setItem('selectedLanguages', JSON.stringify(updatedLanguages));
      
      // Update state
      setSelectedLanguages(updatedLanguages);
      setLanguageInput('');
      setFilteredLanguages([]);
      setShowLanguageSuggestions(false);
    }
  };
  
  // Handle pressing Enter in the input field
  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there are filtered suggestions and the user presses Enter,
      // select the first suggestion
      if (filteredLanguages.length > 0) {
        handleLanguageSelection(filteredLanguages[0]);
      } else if (languageInput.trim() !== '') {
        // Otherwise, add the custom language
        handleCustomLanguageAddition();
      }
    }
  };
  
  // Handle removing a language
  const handleRemoveLanguage = (language) => {
    const updatedLanguages = selectedLanguages.filter(lang => lang !== language);
    
    // Update localStorage directly
    localStorage.setItem('selectedLanguages', JSON.stringify(updatedLanguages));
    
    // Update state
    setSelectedLanguages(updatedLanguages);
  };
  
  return {
    languageInput,
    selectedLanguages,
    filteredLanguages,
    showLanguageSuggestions,
    handleLanguageInputChange,
    handleLanguageSelection,
    handleCustomLanguageAddition,
    handleInputKeyPress,
    handleRemoveLanguage
  };
};

export default useLanguageSelection;
