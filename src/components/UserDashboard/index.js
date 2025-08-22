import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import ProjectsList from "./ProjectsList";
import AuthorManagement from "./AuthorManagement";
import MainHeader from "../navigation/MainHeader";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user, userRoles, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("projects");
  const navigate = useNavigate();
  const location = useLocation();
  const userIsOwnerOfAProject = Object.values(userRoles?.projectRoles).includes(
    "owner"
  );

  // Set active tab based on URL hash
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (["projects", "authors"].includes(hash)) {
      setActiveTab(hash);
    } else {
      // Default to projects tab if no hash
      setActiveTab("projects");
    }
  }, [location]);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        // Step 1: Find the user document in Firestore
        const userDocRef = doc(db, "projectUsers", user.email);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : null;

        const projectRoles = userData.projectRoles || {};
        const userOwns = Object.fromEntries(
          Object.entries(projectRoles).filter(
            ([key, value]) => value === "owner" || value === "author"
          )
        );
        const userProjectIds = Object.keys(userOwns);

        // Step 2: Get projects where user is the owner (always check this first)
        const docs = await Promise.all(
          userProjectIds.map((id) => getDoc(doc(db, "projects", id)))
        );

        const projectsData = await Promise.all(
          docs
            .filter((docSnap) => docSnap.exists())
            .map(async (docSnap) => {
              const proj = {
                id: docSnap.id,
                ...docSnap.data(),
                userRole: projectRoles[docSnap.id],
              };

              const q = query(
                collection(db, "projectUsers"),
                where(`projectRoles.${proj.id}`, "==", "author")
              );
              const snapshot = await getDocs(q);

              return {
                ...proj,
                authorCount: snapshot.size, // number of matching docs
              };
            })
        );

        // Step 3: Sort projects: active first, then by creation date
        // NOTE: We still sort with archived status even though we don't show archived projects in the UI
        projectsData.sort((a, b) => {
          const statusCompare =
            (a.status === "archived") - (b.status === "archived");
          if (statusCompare !== 0) return statusCompare;
          return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
        });

        setProjects(projectsData);
      } catch (err) {
        console.error("Error loading projects:", err);
        setError("Failed to load your projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, userRoles, authLoading]);

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  return (
    <>
      <MainHeader />
      <div className="container">
        <div className="user-dashboard">
          <div className="user-header">
            <div className="user-info">
              <span>Logged in as: {user?.email}</span>
              <button
                onClick={handleChangePassword}
                className="secondary-btn change-password-btn"
              >
                Change password
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          {(userRoles.appRole === "admin" || userIsOwnerOfAProject) && (
            <div className="user-nav-tabs">
              {userIsOwnerOfAProject && (
                <a
                  href="/dashboard#projects"
                  className={`user-nav-tab ${
                    activeTab === "projects" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    if (activeTab === "projects") e.preventDefault();
                  }}
                >
                  Manage projects
                </a>
              )}
              {(userRoles.appRole === "admin" || userIsOwnerOfAProject) && (
                <a
                  href="/dashboard#authors"
                  className={`user-nav-tab ${
                    activeTab === "authors" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    if (activeTab === "authors") e.preventDefault();
                  }}
                >
                  Manage authors
                </a>
              )}
            </div>
          )}

          <div className="user-content">
            {loading ? (
              <div className="loading">Loading your data...</div>
            ) : (
              <>
                {activeTab === "projects" && (
                  <ProjectsList
                    projects={projects}
                    setProjects={setProjects}
                    error={error}
                    successMessage={successMessage}
                    setSuccessMessage={setSuccessMessage}
                  />
                )}
                {activeTab === "authors" &&
                  (userRoles.appRole === "admin" || userIsOwnerOfAProject) && (
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
