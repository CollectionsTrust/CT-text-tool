// src/components/UserDashboard/index.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import ProjectsList from './ProjectsList';
import AuthorManagement from './AuthorManagement';
import MainHeader from '../navigation/MainHeader';
import './UserDashboard.css';

const UserDashboard = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const navigate = useNavigate();
  const location = useLocation();

  // Set active tab based on URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['projects', 'authors'].includes(hash)) {
      setActiveTab(hash);
    } else {
      // Default to projects tab if no hash
      setActiveTab('projects');
    }
  }, [location]);

  useEffect(() => {
    if (!currentUser || authLoading) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');
        console.log("Fetching projects for user:", currentUser?.email);

        // Step 1: Find the user document in Firestore
        const usersRef = collection(db, 'projectUsers');
        const userQuery = query(usersRef, where('email', '==', currentUser.email));
        const userSnapshot = await getDocs(userQuery);
        
        let projectsData = [];
        
        // Step 2: Get projects where user is the owner (always check this first)
        const projectsRef = collection(db, 'projects');
        const ownerQuery = query(projectsRef, where('owner', '==', currentUser.email));
        const ownerSnapshot = await getDocs(ownerQuery);
        
        ownerSnapshot.docs.forEach(doc => {
          projectsData.push({
            id: doc.id,
            ...doc.data(),
            userRole: 'Owner',
            authorCount: doc.data().authors?.length || 0
          });
        });
        
        console.log("Found", ownerSnapshot.size, "projects where user is owner");
        
        // Step 3: Check user's projectRoles for additional projects
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const projectRoles = userData.projectRoles || {};
          
          console.log("User document found with projectRoles:", projectRoles);
          
          // Get project IDs where user has roles, excluding those already fetched as owner
          const projectIds = Object.keys(projectRoles).filter(projectId => 
            !projectsData.some(project => project.id === projectId)
          );
          
          if (projectIds.length > 0) {
            console.log("Found additional project roles:", projectIds.length);
            
            // Fetch projects in batches (Firestore limit is 10 for 'in' queries)
            const batchSize = 10;
            
            for (let i = 0; i < projectIds.length; i += batchSize) {
              const batch = projectIds.slice(i, i + batchSize);
              
              const batchQuery = query(projectsRef, where('__name__', 'in', batch));
              const batchSnapshot = await getDocs(batchQuery);
              
              batchSnapshot.docs.forEach(doc => {
                const projectId = doc.id;
                const projectData = doc.data();
                const userRole = projectRoles[projectId];
                
                // Only add the project if it's not already in our list
                if (!projectsData.some(p => p.id === projectId)) {
                  projectsData.push({
                    id: projectId,
                    ...projectData,
                    userRole: userRole.charAt(0).toUpperCase() + userRole.slice(1), // Capitalize role
                    authorCount: projectData.authors?.length || 0
                  });
                }
              });
            }
          }
        } else {
          console.log("No user document found in Firestore!");
        }
        
        // Step 4: Sort projects: active first, then by creation date
        // NOTE: We still sort with archived status even though we don't show archived projects in the UI
        projectsData.sort((a, b) => {
          const statusCompare = (a.status === 'archived') - (b.status === 'archived');
          if (statusCompare !== 0) return statusCompare;
          return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
        });
        
        console.log("Final projects loaded:", projectsData.length);
        setProjects(projectsData);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load your projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser, userRole, authLoading]);

  return (
    <>
      <MainHeader />
      <div className="container">
        <div className="user-dashboard">
          <div className="user-header">
            <div className="user-info">
              Logged in as: {currentUser?.email}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="user-nav-tabs">
            <a 
              href="/dashboard#projects" 
              className={`user-nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={(e) => {
                if (activeTab === 'projects') e.preventDefault();
              }}
            >
              Manage projects
            </a>
            {(userRole === 'admin' || userRole === 'owner') && (
              <a 
                href="/dashboard#authors" 
                className={`user-nav-tab ${activeTab === 'authors' ? 'active' : ''}`}
                onClick={(e) => {
                  if (activeTab === 'authors') e.preventDefault();
                }}
              >
                Manage authors
              </a>
            )}
          </div>

          <div className="user-content">
            {loading ? (
              <div className="loading">Loading your data...</div>
            ) : (
              <>
                {activeTab === 'projects' && (
                  <ProjectsList 
                    projects={projects}
                    setProjects={setProjects}
                    error={error}
                    successMessage={successMessage}
                    setSuccessMessage={setSuccessMessage}
                    currentUser={currentUser}
                  />
                )}
                {activeTab === 'authors' && (userRole === 'admin' || userRole === 'owner') && (
                  <AuthorManagement />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
