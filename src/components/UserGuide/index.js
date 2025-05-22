*This user guide is maintained by Collections Trust and update# CT Text Tool user guide

Welcome to the CT Text Tool - a comprehensive platform for managing museum collection texts and linking them to Museum Data Service (MDS) records. This guide will help you use all features effectively, whether you're an administrator, project owner, or author.

---

## Table of contents

1. [Getting started](#getting-started)
   - [Requesting access](#requesting-access)
   - [Logging in](#logging-in)
   - [Understanding user roles](#understanding-user-roles)
   - [Password management](#password-management)

2. [Dashboard navigation](#dashboard-navigation)
   - [User dashboard overview](#user-dashboard-overview)
   - [Project management](#project-management)
   - [Author management (owners)](#author-management-owners)

3. [Project setup (owners)](#project-setup-owners)
   - [Basic project information](#basic-project-information)
   - [Text settings configuration](#text-settings-configuration)
   - [Connecting to MDS](#connecting-to-mds)

4. [Working with objects](#working-with-objects)
   - [Browsing object records](#browsing-object-records)
   - [Advanced search and filtering](#advanced-search-and-filtering)
   - [Viewing object details](#viewing-object-details)
   - [Selecting objects for texts](#selecting-objects-for-texts)

5. [Creating and managing texts](#creating-and-managing-texts)
   - [Creating a new text](#creating-a-new-text)
   - [Using the rich-text editor](#using-the-rich-text-editor)
   - [Linking texts to objects](#linking-texts-to-objects)
   - [Creating hierarchical texts](#creating-hierarchical-texts)
   - [Text status and tags](#text-status-and-tags)
   - [Bulk editing and management](#bulk-editing-and-management)

6. [Exporting and sharing](#exporting-and-sharing)
   - [Available export formats](#available-export-formats)
   - [Export options and settings](#export-options-and-settings)
   - [Best practices](#best-practices)

7. [Getting help](#getting-help)

---

## Getting started

### Requesting access

To start using the CT Text Tool, you need to request access through the landing page:

1. **Visit the CT Text Tool website**
2. **Locate the "Request project access" form** in the right panel
3. **Fill in your details:**
   - **Your name**: Full name for project identification
   - **Email address**: This will be your login email
   - **Your organization**: Museum or institution name
   - **Proposed project title**: Working title for your project
   - **Brief project description**: Explain your project's goals and scope
4. **Click "Submit request"**
5. **Wait for approval**: An administrator will review your request and contact you

**What happens next:**
- An administrator reviews your request
- If approved, they create your project and user account
- You receive an email with login instructions and a temporary password
- You can then log in and complete your project setup

---

### Logging in

Once your request has been approved:

1. **Return to the CT Text Tool website**
2. **Use the "Existing users" login form** in the right panel
3. **Enter your credentials:**
   - **Email**: The address you used in your access request
   - **Password**: Use the temporary password from your approval email
4. **Click "Log in"**
5. **You'll be redirected based on your role:**
   - **Owners**: Dashboard to manage projects and authors
   - **Authors**: Dashboard to view assigned projects
   - **Admins**: Administrative dashboard

**First login:**
- New users receive temporary passwords that must be changed
- You'll be prompted to create a new password on first login
- Passwords must be at least 8 characters with letters and numbers

---

### Understanding user roles

The CT Text Tool has three distinct user roles:

#### **Administrator**
- **Purpose**: System management and user oversight
- **Capabilities**:
  - Approve or reject project requests
  - Create and manage all user accounts
  - Reset passwords for any user
  - Transfer project ownership
  - Archive or delete any project
  - Access all system data

#### **Project Owner**
- **Purpose**: Project leadership and team management
- **Capabilities**:
  - Complete comprehensive project setup
  - Invite and manage authors for their projects
  - Configure text workflow settings
  - Access all project data and perform bulk operations
  - Export project data in multiple formats
  - Archive completed projects

#### **Author**
- **Purpose**: Content creation and text authoring
- **Capabilities**:
  - Browse and search collection objects
  - Create and edit assigned texts
  - Link texts to collection objects
  - Use rich-text editor with full formatting
  - Participate in hierarchical text structures
  - View and export their contributions

**Role inheritance**: Users can have different roles across multiple projects (e.g., Owner on one project, Author on another).

---

### Password management

The CT Text Tool uses secure password management with several features:

#### **Initial passwords**
- **New users receive temporary passwords** that expire after 7 days
- **Temporary passwords must be changed** on first login
- **Password requirements**: Minimum 8 characters with at least one letter and one number

#### **Changing your password**
1. **From any page**: Click "Change password" in the header user menu
2. **Enter current password**: Your existing password
3. **Enter new password**: Must meet security requirements
4. **Confirm new password**: Re-type to verify
5. **Click "Change password"**

**Password requirements:**
- At least 8 characters long
- Contains at least one letter (a-z, A-Z)
- Contains at least one number (0-9)
- Cannot be the same as your current password

#### **Forgotten passwords**
1. **On the login page**: Click "Forgotten password?"
2. **Enter your email address**
3. **Click "Submit request"**
4. **Wait for admin approval**: Password reset requests require administrator approval
5. **Check your email**: Administrators will send new temporary passwords via email

#### **Password security features**
- **Secure hashing**: Passwords use PBKDF2 with 600,000 iterations
- **Temporary password expiration**: Unused temporary passwords expire after 7 days
- **Session management**: Automatic logout after periods of inactivity
- **Password change tracking**: System tracks when passwords were last changed

---

## Dashboard navigation

### User dashboard overview

After logging in, you'll land on your personalized dashboard:

#### **Dashboard header**
- **User information**: Shows your logged-in email address
- **Change password button**: Quick access to password management
- **Navigation links**: Access to different areas based on your role

#### **Navigation tabs**
- **"Manage projects"**: View and manage all your projects (always visible)
- **"Manage authors"**: Add and manage team members (Owners and Admins only)

#### **Project overview**
The dashboard displays all projects where you have access, showing:
- **Project title and description**
- **Project owner information**
- **Project status** (Active or Archived)
- **Your role** on each project
- **Creation date**
- **Number of authors** assigned
- **Action buttons** for opening or managing projects

---

### Project management

#### **Viewing your projects**

**Search functionality:**
- Use the search bar to find specific projects
- **Boolean operators supported**: AND, OR for complex searches
- **Search fields**: Project title and description

**Project information displayed:**
- **Title**: Project name as set during setup
- **Description**: Brief project overview
- **Owner**: Email of the project owner
- **Status**: Active projects are available for work
- **Your role**: Owner or Author designation
- **Details**: Creation date and author count

#### **Project actions**

**Opening projects:**
- **Click "Open"** to navigate to a project
- **For owners**: If setup is incomplete, you'll go to the setup page
- **For authors**: Direct access to the Objects page for content creation
- **Setup completion**: Projects must be fully configured before team access

**Owner-specific actions:**
- **Delete projects**: Permanently remove projects you own (use with caution)
- **Manage settings**: Access project configuration and team management

#### **Project status management**
- **Active projects**: Available for ongoing work
- **Archived projects**: Completed projects (read-only access)
- **Status changes**: Contact administrators for status modifications

---

### Author management (owners)

Project Owners have comprehensive tools for managing their team members:

#### **Accessing author management**
1. **From your dashboard**: Click the "Manage authors" tab
2. **View current authors**: See all authors across your projects
3. **Author information displayed**:
   - Name and organization
   - Email address
   - Number of projects assigned
   - Project-specific roles

#### **Adding new authors**

**Step-by-step process:**
1. **Complete the author form**:
   - **Name**: Author's full name (optional but recommended)
   - **Organization**: Their institution or department (optional)
   - **Email address**: This becomes their login email (required)

2. **Select project access**:
   - **Click the project dropdown**: Shows all your active projects
   - **Select multiple projects**: Hold Ctrl/Cmd to select multiple
   - **Selected projects appear as pills**: Visual confirmation of selections
   - **Remove selections**: Click × on any pill to remove

3. **Click "Add author"** to create the account

**What happens next:**
- **Account creation**: System creates user account with temporary password
- **Email notification**: Draft email opens in your email client
- **Email contains**: Login instructions and temporary password
- **Author access**: New author can immediately log in and access assigned projects

#### **Managing existing authors**

**Editing author information:**
1. **Click "Edit"** next to any author
2. **Modify details**:
   - Update name and organization
   - Change project assignments using the dropdown
   - Add or remove project access
3. **Click "Save"** to apply changes
4. **Email notification**: System opens draft email to notify author of changes

**Removing authors:**
1. **Click "Delete"** next to the author
2. **Confirm deletion**: System asks for confirmation
3. **Removal process**: Author loses access to your projects only
4. **Account preservation**: If author has access to other projects, their account remains active

#### **Project Assignment Management**

**Adding Projects to Existing Authors:**
- **Edit mode**: Click "Edit" next to author name
- **Project dropdown**: Select additional projects from dropdown
- **Multiple selection**: Authors can be assigned to multiple projects
- **Role consistency**: All authors have "Author" role across projects

**Removing Project Access:**
- **Edit mode**: Access author editing interface
- **Remove projects**: Click × on project pills to remove access
- **Selective removal**: Remove from some projects while maintaining others
- **Complete removal**: Remove from all projects to fully revoke access

#### **Email Communication**

The system automatically generates email drafts for author management:

**New Author Emails Include:**
- Welcome message with project information
- Login credentials (email and temporary password)
- Instructions for first login and password change
- Project-specific access information
- Contact information for support

**Author Update Emails Include:**
- Notification of role or project changes
- Summary of added or removed project access
- Updated access information
- Contact information for questions

**Email Customization:**
- **Draft emails open in your default email client**
- **Customize content** before sending
- **Add personal messages** or project-specific instructions
- **Modify recipient lists** if needed

#### **Author Search and Filtering**

**Finding Authors:**
- **Search bar**: Find authors by name, email, or organization
- **Real-time filtering**: Results update as you type
- **Search scope**: Searches across all authors for your projects

**Author Information Display:**
- **Name and contact**: Full author details
- **Project count**: Number of your projects they can access
- **Role summary**: Always "Author" for invited team members
- **Action buttons**: Edit and delete options for each author

---

## Project setup (owners)

Project setup is a comprehensive process that configures your project for team collaboration:

### Basic project information

#### **Required fields**

**Project reference number:**
- **Purpose**: Unique identifier for your project
- **Format**: Use your organization's numbering system
- **Examples**: "EXH2024-001", "LWD2024.1.1"
- **Usage**: Appears in all exports and text references

**Text number prefix:**
- **Purpose**: Prefix for all text reference numbers
- **Default**: "TXT" 
- **Customization**: Change to match your numbering system
- **Result**: Creates references like "TXT00001", "EXH00001", etc.

**Project title:**
- **Purpose**: Display name for your project
- **Visibility**: Shown throughout the application
- **Examples**: "Roman Britain Exhibition", "Community Engagement Workshop"

**Project organiser:**
- **Purpose**: Lead institution or organization
- **Usage**: Appears in project metadata and exports
- **Examples**: "British Museum", "Wessex Museums Partnership"

**Project dates:**
- **Start date**: When project work begins
- **End date**: Projected or actual completion date
- **Format**: Use date picker for consistent formatting
- **Flexibility**: End dates can be updated before project completion

#### **Project description**

**Rich-text project note:**
- **Purpose**: Comprehensive project description
- **Editor features**: Full rich-text formatting available
  - **Headings**: Structure your description clearly
  - **Lists**: Bullet points and numbered lists
  - **Formatting**: Bold, italic, underline text
  - **Links**: Include relevant web links
- **Content suggestions**:
  - Project objectives and goals
  - Target audience information
  - Collaboration details
  - Expected outcomes
  - Timeline and milestones

#### **Language configuration**

**Selecting project languages:**
1. **Type in the language field**: Start typing language names
2. **Select from suggestions**: Choose from ISO language list
3. **Add custom languages**: Type exact name if not in list
4. **Multiple languages**: Add all languages used in your project
5. **Remove languages**: Click × on language pills to remove

**Language usage:**
- **Text authoring**: Authors select from these languages for each text
- **Export metadata**: All languages included in project exports
- **Requirements**: At least one language must be selected

### Text settings configuration

Configure how texts will be managed in your project:

#### **Text Structure Options**

**Hierarchical Text:**
- **Enable when**: Your project has parent-child text relationships
- **Examples**: Exhibition sections and subsections, thematic groupings
- **Functionality**: Authors can link texts to parent texts
- **Display**: Hierarchical view shows indented text relationships

**Text Status Tracking:**
- **Enable when**: You need workflow management
- **Purpose**: Track text progress through review stages
- **Default statuses**: Draft, Approved
- **Customization**: Add statuses like "In Review", "Final", "Published"

**Text Tags:**
- **Enable when**: You need categorical organization
- **Purpose**: Group texts by theme, audience, or purpose
- **Examples**: "Children's content", "Academic research", "Marketing materials"
- **Usage**: Authors select tags when creating texts

**Author Name Privacy:**
- **Enable when**: Author names should not appear in exports
- **Purpose**: Create anonymous publications or protect author privacy
- **Effect**: All export formats exclude author information
- **Default**: Author names are included in exports

#### **Custom Status Configuration**

**When Status Tracking is Enabled:**
1. **Review default statuses**: Draft, Approved
2. **Add custom statuses**:
   - Type status name in the field
   - Click "Add" or press Enter
   - Status appears in the list
3. **Remove statuses**: Click × next to any status
4. **Status usage**: Authors select from these options when creating texts

**Recommended Statuses:**
- **Draft**: Initial text creation
- **In Review**: Under editorial review
- **Approved**: Ready for publication
- **Final**: Completed and approved
- **Published**: Released to public

#### **Custom Tag Configuration**

**When Text Tags are Enabled:**
1. **Plan your tag structure**: Consider organizational needs
2. **Add tags systematically**:
   - Type tag name in the field
   - Click "Add" or press Enter
   - Tag appears in the list
3. **Remove tags**: Click × next to any tag
4. **Tag usage**: Authors select from these tags when creating texts

**Tag Strategy Examples:**
- **By audience**: "Children", "Adults", "Specialists"
- **By content type**: "Introduction", "Detailed Analysis", "Quick Facts"
- **By theme**: "Social History", "Technical Details", "Cultural Context"

### Rights and Licensing Information

#### **Copyright Licensor** (Required)
- **Purpose**: Identify who can grant usage permissions
- **Content**: Person or organization name
- **Note**: Not necessarily the copyright holder
- **Examples**: "Museum of London", "Dr. Jane Smith", "Wessex Museums"

#### **Usage Licence** (Required)
- **Purpose**: Define how texts can be used
- **Dropdown options**: Common Creative Commons licenses
  - CC BY 4.0 (Attribution)
  - CC BY-SA 4.0 (Attribution-ShareAlike)
  - CC BY-NC 4.0 (Attribution-NonCommercial)
  - CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)
  - CC BY-ND 4.0 (Attribution-NoDerivatives)
  - CC BY-NC-ND 4.0 (Attribution-NonCommercial-NoDerivatives)
  - CC0 1.0 (Public Domain)
- **Custom licenses**: Select "Add new licence" to create custom options
- **Usage**: License information appears in all exports

#### **Optional Rights Fields**

**Project Type:**
- **Purpose**: Categorize the project nature
- **Examples**: "Exhibition", "Workshop", "Research Project", "Community Program"

**Project Venue:**
- **Purpose**: Location information
- **Examples**: "British Museum, London", "Online Platform", "Multiple Locations"

**Credit Line:**
- **Purpose**: Acknowledgment text for publications
- **Format**: Agreed with copyright holders
- **Examples**: "© 2024 Museum of London", "Text by Dr. Jane Smith, courtesy of..."

**Text Audience:**
- **Purpose**: Target reader description
- **Examples**: "KS3 Students", "General Public", "Academic Researchers"
- **Standards**: Use recognized audience categories when possible

**Rights Reference Number:**
- **Purpose**: License tracking identifier
- **Usage**: Links to formal rights agreements
- **Examples**: "RIN-2024-001", "LIC-EXH-2024-03"

### Connecting to MDS

#### **Understanding MDS Integration**

**Museum Data Service (MDS)** provides access to collection object records:
- **Purpose**: Connect your texts to collection objects
- **Data source**: Comprehensive UK museum collection data
- **Integration**: Direct API connection for real-time data access

#### **Obtaining an MDS API Token**

**Step-by-Step Process:**
1. **Visit the MDS Object Search**: Go to https://museumdata.uk/object-search/
2. **Perform a search**: Find objects relevant to your project
3. **Locate the API token link**: At bottom of results page, click "Get an API token"
4. **Complete the form**:
   - **Contact information**: Your details
   - **Project description**: Brief explanation of your intended use
   - **Data usage declaration**: Agree to respect licensing terms
5. **Submit and receive token**: Token emailed to you or displayed on screen

**Token Characteristics:**
- **Format**: Long alphanumeric string
- **Example**: "9AyjhGNQQFkSCT5QtkaPdQ7-Cz7onxXq231/T8F-QRk1xVnplfxcvDRgm081xpDx..."
- **Security**: Keep tokens confidential
- **Scope**: Token provides access to your search results

#### **Configuring MDS Connection**

**In the Project Setup Form:**
1. **Locate the "MDS API token" field**
2. **Paste your complete token**: Use the full token string
3. **Verify format**: Token should be several lines of text
4. **Save project setup**: Token is stored securely

**What Happens Next:**
- **Data fetching**: System connects to MDS using your token
- **Object loading**: Up to 50,000 records loaded and cached
- **Search capability**: Full Boolean search across all object data
- **Performance**: Records cached locally for fast browsing

#### **Completing Project Setup**

**Final Steps:**
1. **Review all information**: Check all required fields are complete
2. **Save project setup**: Click the save button
3. **Setup confirmation**: Success message appears
4. **Navigation**: Redirected to Objects page to begin work

**Setup Completion Results:**
- **Team access enabled**: Authors can now access the project
- **Object data available**: MDS records ready for browsing and linking
- **Text creation ready**: All tools activated for content creation
- **Export functionality**: All export formats available

---

## Working with objects

### Browsing object records

Once your project setup is complete, you can browse collection objects from the Museum Data Service:

#### **Objects page layout**

**Display mode options:**
The Objects page offers three layout modes accessible via buttons in the top-right:

**Split view (default):**
- **Left panel**: Objects table for browsing records
- **Right panel**: Text creation form
- **Resizable**: Drag the divider to adjust panel sizes
- **Keyboard accessible**: Use arrow keys when divider is focused

**Horizontal view:**
- **Top panel**: Text creation form
- **Bottom panel**: Objects table
- **Full width**: Both panels use complete screen width
- **Workflow**: Create text first, then select objects

**Focus view:**
- **Single panel**: Choose between Objects or Text
- **Toggle buttons**: Switch between "Objects" and "Text" views
- **Distraction-free**: Full screen space for current task

#### **Objects table features**

**Column display:**
- **Object number**: Primary identifier from collection system
- **Object name**: Type or category of object
- **Brief description**: Summary information about the object
- **Actions**: View and selection controls

**Optional columns:**
- **Collection**: Toggle to show source museum/collection
- **Title**: Toggle to show object titles when available

**Table controls:**
- **Pagination**: Navigate through records (10, 25, 50, or 100 per page)
- **Selection**: Individual checkboxes plus "Select all" option
- **View links**: Direct access to full MDS records

### Advanced search and filtering

#### **Search functionality**

**Basic search:**
- **Search bar**: Located at the top of the Objects page
- **Search scope**: Searches across all object fields
- **Real-time results**: Table updates as you type
- **Clear function**: "Clear" button removes search terms

**Boolean search operators:**
- **AND** (default): All terms must be present
  - Example: "roman pottery" finds objects with both words
- **OR**: Either term can be present
  - Example: "pottery OR ceramics" finds objects with either word
- **NOT** or **-**: Excludes terms
  - Example: "pottery -modern" excludes modern pottery
- **Phrases**: Use quotes for exact phrases
  - Example: "medieval manuscript" searches for that exact phrase

**Search examples:**
- `bronze AND age` - Objects from the Bronze Age
- `textile OR fabric OR cloth` - Any textile-related objects
- `painting -portrait` - Paintings that aren't portraits
- `"roman coin"` - Exact phrase matching

#### **Display Options**

**View Toggles:**
- **Show collection**: Display source museum for each object
- **Show title**: Include object titles when available
- **Show selected only**: Filter to display only chosen objects

**Selection Management:**
- **Individual selection**: Click checkboxes on specific objects
- **Select all**: Choose all visible objects at once
- **Clear selection**: Remove all current selections
- **Selection count**: Shows number of objects selected

#### **Filtering and Organization**

**Selection-Based Filtering:**
- **Show selected only**: Focus on objects you've chosen
- **Clear to show all**: Return to full dataset view
- **Selection persistence**: Chosen objects remain selected during navigation

**Pagination Controls:**
- **Records per page**: Choose 10, 25, 50, or 100 objects per page
- **Page navigation**: First, Previous, specific page numbers, Next, Last
- **Total count**: Shows current page range and total records

### Viewing Object Details

#### **Object Detail Access**

**View Button:**
- **Location**: "View" button in the Actions column
- **Function**: Opens popup window with full MDS record
- **Content**: Complete object information as displayed on Museum Data Service

**Detail Window Features:**
- **Full record**: All available metadata fields
- **Images**: Object photographs when available
- **Collection context**: Museum and collection information
- **Direct link**: Option to open full MDS page in new tab

#### **Object Record Information**

**Standard Fields Displayed:**
- **Object number**: Primary collection identifier
- **Title**: Object name or title
- **Object name**: Category or type classification
- **Brief description**: Summary of the object
- **Collection**: Source museum or collection
- **Additional metadata**: Varies by object and collection

**Extended Information:**
- **Detailed descriptions**: Full cataloguing information
- **Historical context**: Dating and provenance details
- **Physical details**: Dimensions, materials, condition
- **Classification**: Subject categories and keywords

### Selecting Objects for Texts

#### **Selection Process**

**Individual Selection:**
1. **Browse objects**: Use search and filtering to find relevant items
2. **Review details**: Click "View" to examine full records
3. **Select objects**: Click checkboxes to choose items
4. **Monitor selection**: Selection count updates automatically

**Bulk Selection:**
1. **Filter first**: Use search to narrow to relevant objects
2. **Select all visible**: Click header checkbox or "Select All" button
3. **Refine selection**: Uncheck individual items as needed
4. **Verify count**: Check selection counter for accuracy

#### **Selection Strategy**

**Project Planning:**
- **Identify themes**: Group objects by subject or narrative
- **Plan text structure**: Consider how objects relate to planned texts
- **Note object relationships**: Some objects work well together

**Selection Best Practices:**
- **Quality over quantity**: Choose objects that strongly support your narrative
- **Diverse perspectives**: Include objects that show different viewpoints
- **Clear connections**: Ensure objects relate meaningfully to your text topics
- **Documentation**: Note why specific objects were chosen

#### **Working with Selections**

**Managing Selected Objects:**
- **Review selections**: Use "Show selected only" to focus on chosen items
- **Modify selections**: Add or remove objects as needed
- **Clear all**: Start over with new selections if needed
- **Persistent selections**: Objects remain selected while navigating pages

**Integration with Text Creation:**
- **Automatic linking**: Selected objects link to texts you create
- **Object references**: Text form shows linked object count
- **Relationship tracking**: System maintains object-text connections
- **Export inclusion**: Linked objects appear in all export formats

---

## Creating and managing texts

### Creating a new text

#### **Starting text creation**

**From the Objects page:**
1. **Select relevant objects**: Choose objects to link with your text
2. **Navigate to text form**: Use split view or switch to text panel
3. **Begin writing**: Text form appears in the right panel or focus view

**Text form overview:**
- **Rich-text editor**: Main content area with formatting tools
- **Metadata fields**: Author, language, status, and other project-specific options
- **Linked objects**: Automatically shows selected objects
- **Save controls**: Save or cancel buttons

#### **Required text information**

**Text content:**
- **Main requirement**: Text cannot be empty
- **Rich formatting**: Use toolbar for styling and structure
- **HTML support**: Advanced users can switch to HTML code view

**Author assignment:**
- **Dropdown selection**: Choose from project authors
- **Multiple authors**: Select additional authors if needed
- **Requirements**: At least one author must be assigned

**Language selection:**
- **Project languages**: Choose from configured project languages
- **Multiple languages**: Select all applicable languages
- **Requirements**: At least one language must be selected

#### **Optional text metadata**

**Text reference number:**
- **Auto-generation**: System creates unique reference numbers
- **Format**: Uses project prefix plus sequential number
- **Example**: "TXT00001", "EXH00001" (based on your prefix)
- **Uniqueness**: Each text receives a unique identifier

**Text note:**
- **Purpose**: Additional information about the text
- **Content**: Context, usage notes, or internal comments
- **Visibility**: Appears in text management and exports
- **Optional**: Can be left blank if not needed

**Date field:**
- **Auto-set**: Defaults to current date
- **Customizable**: Change to reflect actual creation or content date
- **Format**: Uses standard date format
- **Export inclusion**: Date appears in all export formats

### Using the rich-text editor

#### **Editor interface**

**Toolbar features:**
The editor provides comprehensive formatting options:

**Text formatting:**
- **Bold, italic, underline**: Basic text emphasis
- **Headings**: H1 through H6 for document structure
- **Font options**: Size and family selection
- **Color options**: Text and background colors

**Document structure:**
- **Bullet lists**: Unordered lists for items
- **Numbered lists**: Ordered lists for sequences
- **Indentation**: Increase/decrease list indentation
- **Alignment**: Left, center, right, justify

**Advanced features:**
- **Links**: Insert web links or internal references
- **Tables**: Create and edit data tables
- **Images**: Insert images from HTTPS URLs
- **Subscript/superscript**: Scientific notation and citations

#### **Special Editor Features**

**Full-Screen Mode:**
- **Activation**: Click "Full screen" button
- **Benefits**: Distraction-free writing environment
- **Exit**: Click "Exit full screen" or press Escape
- **Ideal for**: Long-form writing sessions

**HTML Code View:**
- **Toggle**: Switch between visual editor and HTML code
- **Purpose**: Fine-tune formatting or add custom HTML
- **Caution**: Advanced feature - incorrect HTML can break formatting
- **Return**: Click "Visual editor" to return to normal view

**Image Insertion:**
- **URL method**: Click "Insert image from URL" button
- **Requirements**: Images must be hosted on HTTPS URLs
- **Security**: Only secure image sources accepted
- **Alternatives**: Contact administrators for image hosting options

#### **Writing Best Practices**

**Content Structure:**
- **Use headings**: Create clear document hierarchy
- **Short paragraphs**: Improve readability
- **Lists for sequences**: Use numbered lists for step-by-step information
- **Lists for items**: Use bullet points for related items

**Formatting Guidelines:**
- **Consistent style**: Apply formatting consistently throughout
- **Emphasis sparingly**: Don't overuse bold or italic text
- **Clear hierarchy**: Use heading levels logically
- **Professional tone**: Match your institution's style guidelines

### Linking Texts to Objects

#### **Automatic Object Linking**

**Selection-Based Linking:**
- **Process**: Objects selected in the Objects table automatically link to new texts
- **Visibility**: Text form shows count of linked objects
- **Persistence**: Links maintained when text is saved
- **Export inclusion**: Linked objects appear in all export formats

**Link Management:**
- **View links**: Object count button shows linked items
- **Modify links**: Return to Objects page to change selections
- **Link tracking**: System maintains all object-text relationships
- **Multiple texts**: Same objects can link to multiple texts

#### **Object-Text Relationships**

**Relationship Types:**
- **Direct links**: Objects explicitly selected for the text
- **Thematic links**: Objects related to text topic or theme
- **Supporting links**: Objects providing context or background
- **Illustrative links**: Objects serving as examples

**Link Documentation:**
- **Internal notes**: Use text note field to document object relationships
- **Clear descriptions**: Explain why objects were chosen
- **Context information**: Note how objects support the text narrative
- **Usage guidance**: Indicate how objects should be used with the text

#### **Managing Object Links**

**Viewing Linked Objects:**
- **Objects page**: Click object count in text form
- **Texts page**: Linked object count shown in table
- **Export formats**: All formats include object information
- **Direct access**: Links to full MDS records provided

**Modifying Links:**
- **Add objects**: Select additional objects in Objects page
- **Remove objects**: Deselect objects you no longer need
- **Change selections**: Update object choices as text evolves
- **Bulk changes**: Select different object sets for major revisions

### Creating Hierarchical Texts

**Note**: Hierarchical text functionality is only available if enabled during project setup.

#### **Understanding Text Hierarchy**

**Parent-Child Relationships:**
- **Parent texts**: Top-level or section texts
- **Child texts**: Subsidiary or detail texts
- **Hierarchy levels**: Support for multiple levels of organization
- **Visual representation**: Indented display in hierarchical view

**Use Cases:**
- **Exhibition organization**: Sections and subsections
- **Thematic grouping**: Main topics and subtopics
- **Sequential content**: Chapters and sections
- **Audience levels**: Overview and detailed texts

#### **Creating Hierarchical Relationships**

**Parent Text Selection:**
- **Dropdown menu**: Choose from existing texts in the project
- **Search functionality**: Find parent texts quickly
- **No parent option**: Leave blank for top-level texts
- **Relationship creation**: Parent-child link established on save

**Hierarchy Planning:**
- **Structure first**: Plan overall text organization
- **Create parents first**: Establish top-level texts before children
- **Logical grouping**: Ensure child texts logically belong to their parents
- **Depth limits**: System supports multiple hierarchy levels (typically 3-4 levels)

#### **Working with Hierarchical Texts**

**Creating Parent Texts:**
1. **Start with overview**: Create main section or topic texts first
2. **Leave parent field empty**: These become top-level texts
3. **Broad content**: Focus on general themes or section introductions
4. **Save and note reference**: Record reference numbers for child text creation

**Creating Child Texts:**
1. **Select parent text**: Use dropdown to choose appropriate parent
2. **Focused content**: Write detailed or specific content
3. **Clear relationship**: Ensure content logically relates to parent
4. **Multiple children**: Create several child texts for one parent if needed

**Hierarchy Visualization:**
- **Hierarchical view**: Toggle in Texts page to see structure
- **Indented display**: Child texts appear indented under parents
- **Visual organization**: Easy to understand text relationships
- **Navigation aid**: Helps team understand content structure

### Text Status and Tags

**Note**: Status and tag functionality depends on project setup configuration.

#### **Text Status Management**

**When Status Tracking is Enabled:**

**Status Assignment:**
- **Dropdown selection**: Choose from project-configured statuses
- **Default options**: Usually includes Draft, Approved
- **Custom statuses**: May include In Review, Final, Published, etc.
- **Required field**: Status must be selected if tracking is enabled

**Status Workflow:**
- **Draft**: Initial text creation and development
- **In Review**: Text submitted for editorial review
- **Approved**: Text accepted and ready for use
- **Final**: Completed and approved for publication
- **Published**: Released to public or delivered to client

**Status Updates:**
- **Edit texts**: Change status as work progresses
- **Bulk updates**: Change status for multiple texts simultaneously
- **Progress tracking**: Monitor project completion through status reports
- **Team coordination**: Status helps team understand text readiness

#### **Text Tag System**

**When Text Tags are Enabled:**

**Tag Assignment:**
- **Dropdown selection**: Choose from project-configured tags
- **Single tag**: Most projects use one tag per text
- **Optional field**: Tags can be left unassigned if not applicable
- **Consistent usage**: Use tags consistently across the project

**Tag Categories:**
Common tag systems include:
- **Audience tags**: "Children", "Adults", "Specialists", "General Public"
- **Content type tags**: "Introduction", "Detailed Analysis", "Quick Facts", "Background"
- **Theme tags**: "Social History", "Technical Details", "Cultural Context", "Contemporary Relevance"
- **Usage tags**: "Exhibition Text", "Website Content", "Educational Material", "Research Notes"

**Tag Strategy:**
- **Plan systematically**: Develop consistent tagging approach
- **Team guidelines**: Ensure all authors understand tag meanings
- **Regular review**: Check tag usage for consistency
- **Export organization**: Tags help organize exported content

### Bulk Editing and Management

#### **Accessing Text Management**

**Texts Page Overview:**
1. **Navigate to Texts page**: Click "Edit texts" in project header
2. **Table view**: See all project texts in customizable table
3. **Search functionality**: Find specific texts quickly
4. **Bulk action tools**: Select and modify multiple texts

#### **Text Table Customization**

**Column Configuration:**
- **Choose field 1**: Select first metadata column to display
- **Choose field 2**: Select second metadata column to display
- **Available options**: Authors, Date, Languages, Status, Tags, etc.
- **Dynamic display**: Columns adjust based on project settings

**Column Options Include:**
- **Author(s)**: Text authors and contributors
- **Date**: Text creation or modification date
- **Language(s)**: Languages assigned to text
- **Status**: Current workflow status (if enabled)
- **Tag**: Assigned category tag (if enabled)
- **Parent text**: Hierarchical parent (if enabled)
- **Note**: Internal text notes
- **Linked objects**: Count of associated collection objects
- **Last updated**: Most recent modification timestamp

#### **Table View Modes**

**Flat View (Default):**
- **Simple list**: All texts in chronological or alphabetical order
- **Easy scanning**: Quick overview of all project texts
- **Standard table**: Familiar spreadsheet-like interface

**Hierarchical View:**
- **Available when**: Hierarchical texts enabled in project
- **Indented display**: Child texts appear under parents
- **Visual structure**: Clear parent-child relationships
- **Organizational clarity**: Understand text structure at a glance

#### **Bulk Selection and Actions**

**Selecting Texts:**
- **Individual selection**: Click checkboxes for specific texts
- **Select all**: Choose all visible texts
- **Search and select**: Filter texts, then select results
- **Selection count**: Monitor how many texts are selected

**Bulk Action Options:**

**Edit in Table:**
- **Purpose**: Make quick changes directly in the table
- **Process**: Selected texts become editable in their table rows
- **Editable fields**: Depends on column configuration and project settings  
- **Save changes**: Apply modifications to all selected texts
- **Cancel option**: Discard changes if needed

**Bulk Edit:**
- **Purpose**: Apply same changes to multiple texts
- **Process**: Fill in values to apply to all selected texts
- **Field options**: Status, tags, authors, languages, notes
- **Confirmation**: System asks for confirmation before applying
- **Efficiency**: Quickly update many texts with same information

**Delete:**
- **Purpose**: Remove multiple texts simultaneously
- **Confirmation**: System requires confirmation before deletion
- **Permanent action**: Deleted texts cannot be recovered
- **Use carefully**: Ensure texts are no longer needed

#### **Search and Filtering**

**Text Search:**
- **Search bar**: Located above the text table
- **Search scope**: Text reference numbers, content, and author names
- **Real-time results**: Table updates as you type
- **Clear function**: Remove search terms to show all texts

**Advanced Filtering:**
- **Column-based**: Use column dropdowns to filter by specific values
- **Status filtering**: Show only texts with specific statuses
- **Author filtering**: Display texts by specific authors
- **Tag filtering**: Filter by assigned tags

#### **Inline Editing**

**Edit in Table Mode:**
1. **Select texts**: Choose texts to modify using checkboxes
2. **Click "Edit in table"**: Activate inline editing mode
3. **Edit fields**: Click in table cells to modify values
4. **Dropdown fields**: Use dropdowns for status, tags, authors, languages
5. **Text fields**: Type directly in text fields like notes
6. **Save or cancel**: Apply changes or discard modifications

**Field Types:**
- **Dropdown fields**: Status, tags, authors, languages (select from options)
- **Text fields**: Notes, dates (type directly)
- **Read-only fields**: Reference numbers, linked objects, last updated
- **Date fields**: Use date picker for consistent formatting

**Bulk Edit Mode:**
1. **Select multiple texts**: Choose texts to update
2. **Click "Bulk Edit"**: Open bulk editing interface
3. **Fill in values**: Enter values to apply to all selected texts
4. **Choose fields**: Select which fields to update
5. **Apply changes**: Confirm and apply to all selected texts
6. **Email notifications**: System may generate notification emails

---

## Exporting and sharing

### Available export formats

The CT Text Tool supports multiple export formats to suit different use cases:

#### **CSV (Comma-separated values)**

**Single file export:**
- **Content**: Complete project data with embedded metadata
- **Metadata**: Project information encoded as JSON in file header
- **Text preservation**: HTML formatting preserved in text fields
- **Object links**: Full Museum Data Service URLs included
- **Use cases**: Data analysis, spreadsheet import, database loading

**Two-file export:**
- **File 1**: Project metadata as separate CSV
- **File 2**: Text data as separate CSV
- **Benefits**: Cleaner separation of project info and content
- **Metadata fields**: All project settings and configuration details
- **Use cases**: Systems requiring separate metadata and content files

**CSV features:**
- **UTF-8 encoding**: Proper display of special characters and accents
- **Excel compatibility**: Opens correctly in Microsoft Excel
- **Quoted fields**: All text properly escaped for CSV parsing
- **Timestamp**: Export date and time included in filename

#### **XML (Extensible markup language)**

**Structured data export:**
- **Hierarchical format**: Reflects parent-child text relationships
- **Complete metadata**: All project settings and text information
- **CDATA sections**: HTML content preserved without escaping
- **Schema compliance**: Well-formed XML for programmatic processing

**XML content:**
- **Project section**: Complete project metadata and settings
- **Texts section**: All text content with full metadata
- **Object references**: Linked objects with full MDS URLs
- **Export timestamp**: Date and time of export creation

**Use cases:**
- **System integration**: Import into content management systems
- **Data exchange**: Share with other institutions or platforms
- **Archive format**: Long-term preservation with full metadata
- **Processing**: Programmatic manipulation and transformation

#### **JSON (JavaScript object notation)**

**Machine-readable format:**
- **Complete data representation**: All project and text information
- **Nested structure**: Reflects hierarchical relationships
- **API-friendly**: Easy integration with web applications
- **Unicode support**: Proper handling of multilingual content

**JSON structure:**
- **Project object**: Complete project metadata and settings  
- **Texts array**: All texts with full metadata and content
- **Relationships**: Parent-child links clearly represented
- **Export metadata**: Timestamp and format version information

**Use cases:**
- **Web applications**: Integration with websites and online platforms
- **APIs**: Data exchange with external systems
- **Backup format**: Complete project backup in structured format
- **Development**: Use by programmers and system integrators

#### **HTML (Web format)**

**Publication-ready export:**
- **Formatted display**: Styled HTML suitable for web publishing
- **Embedded CSS**: Self-contained files with styling
- **Clickable links**: Direct links to Museum Data Service records
- **Print optimization**: Suitable for both screen and print

**HTML features:**
- **Professional styling**: Clean, readable formatting
- **Project header**: Complete project information at top
- **Text organization**: Each text as separate section
- **Object integration**: Linked objects with clickable references
- **Metadata display**: All text metadata clearly presented

**Use cases:**
- **Web publishing**: Direct upload to websites
- **Documentation**: Professional project documentation
- **Sharing**: Easy sharing with non-technical stakeholders
- **Archive format**: Human-readable long-term preservation

### Export Options and Settings

#### **Privacy Controls**

**Author Name Inclusion:**
- **Default**: Author names included in all exports
- **Privacy option**: "Do not include author names when exporting"
- **When enabled**: All export formats exclude author information
- **Use cases**: Anonymous publications, author privacy protection
- **Configuration**: Set during project setup, affects all exports

**Project-Level Settings:**
- **Consistent application**: Privacy settings apply to all export formats
- **Team coordination**: All team members see same privacy settings
- **Export preview**: Clear indication when author names excluded
- **Metadata preservation**: Other text metadata still included

#### **Export Process**

**Initiating Exports:**
1. **Navigate to Texts page**: Access text management interface
2. **Locate export controls**: Export buttons at top of text table
3. **Select format**: Choose CSV, XML, JSON, or HTML
4. **Process time**: Exports generate immediately for most projects
5. **Download**: Files download automatically to your device

**File Naming:**
- **Format**: ProjectReference_Timestamp.extension
- **Examples**: "EXH2024_15-03-2024_14-30.csv"
- **Timestamp**: Date and time of export for version tracking
- **Uniqueness**: Each export has unique filename

#### **Export Content**

**What's Included:**
- **All project texts**: Complete text content with formatting
- **Full metadata**: All configured text metadata fields
- **Project information**: Complete project setup and configuration
- **Object relationships**: All linked Museum Data Service objects
- **Hierarchical structure**: Parent-child relationships preserved
- **Export timestamp**: When the export was created

**Quality Assurance:**
- **Content verification**: Review exports before sharing
- **Format testing**: Test exports in target applications
- **Metadata completeness**: Ensure all required information included
- **Link validation**: Verify object links work correctly

### Best Practices

#### **Export Strategy**

**Regular Backups:**
- **Milestone exports**: Export at key project stages
- **Version control**: Keep dated exports for project history
- **Format diversity**: Use different formats for different purposes
- **Storage strategy**: Organize exports in clear folder structure

**Format Selection:**
- **CSV for analysis**: Data analysis and spreadsheet work
- **XML for systems**: Integration with other platforms
- **JSON for developers**: Technical integration and APIs
- **HTML for sharing**: Human-readable sharing and documentation

#### **Quality Control**

**Pre-Export Checklist:**
- **Content review**: Ensure all texts are complete and accurate
- **Metadata verification**: Check all required fields are filled
- **Status updates**: Update text statuses to reflect current state
- **Team coordination**: Confirm all team members have completed their work

**Post-Export Verification:**
- **File integrity**: Open exports to verify content completeness
- **Format testing**: Test in target applications (Excel, web browsers, etc.)
- **Link verification**: Check that object links work correctly
- **Metadata accuracy**: Verify project information is complete and correct

#### **Sharing and Distribution**

**Internal Sharing:**
- **Team access**: Share exports with project team members
- **Review process**: Use exports for editorial review and approval
- **Progress tracking**: Share status updates with stakeholders
- **Archive copies**: Maintain copies for institutional records

**External Distribution:**
- **Client delivery**: Provide exports in client-requested formats
- **Publication preparation**: Use HTML exports for web publishing
- **Data sharing**: Provide CSV/XML for technical integration
- **Long-term preservation**: Archive complete exports with project records

#### **Technical Considerations**

**File Size Management:**
- **Large projects**: Exports may be substantial for projects with many texts
- **Format efficiency**: Different formats have different file sizes
- **Compression**: Consider zipping large exports for sharing
- **Storage planning**: Plan storage space for multiple export versions

**Compatibility:**
- **Software testing**: Test exports with intended software applications
- **Character encoding**: UTF-8 encoding supports international characters
- **Format standards**: All exports follow established format standards
- **Version compatibility**: Exports work with current software versions

---

## Getting help

### Support resources

#### **In-application help**

**User guide access:**
- **Help button**: Click the "?" icon in any page header
- **Comprehensive guide**: Complete documentation for all features
- **Context-sensitive**: Links to relevant guide sections
- **Always available**: Accessible from any page in the application

**Interface guidance:**
- **Tooltips**: Hover over field labels and buttons for quick help
- **Form hints**: Helpful text beneath form fields
- **Error messages**: Clear guidance when something goes wrong
- **Success confirmations**: Feedback when actions complete successfully

#### **Direct support contacts**

**Application support:**
- **Contact**: Katie Brown, Collections use officer
- **Email**: katie@collectionstrust.org.uk
- **Expertise**: Using the tool, project setup, workflow questions
- **Response**: Collections Trust team provides support during business hours

**Museum Data Service support:**
- **Contact**: Arran Rees, Museum data manager  
- **Email**: support@museumdata.uk
- **Expertise**: MDS API tokens, data issues, collection records
- **Resources**: Visit https://museumdata.uk for additional information

#### **Technical assistance**

**Common issues and solutions:**

**Login problems:**
- **Forgotten password**: Use "Forgotten password?" link on login page
- **Account access**: Contact your project owner or administrator
- **Temporary passwords**: Must be changed within 7 days of creation
- **Browser issues**: Try clearing cache or using different browser

**Project setup issues:**
- **MDS token problems**: Verify token is complete and correctly pasted
- **Required fields**: All starred (*) fields must be completed
- **Save failures**: Check internet connection and try again
- **Permission errors**: Ensure you have owner role for the project

**Text creation issues:**
- **Editor problems**: Try refreshing page or using different browser
- **Save failures**: Check for required fields and internet connection
- **Object linking**: Ensure objects are selected before creating texts
- **Permission issues**: Verify you have author or owner access to project

**Export issues:**
- **Download failures**: Check browser download settings
- **File format problems**: Try different export format
- **Large file issues**: Consider exporting in smaller batches
- **Content missing**: Verify all required project setup is complete

#### **Best practices for getting help**

**Before contacting support:**
- **Check this guide**: Review relevant sections for your issue
- **Try basic troubleshooting**: Refresh page, clear cache, try different browser
- **Check permissions**: Verify you have appropriate role for the action
- **Gather information**: Note specific error messages or unusual behavior

**When contacting support:**
- **Describe the issue clearly**: What were you trying to do?
- **Include specific details**: Error messages, browser type, time of issue
- **Mention your role**: Are you an owner, author, or admin?
- **Project information**: Which project were you working on?
- **Screenshots help**: Visual information can clarify issues quickly

#### **Community resources**

**Collections Trust resources:**
- **Website**: https://collectionstrust.org.uk
- **Spectrum guidance**: Implementation of "Use of collections" procedures
- **Training materials**: Additional resources for museum professionals
- **Professional networks**: Connect with other museum professionals using the tool

**Museum Data Service resources:**
- **Website**: https://museumdata.uk
- **Data sharing information**: How MDS data sharing works
- **Search tools**: Object search and discovery tools
- **Technical documentation**: API and data format information

#### **Feedback and suggestions**

**Improving the tool:**
- **Feature requests**: Contact Collections Trust with suggestions for new features
- **Bug reports**: Report technical issues for resolution
- **Usability feedback**: Share thoughts on interface and workflow improvements
- **Case studies**: Share successful project examples to help other users

**Contributing to documentation:**
- **Guide improvements**: Suggest additions or clarifications to this guide
- **Workflow examples**: Share successful project workflows
- **Best practice sharing**: Help other users learn from your experience
- **Community building**: Connect with other CT Text Tool users

---

*This user guide is maintained by Collections Trust and updated regularly to reflect new features and improvements. For the most current version, always refer to the in-application help system accessible via the "?" button in the application header.*

**Document version**: 2024.1  
**Last updated**: March 2024  
**Contact**: katie@collectionstrust.org.uk
