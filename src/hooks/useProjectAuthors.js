import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Returns the authors for a project
const useProjectAuthors = (projectID) => {
  const [authors, setAuthors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);

        const usersRef = collection(db, "projectUsers");
        const userSnapshot = await getDocs(usersRef);
        const projectOwners = [];

        userSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const projectRoles = userData.projectRoles || {};

          // Check if user is assigned to this project
          if (projectRoles[projectID] && projectRoles[projectID] === "author") {
            projectOwners.push({
              id: userDoc.id,
              name: userData.name || "",
              organization: userData.organization || "",
            });
          }
        });

        setAuthors(projectOwners);
      } catch (err) {
        setError("Failed to load authors.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [projectID, user.email]);

  return { authors, loading, error };
};

export default useProjectAuthors;
