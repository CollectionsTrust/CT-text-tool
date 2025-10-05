import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import usePageTitle from "../../hooks/usePageTitle";


const TermsPage = () => {
  const navigate = useNavigate();
  usePageTitle("Terms and Conditions");

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleCloseTerms();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseTerms();
    }
  };

  const handleCloseTerms = () => {
    // Go back one step in the history to the page a user was on before
    // they visited the user guide page
    navigate(-1);
  };

  return (
    <div className="terms-overlay" onClick={handleBackdropClick}>
      <div className="terms-modal">
        <div className="terms-header">
          <h2 className="terms-title">CT Text Tool Terms and Conditions</h2>
          <button
            onClick={handleCloseTerms}
            className="terms-close-btn"
            aria-label="Close terms and conditions"
          >
            ×
          </button>
        </div>
        <div className="terms-content-wrapper">
          <div className="terms-content">
            <div className="terms">
              <h1 className="terms-h1">CT Text Tool Terms and Conditions</h1>
              <p>
                <strong>Last updated:</strong> March 2024
              </p>
              <h2 className="terms-h2">1. Acceptance of Terms</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <div className="info-box">
                <strong>Important:</strong> By using the CT Text Tool, you
                acknowledge that you have read, understood, and agree to be
                bound by these terms and conditions.
              </div>
              <h2 className="terms-h2">2. Service Description</h2>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
              </p>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
              </p>
              <h3 className="terms-h3">2.1 Museum Data Service Integration</h3>
              <p>
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem.
              </p>
              <h3 className="terms-h3">2.2 Text Creation and Management</h3>
              <p>
                Ut enim ad minima veniam, quis nostrum exercitationem ullam
                corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                consequatur. Quis autem vel eum iure reprehenderit qui in ea
                voluptate velit esse quam nihil molestiae consequatur.
              </p>
              <h2 className="terms-h2">3. User Responsibilities</h2>
              <p>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate
                non provident.
              </p>
              <ul>
                <li>
                  Similique sunt in culpa qui officia deserunt mollitia animi
                </li>
                <li>Id est laborum et dolorum fuga et harum quidem rerum</li>
                <li>Facilis est et expedita distinctio nam libero tempore</li>
                <li>
                  Cum soluta nobis est eligendi optio cumque nihil impedit
                </li>
              </ul>
              <h3 className="terms-h3">3.1 Account Security</h3>
              <p>
                Temporibus autem quibusdam et aut officiis debitis aut rerum
                necessitatibus saepe eveniet ut et voluptates repudiandae sint
                et molestiae non recusandae.
              </p>
              <div className="highlight">
                <strong>Security Notice:</strong> You are responsible for
                maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
              </div>
              <h3 className="terms-h3">3.2 Content Guidelines</h3>
              <p>
                Itaque earum rerum hic tenetur a sapiente delectus, ut aut
                reiciendis voluptatibus maiores alias consequatur aut
                perferendis doloribus asperiores repellat.
              </p>
              <h2 className="terms-h2">4. Data Privacy and Protection</h2>
              <p>
                Nam libero tempore, cum soluta nobis est eligendi optio cumque
                nihil impedit quo minus id quod maxime placeat facere possimus,
                omnis voluptas assumenda est, omnis dolor repellendus.
              </p>
              <h3 className="terms-h3">4.1 Information Collection</h3>
              <p>
                Temporibus autem quibusdam et aut officiis debitis aut rerum
                necessitatibus saepe eveniet ut et voluptates repudiandae sint
                et molestiae non recusandae.
              </p>
              <h3 className="terms-h3">4.2 Data Usage</h3>
              <p>
                Et harum quidem rerum facilis est et expedita distinctio. Nam
                libero tempore, cum soluta nobis est eligendi optio cumque nihil
                impedit quo minus id quod maxime placeat facere possimus.
              </p>
              <h2 className="terms-h2">5. Intellectual Property</h2>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
              </p>
              <h3 className="terms-h3">5.1 User Content</h3>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
              </p>
              <h3 className="terms-h3">5.2 Service Content</h3>
              <p>
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem.
              </p>
              <h2 className="terms-h2">6. Limitation of Liability</h2>
              <p>
                Ut enim ad minima veniam, quis nostrum exercitationem ullam
                corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                consequatur.
              </p>
              <div className="info-box">
                <strong>Disclaimer:</strong> The service is provided "as is"
                without warranties of any kind, either express or implied.
              </div>
              <h2 className="terms-h2">7. Changes to Terms</h2>
              <p>
                Quis autem vel eum iure reprehenderit qui in ea voluptate velit
                esse quam nihil molestiae consequatur, vel illum qui dolorem eum
                fugiat quo voluptas nulla pariatur.
              </p>
              <h2 className="terms-h2">8. Contact Information</h2>
              <p>
                For questions about these terms and conditions, please contact:
              </p>
              <ul>
                <li>
                  <strong>Collections Trust</strong>
                </li>
                <li>
                  <strong>Email:</strong> katie@collectionstrust.org.uk
                </li>
                <li>
                  <strong>Website:</strong> https://collectionstrust.org.uk
                </li>
              </ul>
              <p>
                <em>
                  These terms and conditions are effective as of the date last
                  updated above.
                </em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
