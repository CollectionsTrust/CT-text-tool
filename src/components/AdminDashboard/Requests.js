import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const Requests = () => {
  const [projectRequests, setProjectRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const { user } = useAuth();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch project requests
      const projectRequestsRef = collection(db, "projectRequests");
      const projectQuery = query(
        projectRequestsRef,
        where("status", "==", "pending")
      );
      const projectSnapshot = await getDocs(projectQuery);

      const projectRequestsData = [];
      projectSnapshot.forEach((doc) => {
        projectRequestsData.push({ id: doc.id, ...doc.data() });
      });

      setProjectRequests(projectRequestsData);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleApproveProject = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError("");
      setSuccessMessage("");

      const request = projectRequests.find((r) => r.id === requestId);

      if (!request) throw new Error("Request not found");

      // First create the project with the correct title from the project request
      const projectRef = await addDoc(collection(db, "projects"), {
        title: request.projectTitle || `${request.organization} Project`,
        description: request.projectDescription,
        owner: request.email,
        status: "active",
        createdAt: serverTimestamp(),
        createdBy: user.email,
      });

      // Check if user already exists in Firestore
      const projectUserId = request.email.toLowerCase();
      const userDocRef = doc(db, "projectUsers", projectUserId);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        const projectUserRef = doc(db, "projectUsers", projectUserId);

        await setDoc(projectUserRef, {
          name: request.name,
          organization: request.organization,
          createdAt: serverTimestamp(),
          status: "approved",
          approvedBy: user.email,
          projectRoles: {
            [projectRef.id]: "owner",
          },
        });
      } else {
        // User already exists, update their projectRoles
        const userData = userSnapshot.data();
        const currentProjectRoles = userData.projectRoles || {};

        await updateDoc(doc(db, "projectUsers", projectUserId), {
          projectRoles: {
            ...currentProjectRoles,
            [projectRef.id]: "owner",
          },
          name: userData.name || request.name,
          organization: userData.organization || request.organization,
        });
      }

      // Update the project request record
      await updateDoc(doc(db, "projectRequests", requestId), {
        status: "approved",
        processedAt: serverTimestamp(),
        projectId: projectRef.id,
        projectUserId: projectUserId,
        approvedBy: user.email,
      });

      // Generate a mailto link with pre-populated content for the admin to send
      const emailSubject = encodeURIComponent(
        `Your CT Text Tool project "${
          request.projectTitle || "Project Request"
        }" has been approved`
      );
      const accessMessage = userSnapshot.exists()
        ? `Visit ${window.location.origin}/dashboard to view the project.`
        : `Visit ${window.location.origin}/signup to create your account.`;
      const emailBody = encodeURIComponent(
        `Hello ${request.name},\n\n` +
          `Your project request for "${
            request.projectTitle || "the CT Text Tool"
          }" has been approved.\n\n` +
          `Your project "${
            request.projectTitle || "Project"
          }" is now set up and ready for you to begin working on.\n\n` +
          `${accessMessage} \n\n` +
          `For any questions, please contact us.\n\n` +
          `Thank you,\n` +
          `Collections Trust Team`
      );

      const mailtoLink = `mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, "_blank");
    } catch (err) {
      console.error("Error approving project request:", err);
      setError(`Failed to approve request: ${err.message}`);
    } finally {
      setProjectRequests((prev) => prev.filter((r) => r.id !== requestId));
      setProcessingRequestId(null);
    }
  };

  const handleRejectProject = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError("");
      setSuccessMessage("");

      const request = projectRequests.find((r) => r.id === requestId);
      await updateDoc(doc(db, "projectRequests", requestId), {
        status: "rejected",
        processedAt: serverTimestamp(),
        rejectedBy: user.email,
      });

      // Generate a mailto link for rejection email
      const emailSubject = encodeURIComponent(
        `Regarding your project request: ${
          request.projectTitle || "Project Request"
        }`
      );
      const emailBody = encodeURIComponent(
        `Hello ${request.name},\n\n` +
          `We've reviewed your project request for "${
            request.projectTitle || "Project"
          }" and we regret to inform you that we are unable to approve it at this time.\n\n` +
          `If you have any questions or would like to discuss this further, please feel free to reply to this email.\n\n` +
          `Thank you for your interest in the CT Text Tool.\n\n` +
          `Regards,\n` +
          `Collections Trust Team`
      );

      const mailtoLink = `mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, "_blank");

      setSuccessMessage(
        `Project request for ${request.name} has been rejected. A draft email has been opened in your email client.`
      );
      setProjectRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Error rejecting project request:", err);
      setError(`Failed to reject request: ${err.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="admin-section requests">
      <div className="admin-nav-tabs">
        <Link to="/admin#requests" className="admin-nav-tab active">
          Requests
        </Link>
        <Link to="/admin#projects" className="admin-nav-tab">
          Manage projects
        </Link>
        <Link to="/admin#users" className="admin-nav-tab">
          Manage users
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {/* Project Requests Section */}
      <h2 className="section-title">Project requests</h2>
      {projectRequests.length === 0 ? (
        <div className="no-content-message">
          There are no pending project requests at this time.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Request date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.email}</td>
                  <td>{request.organization}</td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td className="description-cell">
                    <div className="truncated-text">
                      {request.projectDescription}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="primary-btn approve-btn"
                      onClick={() => handleApproveProject(request.id)}
                      disabled={processingRequestId === request.id}
                    >
                      {processingRequestId === request.id
                        ? "Processing..."
                        : "Approve"}
                    </button>
                    <button
                      className="secondary-btn reject-btn"
                      onClick={() => handleRejectProject(request.id)}
                      disabled={processingRequestId === request.id}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Requests;
