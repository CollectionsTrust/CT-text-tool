// src/components/UserGuide/index.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../navigation/MainHeader';
import './UserGuide.css';

const UserGuide = ({ isPublic }) => {
  const navigate = useNavigate();
  const [returnPath, setReturnPath] = useState('/');

  // Retrieve the return path when the component mounts
  useEffect(() => {
    if (!isPublic) {
      const storedPath = sessionStorage.getItem('returnPath');
      if (storedPath) {
        setReturnPath(storedPath);
      }
    }
  }, [isPublic]);

  // Handle return to previous page
  const handleReturn = (e) => {
    e.preventDefault();
    navigate(returnPath);
  };

  // Scroll to the section when clicking on a TOC link
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {!isPublic && <MainHeader />}
      <div className="container user-guide-container">
        <div className="user-guide">
          <div className="user-guide-header">
            <h1 className="guide-title">CT Text Tool User Guide</h1>
            <div className="return-link">
              {isPublic ? (
                <Link to="/">← Return to home page</Link>
              ) : (
                <a href="#" onClick={handleReturn}>← Return to your last page</a>
              )}
            </div>
          </div>
          
          <div className="guide-content">
            <section className="guide-section" id="contents">
              <h2>Contents</h2>
              <ul className="toc-list">
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('getting-started'); }}>Getting started</a>
                  <ul>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('requesting-access'); }}>Requesting access</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('logging-in'); }}>Logging in</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('understanding-user-roles'); }}>Understanding user roles</a></li>
                  </ul>
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('dashboard-navigation'); }}>Dashboard navigation</a>
                  <ul>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('user-dashboard'); }}>User dashboard</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('project-management'); }}>Project management</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('author-management'); }}>Author management</a></li>
                  </ul>
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('project-setup'); }}>Project setup</a>
                  <ul>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('basic-project-information'); }}>Basic project information</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('connecting-to-mds'); }}>Connecting to MDS</a></li>
                  </ul>
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('working-with-objects'); }}>Working with objects</a>
                  <ul>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('browsing-object-records'); }}>Browsing object records</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('searching-and-filtering'); }}>Searching and filtering</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('viewing-object-details'); }}>Viewing object details</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('selecting-objects-for-texts'); }}>Selecting objects for texts</a></li>
                  </ul>
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('creating-and-managing-texts'); }}>Creating and managing texts</a>
                  <ul>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('creating-a-new-text'); }}>Creating a new text</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('using-the-rich-text-editor'); }}>Using the rich-text editor</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('linking-texts-to-objects'); }}>Linking texts to objects</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('creating-hierarchical-texts'); }}>Creating hierarchical texts</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('text-status-and-tags'); }}>Text status and tags</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('bulk-editing-and-management'); }}>Bulk editing and management</a></li>
                  </ul>
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('exporting-and-sharing'); }}>Exporting and sharing</a>
                  <ul>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('available-export-formats'); }}>Available export formats</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('tips-for-best-practices'); }}>Tips for best practices</a></li>
                  </ul>
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('getting-help'); }}>Getting help</a></li>
              </ul>
            </section>
            
            <section className="guide-section" id="getting-started">
              <h2>Getting started</h2>
              <p>
                This guide will help you use the CT Text Tool effectively, whether you're a project owner or author.
                Follow the instructions below to get set up and make the most of the tool's features.
              </p>
              
              <h3 id="requesting-access">Requesting access</h3>
              <p>
                To start using the CT Text Tool, you need to request access:
              </p>
              <ol>
                <li>Visit the landing page of the application</li>
                <li>Scroll to the "Request project access" form in the right panel</li>
                <li>Fill in your details:
                  <ul>
                    <li>Your name</li>
                    <li>Email address</li>
                    <li>Organization</li>
                    <li>Proposed project title</li>
                    <li>Brief project description</li>
                  </ul>
                </li>
                <li>Click "Submit request"</li>
                <li>Your request will be reviewed by an administrator who will create your project</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="logging-in">Logging in</h3>
              <p>
                Once your request has been approved:
              </p>
              <ol>
                <li>Return to the landing page</li>
                <li>In the "Existing users" section, enter:
                  <ul>
                    <li>Your registered email address</li>
                    <li>Password: "default" (the system uses a single default password)</li>
                  </ul>
                </li>
                <li>Click "Log in"</li>
                <li>You'll be directed to your dashboard</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="understanding-user-roles">Understanding user roles</h3>
              <p>
                The CT Text Tool has three user roles:
              </p>
              <ul>
                <li><strong>Admin</strong>: System administrators who approve project requests and manage users</li>
                <li><strong>Owner</strong>: Project owners who can set up projects, invite authors, and manage all aspects of their projects</li>
                <li><strong>Author</strong>: Contributors who can view objects and create/edit texts for assigned projects</li>
              </ul>
              <p>This guide focuses on the Owner and Author roles.</p>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
            </section>
            
            <section className="guide-section" id="dashboard-navigation">
              <h2>Dashboard navigation</h2>
              <p>
                After logging in, you'll find yourself on the dashboard which provides access to all your projects and 
                management features. This section explains how to navigate the dashboard interface.
              </p>
              
              <h3 id="user-dashboard">User dashboard</h3>
              <p>
                After logging in, you'll land on your user dashboard:
              </p>
              <p>The dashboard contains:</p>
              <ol>
                <li><strong>Header</strong>: Shows your login information and a logout button</li>
                <li><strong>Navigation tabs</strong>:
                  <ul>
                    <li>"Manage projects" - View and manage all your projects</li>
                    <li>"Manage authors" (for Owners only) - Add and manage project authors</li>
                  </ul>
                </li>
                <li><strong>Project list</strong>: Displays all projects where you are an Owner or Author, showing:
                  <ul>
                    <li>Project title and description</li>
                    <li>Owner information</li>
                    <li>Status (active or archived)</li>
                    <li>Your role</li>
                    <li>Creation date</li>
                    <li>Number of authors</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="project-management">Project management</h3>
              <p>
                From your dashboard, you can:
              </p>
              <ol>
                <li><strong>Search projects</strong>: Use the search bar to find specific projects
                  <ul>
                    <li>Supports Boolean operators (AND, OR)</li>
                    <li>Searches in title and description fields</li>
                  </ul>
                </li>
                <li><strong>View archived projects</strong>: Toggle the "Show archived projects" button</li>
                <li><strong>Open a project</strong>: Click the "Open" button to navigate to a project
                  <ul>
                    <li>If you're an Owner and project setup is incomplete, you'll be taken to the setup page</li>
                    <li>If setup is complete, you'll be taken to the Objects page</li>
                  </ul>
                </li>
                <li><strong>Project actions</strong> (for Owners):
                  <ul>
                    <li><strong>Archive/activate</strong>: Archive projects when completed, or reactivate them if needed</li>
                    <li><strong>Delete</strong>: Permanently remove projects (use with caution)</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="author-management">Author management</h3>
              <p>
                As a Project Owner, you can manage authors for your projects:
              </p>
              <ol>
                <li><strong>Add authors</strong>:
                  <ul>
                    <li>Enter name and email</li>
                    <li>Select project(s) to give access to (hold Ctrl/Cmd for multiple)</li>
                    <li>Click "Add author"</li>
                  </ul>
                </li>
                <li><strong>Manage existing authors</strong>:
                  <ul>
                    <li>View all authors for your projects</li>
                    <li>Edit their name and project access</li>
                    <li>Remove authors when needed</li>
                  </ul>
                </li>
                <li><strong>Search authors</strong>: Use the search bar to find specific authors</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
            </section>
            
            <section className="guide-section" id="project-setup">
              <h2>Project setup</h2>
              <p>
                When opening a project as an Owner, you'll need to complete the project setup to enable all features.
                This section guides you through the setup process and required configurations.
              </p>
              
              <h3 id="basic-project-information">Basic project information</h3>
              <p>
                Fill in the essential project details:
              </p>
              <ol>
                <li><strong>Project reference number</strong> (required): A unique identifier for your project</li>
                <li><strong>Text number prefix</strong> (required): The prefix used for text reference numbers (default: TXT)</li>
                <li><strong>Project title</strong> (required): The name of your project</li>
                <li><strong>Project organiser</strong> (required): Your organization or the lead institution</li>
                <li><strong>Project start/end dates</strong> (required): The timeframe of your project</li>
                <li><strong>Project note</strong> (required): Descriptive information about the project's purpose and scope. Use the rich-text editor to format your description. Add lists, formatting, and other elements as needed.</li>
                <li><strong>Languages</strong>: Select the languages used in your project texts. At least one language is required. Type to search and select from the list of ISO languages. Add custom languages if needed.</li>
                <li><strong>Rights information</strong>:
                  <ul>
                    <li><strong>Copyright licensor</strong> (required): Person/organization authorized to grant usage permissions</li>
                    <li><strong>Usage licence</strong> (required): Type of license granted (e.g., CC BY 4.0)</li>
                    <li>You can select from common licenses or add custom ones</li>
                  </ul>
                </li>
                <li><strong>Text settings</strong>
                  <p>Configure how texts will be managed in your project:</p>
                  <ul>
                    <li><strong>Text structure</strong>:
                      <ul>
                        <li><strong>Hierarchical text</strong>: Enable if your project will have parent-child text relationships</li>
                        <li><strong>Track text status</strong>: Enable to assign and track the status of texts</li>
                        <li><strong>Text tags</strong>: Enable to add categorical tags to texts</li>
                        <li><strong>Do not include author names when exporting</strong>: Option to exclude author names when exporting</li>
                      </ul>
                    </li>
                    <li><strong>Status options</strong> (if status tracking enabled):
                      <ul>
                        <li>Define the statuses that can be assigned to texts (e.g., Draft, In Review, Approved)</li>
                        <li>Add, remove, or customize statuses as needed</li>
                      </ul>
                    </li>
                    <li><strong>Tag options</strong> (if tagging enabled):
                      <ul>
                        <li>Define tags that can be applied to texts</li>
                        <li>Add, remove, or customize tags as needed</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li><strong>Optional fields</strong>:
                  <ul>
                    <li><strong>Project type</strong>: Nature of the project (e.g., exhibition, workshop)</li>
                    <li><strong>Project venue</strong>: Location where the project takes place</li>
                    <li><strong>Credit line</strong>: Text acknowledging copyright holders/authors</li>
                    <li><strong>Text audience</strong>: Target audience for the texts</li>
                    <li><strong>Rights reference number</strong>: Identifier for the license</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="connecting-to-mds">Connecting to MDS</h3>
              <p>
                To fetch collection objects, you need to connect to the Museum Data Service. You can get an API token for any 
                <a href="https://museumdata.uk/object-search/" target="_blank">object search</a>. 
                At the bottom of the results page, there is a link saying 'Get an API token'. Follow that and 
                just fill in a short form that includes a declaration that you will respect the licensing terms 
                applied to the records you plan to use. We'd love to know how you plan to use the data, so please 
                give us a couple of lines that help us understand what users need from MDS. You can email 
                the API token to yourself along with the query, or just copy and paste it.
              </p>
              <ol>
                <li><strong>MDS API token</strong> (required): Paste your MDS API token in the field provided
                  <ul>
                    <li>This token gives access to your search result object records</li>
                    <li>The token should look like a long string of characters</li>
                    <li>Contact Museum Data Service if you need assistance with your token</li>
                  </ul>
                </li>
                <li>After completing all required fields, click "Save project setup" to enable the full functionality of the tool.</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
            </section>
            
            <section className="guide-section" id="working-with-objects">
              <h2>Working with objects</h2>
              <p>
                Once your project is set up, you can start working with collection objects from the Museum Data Service.
                This section explains how to browse, search, and select objects for your texts.
              </p>
              
              <h3 id="browsing-object-records">Browsing object records</h3>
              <p>
                Navigate to the Objects page:
              </p>
              <ol>
                <li>The main interface is split into two panels:
                  <ul>
                    <li>Left panel: Objects table for browsing records</li>
                    <li>Right panel: Text creation form</li>
                  </ul>
                </li>
                <li>You can adjust the layout using the display mode buttons in the top-right:
                  <ul>
                    <li><strong>Split view</strong>: Objects and text form side by side</li>
                    <li><strong>Horizontal view</strong>: Text form on top, objects below</li>
                    <li><strong>Focus view</strong>: Focus on either objects or text</li>
                  </ul>
                </li>
                <li>The objects table displays records with:
                  <ul>
                    <li>Object number</li>
                    <li>Object name</li>
                    <li>Brief description</li>
                    <li>View button</li>
                    <li>Selection checkbox</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="searching-and-filtering">Searching and filtering</h3>
              <p>
                To find specific objects:
              </p>
              <ol>
                <li>Use the search bar at the top of the page
                  <ul>
                    <li>Supports Boolean operators:
                      <ul>
                        <li>AND (default): Requires all terms to match</li>
                        <li>OR: Matches any of the terms</li>
                        <li>- (minus): Excludes terms with this prefix</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>Toggle display options:
                  <ul>
                    <li>Show collection: Display the object's source collection</li>
                    <li>Show title: Display object titles</li>
                    <li>Show selected only: Show only objects that you've selected</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="viewing-object-details">Viewing object details</h3>
              <p>
                To view details of an object:
              </p>
              <ol>
                <li>Click the "View" button for any record to open a pop-up window with the full record as displayed at the Museum Data Service website.</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="selecting-objects-for-texts">Selecting objects for texts</h3>
              <p>
                Select objects to associate with your texts:
              </p>
              <ol>
                <li>Use the checkboxes to select one or more objects</li>
                <li>The selected count appears under the display options</li>
                <li>Use "Select all" to select all visible objects, or "Clear" to deselect all</li>
                <li>Selected objects will be linked to the text you create in the right panel</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
            </section>
            
            <section className="guide-section" id="creating-and-managing-texts">
              <h2>Creating and managing texts</h2>
              <p>
                This section covers how to create, edit, and manage texts in the CT Text Tool, including how to use the rich-text editor, 
                link texts to objects, and organize texts in a hierarchical structure if needed.
              </p>
              
              <h3 id="creating-a-new-text">Creating a new text</h3>
              <p>
                To create a new text:
              </p>
              <ol>
                <li>Select one or more objects from the objects table (left panel)</li>
                <li>In the text form (right panel):
                  <ul>
                    <li>The selected objects are automatically linked to your text</li>
                    <li>Enter your text content using the rich-text editor</li>
                    <li>Fill in the required metadata fields</li>
                  </ul>
                </li>
                <li>Required fields:
                  <ul>
                    <li><strong>Text content</strong>: The main body of your text</li>
                    <li><strong>Author(s)</strong>: Select at least one author from the dropdown</li>
                    <li><strong>Language(s)</strong>: Select at least one language</li>
                  </ul>
                </li>
                <li>Optional fields (depending on project settings):
                  <ul>
                    <li><strong>Text tag</strong>: Categorize your text (if enabled)</li>
                    <li><strong>Status</strong>: Current workflow status (if enabled)</li>
                    <li><strong>Parent text</strong>: Link to a parent text for hierarchical structure (if enabled)</li>
                    <li><strong>Note</strong>: Additional information about the text</li>
                  </ul>
                </li>
                <li>Click "Save text" to create the text</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="using-the-rich-text-editor">Using the rich-text editor</h3>
              <p>
                The text editor provides formatting tools:
              </p>
              <ol>
                <li><strong>Toolbar options</strong>:
                  <ul>
                    <li>Text formatting (bold, italic, underline)</li>
                    <li>Lists (ordered and unordered)</li>
                    <li>Alignment</li>
                    <li>Headings</li>
                    <li>Links</li>
                    <li>And more</li>
                  </ul>
                </li>
                <li><strong>Special features</strong>:
                  <ul>
                    <li><strong>Full screen mode</strong>: Click "Full screen" for distraction-free editing</li>
                    <li><strong>HTML code view</strong>: Toggle between visual editor and HTML code</li>
                  </ul>
                </li>
                <li><strong>Text formatting best practices</strong>:
                  <ul>
                    <li>Use headings for clear structure</li>
                    <li>Keep paragraphs concise</li>
                    <li>Use lists for sequential information</li>
                    <li>Apply formatting consistently</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="linking-texts-to-objects">Linking texts to objects</h3>
              <p>
                Texts are linked to objects in several ways:
              </p>
              <ol>
                <li><strong>Direct selection</strong>: Objects selected in the table are automatically linked</li>
                <li><strong>Viewing linked objects</strong>: On the Texts page, a count of linked objects appears</li>
                <li><strong>Navigating to linked objects</strong>: Click the linked objects count to view the associated records</li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="creating-hierarchical-texts">Creating hierarchical texts</h3>
              <p>
                If hierarchical texts are enabled in your project:
              </p>
              <ol>
                <li><strong>Parent-child relationships</strong>:
                  <ul>
                    <li>When creating a text, you can select an existing text as the parent</li>
                    <li>This creates a hierarchical relationship between texts</li>
                  </ul>
                </li>
                <li><strong>Viewing hierarchies</strong>:
                  <ul>
                    <li>In the Texts page, toggle to "Hierarchical view" to see the text structure</li>
                    <li>Child texts appear indented beneath their parents</li>
                    <li>This helps organize related content (e.g., exhibition sections and subsections)</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="text-status-and-tags">Text status and tags</h3>
              <p>
                If enabled in your project:
              </p>
              <ol>
                <li><strong>Status tracking</strong>:
                  <ul>
                    <li>Set the current status of a text (e.g., Draft, In Review, Approved)</li>
                    <li>Update the status as the text progresses through the workflow</li>
                  </ul>
                </li>
                <li><strong>Tags</strong>:
                  <ul>
                    <li>Apply predefined tags to categorize texts</li>
                    <li>Tags help with organizing and filtering texts by topic or purpose</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
              
              <h3 id="bulk-editing-and-management">Bulk editing and management</h3>
              <p>
                On the Texts page, you can manage multiple texts:
              </p>
              <ol>
                <li><strong>Searching texts</strong>:
                  <ul>
                    <li>Use the search bar to find specific texts</li>
                    <li>Search by reference number, content, or author</li>
                  </ul>
                </li>
                <li><strong>Customizing columns</strong>:
                  <ul>
                    <li>Choose which metadata to display in the table columns</li>
                    <li>Options include authors, dates, status, tags, and more</li>
                  </ul>
                </li>
                <li><strong>Bulk actions</strong>:
                  <ul>
                    <li>Select multiple texts using checkboxes</li>
                    <li>Click bulk action buttons:
                      <ul>
                        <li><strong>Edit in table</strong>: Make changes directly in the table</li>
                        <li><strong>Bulk edit</strong>: Apply the same changes to multiple texts</li>
                        <li><strong>Delete</strong>: Remove selected texts</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li><strong>Table layout options</strong>:
                  <ul>
                    <li>Toggle between flat view and hierarchical view</li>
                    <li>Flat view shows all texts in a simple list</li>
                    <li>Hierarchical view shows parent-child relationships with indentation</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
            </section>
            
            <section className="guide-section" id="exporting-and-sharing">
              <h2>Exporting and sharing</h2>
              <p>
                This section explains how to export your texts in various formats and provides best practices for organizing and sharing your work.
              </p>
              
              <h3 id="available-export-formats">Available export formats</h3>
              <p>
                The CT Text Tool supports exporting texts in various formats:
              </p>
              <ol>
                <li><strong>CSV (Comma-Separated Values)</strong>:
                  <ul>
                    <li>Tabular format for data analysis</li>
                    <li>Suitable for importing into spreadsheets or databases</li>
                    <li>Includes all project metadata fields as machine readable JSON with base64 encoding</li>
                  </ul>
                </li>
                <li><strong>XML (Extensible Markup Language)</strong>:
                  <ul>
                    <li>Structured data format with complete metadata</li>
                    <li>Suitable for programmatic processing</li>
                    <li>Preserves hierarchical relationships</li>
                  </ul>
                </li>
                <li><strong>JSON (JavaScript Object Notation)</strong>:
                  <ul>
                    <li>Machine-readable data format</li>
                    <li>Ideal for web applications and APIs</li>
                    <li>Complete representation of text data and relationships</li>
                  </ul>
                </li>
                <li><strong>HTML (Hypertext Markup Language)</strong>:
                  <ul>
                    <li>Web-ready format with basic formatting</li>
                    <li>Can be viewed in any browser or opened in Word</li>
                    <li>Includes metadata in a readable format</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
             <h3 id="tips-for-best-practices">Tips for best practices</h3>
              <p>
                To get the most out of the CT Text Tool, consider these best practices:
              </p>
              <ol>
                <li><strong>Project organization</strong>:
                  <ul>
                    <li>Complete project setup thoroughly before adding texts</li>
                    <li>Use consistent naming conventions for texts</li>
                    <li>Set up text statuses that match your workflow</li>
                  </ul>
                </li>
                <li><strong>Collaborative workflow</strong>:
                  <ul>
                    <li>Assign clear roles to team members</li>
                    <li>Use status tracking to monitor progress</li>
                    <li>Establish guidelines for text formatting and style</li>
                  </ul>
                </li>
                <li><strong>Text creation</strong>:
                  <ul>
                    <li>Write directly in the tool to maintain links to objects</li>
                    <li>Use the hierarchical structure for complex content</li>
                    <li>Add sufficient metadata for future discoverability</li>
                  </ul>
                </li>
                <li><strong>Exporting strategy</strong>:
                  <ul>
                    <li>Choose appropriate formats for your needs</li>
                    <li>Export at key milestones for backup purposes</li>
                    <li>Archive completed projects to preserve the final state</li>
                  </ul>
                </li>
              </ol>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
            </section>
            
            <section className="guide-section" id="getting-help">
              <h2>Getting help</h2>
              <p><strong>Getting Help</strong></p>
              <p>If you need assistance using the CT Text Tool:</p>
              <ul>
                <li>For questions about using the tool: Contact Collections Use Officer, Katie Brown at katie@collectionstrust.org.uk</li>
                <li>For MDS data sharing questions: See the Museum Data Service website or contact Museum Data Manager, Arran Rees at support@museumdata.uk</li>
              </ul>
              <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contents'); }}>Back to contents</a></p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserGuide; 
             
