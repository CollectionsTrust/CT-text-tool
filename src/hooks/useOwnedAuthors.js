import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Returns all authors assigned to a project the current user owns
const useOwnedAuthors = () => {
  const [ownedAuthors, setOwnedAuthors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchAuthors = async () => {
      try {
        setLoading(true);

        const currentUserRef = doc(
          db,
          "projectUsers",
          user.email.toLowerCase()
        );
        const currentUserSnapshot = await getDoc(currentUserRef);
        const currentUserData = currentUserSnapshot.data();
        const ownedProjectIds = Object.entries(currentUserData.projectRoles)
          .filter(([_, value]) => value === "owner")
          .map(([key]) => key);

        // Get all users
        const usersRef = collection(db, "projectUsers");
        const userSnapshot = await getDocs(usersRef);
        const projectAuthors = [];

        userSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const projectRoles = userData.projectRoles || {};

          // Loop through the projects this user has roles in
          for (const [projectId, role] of Object.entries(projectRoles)) {
            // Check if the project is one of the owned projects AND role is author
            if (ownedProjectIds.includes(projectId) && role === "author") {
              projectAuthors.push({
                id: userDoc.id,
                name: userData.name || "",
              });
            }
          }
        });

        setOwnedAuthors(projectAuthors);
      } catch (err) {
        setError("Failed to load authors.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [user]);

  return { ownedAuthors, loading, error };
};

export default useOwnedAuthors;
