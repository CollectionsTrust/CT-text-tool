import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import useProjectAuthors from "../hooks/useProjectAuthors";

export const useProject = (projectID) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authors } = useProjectAuthors(projectID);

  useEffect(() => {
    if (!authors) return;

    const fetchProject = async () => {
      try {
        const projectRef = doc(db, "projects", projectID);
        const docSnap = await getDoc(projectRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject({
            title: data.title || "Project",
            reference: data.projectReferenceNumber || "",
            owner: data.owner || "",
            mdsApiToken: data.mdsApiToken,
            authors,
          });
        } else {
          setProject({});
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectID, authors]);

  return { project, loading, error };
};
