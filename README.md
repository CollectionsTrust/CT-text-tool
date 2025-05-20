# 📘 CT Text Tool

A React and Firebase web application for managing museum collection records from the Museum Data Service and collaboratively creating structured texts. Features role-based access, Firestore-backed content, bulk actions, hierarchical text linking, and an accessible, modern UI.

---

## 🚀 Features

### 🛠️ Project Management
- Create and configure projects with metadata, licenses, and languages.
- Pull object data from MDS API using project-specific tokens.
- Archive, delete, or activate projects.
- Role-based access: **Owner**, **Admin**, **Author**.

### ✍️ Text Authoring
- Rich-text Quill editor with comprehensive formatting options.
- Full-screen editing mode and HTML view support.
- Statuses, tags, multilingual and multi-author fields.
- Parent/child text hierarchy.
- Auto-numbering and object linking.
- Bulk editing and inline editing supported.

### 🧾 Object Browsing
- Fetch and cache MDS object records per project.
- Search and filter using Boolean operators (`AND`, `OR`, `-`).
- View metadata and object pages via modal or direct link.
- Select objects to seed new texts.

### 📤 Export Capabilities
- Export texts in multiple formats (CSV, XML, JSON, HTML).
- Include/exclude author information based on project settings.
- Complete project metadata included in all export formats.
- Well-structured, consistently formatted output files.

### 🔐 Authentication & Roles
- Firestore-based login (with default password logic).
- Role-aware routing and component visibility.
- Session persistence via localStorage.

### 🧑‍💼 Admin Tools
- Review and approve project access requests.
- Manage authors across all owned projects.
- Assign roles and update author info.
- Monitor and edit user access dynamically.

### 📚 Help and Documentation
- Comprehensive user guide accessible to both public and logged-in users.
- Context-sensitive help via navigation header.

---

## 🗂️ File Structure

```
.
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   ├── firebase/
│   │   └── config.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ResetPassword.js
│   │   │   └── ProtectedRoute.js
│   │   ├── LandingPage/
│   │   │   ├── index.js
│   │   │   ├── ProjectRequestForm.js
│   │   │   └── LandingPage.css
│   │   ├── navigation/
│   │   │   ├── MainHeader.js
│   │   │   └── MainHeader.css
│   │   ├── AdminDashboard/
│   │   │   ├── index.js
│   │   │   ├── ProjectRequests.js
│   │   │   ├── ProjectsList.js
│   │   │   └── UserManagement.js
│   │   ├── UserDashboard/
│   │   │   ├── index.js
│   │   │   ├── ProjectsList.js
│   │   │   └── AuthorManagement.js
│   │   ├── ProjectSetup/
│   │   │   ├── index.js
│   │   │   ├── ProjectForm.js
│   │   │   ├── RichTextEditor.js
│   │   │   ├── LanguageSelector.js
│   │   │   ├── LicenseSelector.js
│   │   │   ├── OptionalFields.js
│   │   │   ├── TextSettings.js
│   │   │   ├── TokenField.js
│   │   │   ├── hooks/
│   │   │   │   ├── useProjectForm.js
│   │   │   │   ├── useAuthorSelection.js
│   │   │   │   └── useLanguageSelection.js
│   │   ├── ObjectsPage/
│   │   │   ├── index.js
│   │   │   ├── ObjectsPage.js
│   │   │   ├── DisplayOptions.js / .css
│   │   │   ├── PaginationControls.js
│   │   │   ├── RecordModal.js
│   │   │   ├── RecordsTable.js
│   │   │   ├── SearchBar.js
│   │   │   ├── utils/
│   │   │   │   ├── dataExtractors.js
│   │   │   │   ├── localStorage.js
│   │   │   │   └── search.js
│   │   ├── TextsPage/
│   │   │   ├── index.js
│   │   │   ├── TextsPage.js
│   │   │   ├── TextsTable.js / .css
│   │   │   ├── ExportControls.js
│   │   │   ├── utils/
│   │   │   │   ├── exports/
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── exportUtils.js
│   │   │   │   │   ├── exportToCsv.js
│   │   │   │   │   ├── exportToXml.js
│   │   │   │   │   ├── exportToJson.js
│   │   │   │   │   └── exportToHtml.js
│   │   │   │   └── exportUtils.js
│   │   │   ├── PlaceholderContent.js
│   │   │   ├── OwnerNote.js
│   │   │   └── AdminNote.js
│   │   ├── UserGuide/
│   │   │   ├── index.js
│   │   │   └── UserGuide.css
│   │   ├── shared/
│   │   │   ├── FormField.js
│   │   │   ├── Tooltip.js
│   │   │   ├── QuillEditor/
│   │   │   │   ├── QuillEditor.js
│   │   │   │   └── QuillEditor.css
│   │   │   ├── TextForm/
│   │   │   │   ├── index.js
│   │   │   │   ├── ParentTextSelector.js
│   │   │   │   └── TextForm.css
│   │   │   ├── AccessibleLayout/
│   │   │   │   ├── SplitLayout.js
│   │   │   │   └── AccessibleLayout.css
├── styles/
│   ├── Auth.css
│   ├── ProjectSetup.css
├── netlify.toml
├── package.json
└── README.md
```

---

## 🔧 Tech Stack

- **Frontend**: React 18, React Router
- **Rich Text Editing**: Quill with React-Quill wrapper
- **Backend**: Firebase Firestore (roles, documents, batch writes)
- **Hosting**: Netlify (`netlify.toml`)
- **Styling**: Vanilla CSS with reusable variables, mobile-first
- **Persistence**: localStorage (auth, cached records, user config)
- **Export Formats**: CSV, XML, JSON, HTML with full project metadata

---

## 🧪 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm start
```

---

## 🔐 Roles Summary

| Role   | Access                                                                 |
|--------|------------------------------------------------------------------------|
| Admin  | Approve projects, assign users, remove accounts                        |
| Owner  | Full setup, object view, text authoring, and project control           |
| Author | View object records, write and manage assigned texts                   |

---

## 📦 Deployment

The app is deployable via **Netlify**. Ensure your Firebase env variables are set either in a `.env` file or in your Netlify environment settings.

Netlify config is handled via `netlify.toml`. Netlify automatically runs `npm install` to install dependencies (including Quill) during deployment.

---

## 📄 License

© 2025 Collections Trust. All rights reserved.

---

## 🧭 Roadmap (suggested)

- 🔄 Offline draft saving
- 🗃️ Import/export JSON bundles
- 🧑‍🎨 Custom themes per project
- 🌍 Better multi-language support for UI
- 🔒 Firebase rules enforcement (by project)
