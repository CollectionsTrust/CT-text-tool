# 📘 CT Text Tool

A comprehensive React and Firebase web application for managing museum collection records from the Museum Data Service (MDS) and collaboratively creating structured texts. Built for Collections Trust to support museums in implementing Spectrum's "Use of collections" guidance, turning one-off project content into reusable, structured knowledge.

---

## 🚀 Key Features

### 🛠️ Project Management
- **Complete project lifecycle management** with metadata, licensing, and multi-language support
- **Role-based access control**: Admin, Project Owner, and Author roles with distinct permissions
- **MDS API integration** using project-specific tokens for real-time collection data access
- **Project archival system** with read-only access for completed projects
- **Comprehensive project setup** with Creative Commons licensing and rights management

### ✍️ Advanced Text Authoring
- **Rich-text Quill editor** with full-screen mode, HTML code view, and HTTPS image insertion
- **Hierarchical text structures** supporting parent-child relationships for complex projects
- **Multi-author collaboration** with granular author assignment and management
- **Status tracking system** with customizable workflow states (Draft, Approved, etc.)
- **Text tagging and categorization** for improved organization and retrieval
- **Auto-numbering system** with customizable prefixes for consistent text references

### 🗄️ Museum Data Service Integration
- **Real-time object browsing** with advanced Boolean search (AND, OR, NOT operators)
- **Intelligent data caching** using localStorage for improved performance (50,000+ records)
- **Object linking system** connecting texts to specific collection items
- **Comprehensive object metadata** display with direct MDS links
- **Batch object selection** for efficient text creation workflows

### 📊 Data Management & Export
- **Multiple export formats**: CSV (single/dual-file), XML, JSON, and publication-ready HTML
- **Configurable data inclusion** respecting author privacy preferences
- **Complete project metadata** preservation across all export formats  
- **Bulk text operations** including editing, status updates, and deletion
- **Advanced table views** with customizable columns and hierarchical display
- **Search and filtering** across all text content and metadata

### 🔐 Security & Access Control
- **PBKDF2 password hashing** with 600,000 iterations for enhanced security
- **Temporary password system** with automatic expiration and forced changes
- **Session management** with automatic logout and navigation protection
- **Admin-controlled user management** with email-based account creation
- **Project-specific role assignment** supporting multiple project participation

### ♿ Accessibility & User Experience
- **WCAG-compliant design** with comprehensive ARIA support and screen reader announcements
- **Keyboard navigation** throughout the application with focus management
- **Responsive design** optimized for desktop, tablet, and mobile devices
- **Multiple layout modes** including split-panel, horizontal, and focus views
- **Dirty state tracking** preventing accidental data loss during navigation
- **Comprehensive user guide** with context-sensitive help system

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React 18 with modern hooks and context API
- **Rich Text**: Quill.js with React-Quill wrapper for advanced editing
- **Backend**: Firebase Firestore with real-time synchronization
- **Authentication**: Custom Firebase-based system with role management
- **Styling**: CSS custom properties with mobile-first responsive design
- **Deployment**: Netlify with automated CI/CD pipeline

### Core Design Patterns
- **Hook-based state management** for complex form interactions
- **Context providers** for global state and authentication
- **Component composition** with reusable UI elements
- **Provider pattern** for data management (ObjectsDataProvider)
- **Custom hooks** for business logic abstraction (useProjectForm, useLanguageSelection)

---

## 📁 File Structure

```
ct-text-tool/
├── public/
│   ├── index.html                    # Main HTML template
│   ├── manifest.json                 # PWA manifest
│   └── user-guide.html              # Comprehensive user documentation
├── src/
│   ├── App.js                       # Main application component
│   ├── App.css                      # Global styles and CSS variables
│   ├── index.js                     # Application entry point
│   │
│   ├── firebase/
│   │   └── config.js                # Firebase configuration
│   │
│   ├── context/
│   │   └── AuthContext.js           # Authentication state management
│   │
│   ├── utils/
│   │   └── passwordUtils.js         # PBKDF2 password utilities
│   │
│   ├── components/
│   │   │
│   │   ├── Auth/                    # Authentication components
│   │   │   ├── Login.js
│   │   │   ├── PasswordChange.js
│   │   │   └── ProtectedRoute.js
│   │   │
│   │   ├── LandingPage/             # Public landing page
│   │   │   ├── index.js
│   │   │   ├── ProjectRequestForm.js
│   │   │   ├── LandingPage.css
│   │   │   └── [partner logos]
│   │   │
│   │   ├── navigation/              # Navigation components
│   │   │   ├── MainHeader.js        # Project-aware header
│   │   │   └── MainHeader.css
│   │   │
│   │   ├── AdminDashboard/          # Administrative interface
│   │   │   ├── index.js
│   │   │   ├── Requests.js          # Project and password reset requests
│   │   │   ├── ProjectsList.js      # All projects management
│   │   │   ├── UserManagement.js    # User accounts and roles
│   │   │   └── AdminDashboard.css
│   │   │
│   │   ├── UserDashboard/           # User project dashboard
│   │   │   ├── index.js
│   │   │   ├── ProjectsList.js
│   │   │   ├── AuthorManagement.js  # Author invitation and management
│   │   │   └── UserDashboard.css
│   │   │
│   │   ├── ProjectSetup/            # Comprehensive project configuration
│   │   │   ├── index.js
│   │   │   ├── ProjectMetaFields.js
│   │   │   ├── LanguageSelector.js   # ISO language selection
│   │   │   ├── RichTextEditor.js
│   │   │   ├── TextSettings.js       # Hierarchical text, status, tags
│   │   │   ├── TokenField.js         # MDS API token input
│   │   │   ├── ProjectSetup.css
│   │   │   └── hooks/
│   │   │       ├── useProjectForm.js
│   │   │       ├── useLanguageSelection.js
│   │   │       └── useAuthorSelection.js
│   │   │
│   │   ├── ObjectsPage/             # MDS data browsing and text creation
│   │   │   ├── index.js
│   │   │   ├── ObjectsDataProvider.js # State management for MDS data
│   │   │   ├── SearchBar.js          # Boolean search interface
│   │   │   ├── DisplayOptions.js     # Column and view configuration
│   │   │   ├── RecordsTable.js       # Object records display
│   │   │   ├── RecordModal.js        # Object detail popup
│   │   │   ├── PaginationControls.js
│   │   │   ├── ObjectsPage.css
│   │   │   └── utils/
│   │   │       ├── search.js         # Boolean search implementation
│   │   │       ├── localStorage.js   # Data caching utilities
│   │   │       └── dataExtractors.js # MDS data parsing
│   │   │
│   │   ├── TextsPage/               # Text management interface
│   │   │   ├── index.js
│   │   │   ├── TextsTable.js         # Advanced table with bulk operations
│   │   │   ├── ExportControls.js     # Multi-format export system
│   │   │   ├── TextsPage.css
│   │   │   ├── TextsTable.css
│   │   │   └── utils/exports/        # Export system
│   │   │       ├── index.js
│   │   │       ├── exportUtils.js    # Common utilities
│   │   │       ├── exportToCsv.js
│   │   │       ├── exportToCsvTwoFiles.js
│   │   │       ├── exportToXml.js
│   │   │       ├── exportToJson.js
│   │   │       └── exportToHtml.js
│   │   │
│   │   ├── common/                  # Reusable components
│   │   │   ├── FormField.js
│   │   │   ├── Tooltip.js
│   │   │   │
│   │   │   ├── AccessibleLayout/    # Layout components
│   │   │   │   ├── SplitLayout.js   # Resizable split panels
│   │   │   │   └── AccessibleLayout.css
│   │   │   │
│   │   │   ├── QuillEditor/         # Rich text editing
│   │   │   │   ├── QuillEditor.js   # Enhanced Quill wrapper
│   │   │   │   └── QuillEditor.css
│   │   │   │
│   │   │   └── TextForm/            # Text creation and editing
│   │   │       ├── index.js         # Main text form component
│   │   │       ├── ParentTextSelector.js # Hierarchical text selection
│   │   │       ├── TextForm.css
│   │   │       └── ParentTextSelector.css
│   │   │
│   │   └── UserGuide/               # In-app help system
│   │       ├── index.js
│   │       └── UserGuide.css
│   │
│   └── styles/                      # Additional stylesheets
│       └── ProjectSetup.css
│
├── netlify.toml                     # Netlify deployment configuration
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Firestore enabled
- Museum Data Service API token

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd ct-text-tool

# Install dependencies
npm install

# Configure Firebase (create .env file with your config)
# REACT_APP_FIREBASE_API_KEY=your_key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
# etc.

# Start development server
npm start
```

### Initial Setup
1. **Admin Account**: Contact Collections Trust for initial admin access
2. **Project Request**: Use the landing page form to request project access
3. **MDS Token**: Obtain API token from https://museumdata.uk/object-search/
4. **Project Setup**: Complete comprehensive project configuration
5. **Team Invitation**: Add authors and assign roles as needed

---

## 👥 User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | • Approve/reject project requests<br>• Manage all user accounts<br>• Reset passwords<br>• Transfer project ownership<br>• Archive/delete any project<br>• Access all system data |
| **Project Owner** | • Complete project setup and configuration<br>• Invite and manage project authors<br>• Configure text workflow settings<br>• Access all project data and bulk operations<br>• Export project data in all formats<br>• Archive completed projects |
| **Author** | • Browse and search MDS collection objects<br>• Create and edit assigned texts<br>• Link texts to collection objects<br>• Use full rich-text editor capabilities<br>• Participate in hierarchical text structures<br>• Export their own contributions |

---

## 🌟 Key Workflows

### Project Creation
1. **Request Access** → Landing page form submission
2. **Admin Approval** → Account creation with temporary password
3. **Project Setup** → Comprehensive configuration including MDS token
4. **Team Building** → Author invitation and role assignment
5. **Content Creation** → Object browsing and text authoring

### Author Management
Project owners can manage their team through a comprehensive author management interface:

- **Add Authors**: Invite new users with automatic email generation and temporary passwords
- **Edit Authors**: Update author details and project assignments with automatic email notifications
- **Remove Authors**: Clean removal from projects with full cleanup of associated data
- **Multi-Project Support**: Authors can be assigned to multiple projects simultaneously
- **Search & Filter**: Find authors quickly with comprehensive search functionality

### Text Authoring
1. **Object Selection** → Browse MDS records with Boolean search
2. **Text Creation** → Rich-text editor with metadata fields
3. **Object Linking** → Connect texts to specific collection items
4. **Review Process** → Status tracking through workflow stages
5. **Export & Archive** → Multiple format export for preservation

### Data Export
- **CSV**: Structured data for analysis (single or dual-file options)
- **XML**: Hierarchical data with full metadata preservation
- **JSON**: API-friendly format for system integration
- **HTML**: Publication-ready format with styling and links

---

## 🔧 Technical Implementation Details

### Authentication System
The application uses a custom authentication system built on Firebase with several key features:

- **Session Management**: Uses sessionStorage for secure session persistence
- **Password Security**: PBKDF2 hashing with 600,000 iterations and random salts
- **Temporary Passwords**: 7-day expiration with automatic cleanup

### User Dashboard
The user dashboard provides different interfaces based on user roles:

- **Project Management**: View, search, and manage projects with pagination
- **Author Management**: Dedicated interface for project owners to manage team members
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Advanced Search**: Boolean operators (AND/OR) for project filtering

### Component Architecture
- **Context-based State Management**: AuthContext provides global authentication state
- **Reusable Components**: Shared components for forms, layouts, and UI elements
- **Custom Hooks**: Business logic abstraction for complex operations
- **Provider Pattern**: Data management for complex features like MDS integration

---

## 🔒 Security Features

- **PBKDF2 password hashing** with 600,000 iterations
- **Temporary password expiration** (7-day limit)
- **Session management** with automatic logout
- **Role-based access control** with project-specific permissions
- **Data validation** and sanitization throughout the application
- **Admin-controlled password resets** for enhanced security
- **Constant-time password comparison** to prevent timing attacks

---

## ♿ Accessibility

- **WCAG 2.1 AA compliance** with comprehensive ARIA support
- **Screen reader compatibility** with live regions for dynamic updates
- **Keyboard navigation** throughout the entire application
- **Focus management** with visible focus indicators
- **High contrast support** for users with visual impairments
- **Responsive design** supporting various devices and zoom levels
- **Escape key support** for modal dialogs and popups

---

## 🚀 Deployment

The application is optimized for Netlify deployment with:
- **Automatic builds** from Git repository
- **Environment variable management** for Firebase configuration
- **SPA routing support** with proper redirects
- **Security headers** configured in netlify.toml
- **Build optimization** with React production builds

---

## 🧪 Development Notes

### Password Utilities
The `passwordUtils.js` module provides comprehensive password management:
- PBKDF2 implementation using Web Crypto API
- Secure random password generation
- Password strength validation
- Temporary password management with expiration

### User Management
The author management system includes:
- Multi-project author assignment
- Automatic email generation for invitations and updates
- Clean user removal with proper data cleanup
- Search functionality across all user fields

### CSS Architecture
- Custom properties for consistent theming
- Mobile-first responsive design
- Component-scoped styles with clear naming conventions
- Accessible color schemes and contrast ratios

---

## 📄 License

© 2025 Collections Trust. All rights reserved.

Built with support from Arts Council England as part of Collections Trust's dynamic collections program.

---

## 🤝 Support & Contact

- **Application Support**: Katie Brown (katie@collectionstrust.org.uk)
- **MDS Integration**: Arran Rees (support@museumdata.uk)
- **User Guide**: Comprehensive documentation available at `/user-guide`
- **Collections Trust**: https://collectionstrust.org.uk
- **Museum Data Service**: https://museumdata.uk

---

## 🎯 Future Enhancements

- 🔄 Offline draft saving capabilities
- 🗃️ JSON import/export for project templates
- 🧑‍🎨 Custom themes and branding per organization
- 🌍 Enhanced multi-language UI support
- 🔒 Advanced Firebase security rules enforcement
- 📊 Analytics and usage reporting dashboard
- 📧 Enhanced email notification system
- 🔍 Advanced text search and indexing
- 📱 Progressive Web App (PWA) capabilities
- 🎨 Customizable text editor toolbar options
