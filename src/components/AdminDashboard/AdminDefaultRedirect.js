import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

function AdminDefaultRedirect() {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const requestsRef = collection(db, "projectRequests");
      const q = query(requestsRef, where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const hasPendingRequests = !querySnapshot.empty;

      // Check for pending project requests and redirect accordingly
      if (hasPendingRequests) {
        setRedirectTo("/admin/requests");
      } else {
        setRedirectTo("/admin/projects");
      }

      setLoading(false);
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Navigate to={redirectTo} replace />;
}

export default AdminDefaultRedirect;
