import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Returns the owner info of a project
const useProjectOwners = (projectID) => {
  const [owners, setOwners] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);

        const usersRef = collection(db, "projectUsers");
        const userSnapshot = await getDocs(usersRef);
        const projectOwners = [];

        userSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const projectRoles = userData.projectRoles || {};

          // Check if user is assigned to this project
          if (projectRoles[projectID] && projectRoles[projectID] === "owner") {
            projectOwners.push({
              id: userDoc.id,
              name: userData.name || userData.email,
            });
          }
        });

        setOwners(projectOwners);
      } catch (err) {
        setError("Failed to load authors.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, [projectID, user.email]);

  return { owners, loading, error };
};

export default useProjectOwners;
