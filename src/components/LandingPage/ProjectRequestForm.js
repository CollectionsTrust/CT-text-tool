import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";

const ProjectRequestForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    projectTitle: "",
    projectDescription: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTermsCheckbox = (e) => {
    setAcceptTerms(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      setErrorMessage(
        "You must accept the terms and conditions to submit your request."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await addDoc(collection(db, "projectRequests"), {
        ...formData,
        status: "pending",
        createdAt: Timestamp.now(),
        acceptedTerms: true,
      });
      setSuccessMessage("Your request has been submitted successfully.");
      setFormData({
        name: "",
        email: "",
        organization: "",
        projectTitle: "",
        projectDescription: "",
      });
      setAcceptTerms(false);
    } catch (error) {
      console.error("Error submitting request:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      window.localStorage.setItem("emailForSignIn", formData.email);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="landing-form">
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="form-group">
          <label htmlFor="name">Your name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="request-email">Email address</label>
          <input
            type="email"
            id="request-email"
            name="email"
            autoComplete="username"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organization">Your organization</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectTitle">Proposed project title</label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={formData.projectTitle}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Brief project description</label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            required
            className="form-textarea"
            rows="4"
          />
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={handleTermsCheckbox}
              required
              className="checkbox-input"
            />
            <label htmlFor="acceptTerms" className="checkbox-label">
              I accept the{" "}
              <Link to="/terms-and-conditions" className="terms-link">
                CT Text Tool terms and conditions
              </Link>
            </label>
          </div>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={submitting || !acceptTerms}
        >
          {submitting ? "Submitting..." : "Submit request"}
        </button>
      </form>
    </>
  );
};

export default ProjectRequestForm;
