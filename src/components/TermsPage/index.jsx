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
          <h2 className="terms-title">CT Text Tool terms and conditions</h2>
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
              <h1 className="terms-h1">CT Text Tool terms and conditions</h1>
              <p>
                <strong>Last updated:</strong> November 2025
              </p>
              <h2 className="terms-h2">1. Acceptance of terms</h2>
              <p>
                The following terms and conditions (the "Terms") shall govern
                and be the binding contract between{" "}
                <a href="https://texts.collectionstrust.org.uk">
                  https://texts.collectionstrust.org.uk
                </a>{" "}
                (the "Site") and its users. The website owner,{" "}
                <strong>Collections Trust</strong>, owns and operates the Site.
              </p>
              <div className="info-box">
                <strong>Important:</strong> By using the CT Text Tool, you
                acknowledge that you have read, understood, and agree to be
                bound by these terms and conditions.
              </div>
              <h2 className="terms-h2">2. Service description</h2>
              <h3 className="terms-h3">2.1 Museum Data Service integration</h3>
              <p>
                The Tool is intended for use by museums and other related
                institutions that have object records in the Museum Data Service
                (MDS). By using this Tool, you confirm that you are authorized
                to represent such an institution and that you have the necessary
                rights and permissions to use the Tool for the intended purpose.
              </p>
              <h3 className="terms-h3">2.2 Text creation and management</h3>
              <p>
                Users may input, edit, and manage museum-related text entries.
                These entries may be exported, shared, or integrated into other
                Collections Trust systems, in accordance with these Terms and
                any applicable privacy or licensing agreements.
              </p>
              <h2 className="terms-h2">3. User responsibilities</h2>
              <h3 className="terms-h3">3.1 Account security</h3>
              <p>
                Users are responsible for maintaining the confidentiality of
                their login credentials. Unauthorized access or misuse of an
                account must be reported immediately. Collections Trust is not
                liable for any loss or damage arising from a failure to protect
                account details.
              </p>
              <h3 className="terms-h3">3.2 Content guidelines</h3>
              <p>
                Users (including individuals granted access by contributing
                institutions) agree not to upload content that:
              </p>
              <ul>
                <li>Infringes third-party intellectual property rights;</li>
                <li>Violates confidentiality agreements;</li>
                <li>
                  Breaches ethical or legal standards associated with museum or
                  research practices.
                </li>
              </ul>
              <p>
                Contributing institutions are responsible for managing user
                permissions and ensuring that any individuals they authorise are
                aware of and comply with these Terms.
              </p>
              <p>
                Collections Trust reserves the right to remove any content that
                violates these guidelines or that it deems inappropriate or
                harmful.
              </p>

              <h2 className="terms-h2">4. Data privacy and protection</h2>
              <h3 className="terms-h3">4.1 Information collection</h3>
              <p>
                The Site may collect and store user-submitted data, account
                information, and usage metadata for the purposes of delivering,
                improving, and maintaining the service.
              </p>
              <h3 className="terms-h3">4.2 Data usage</h3>
              <p>
                Collections Trust will only use personal and institutional data
                in accordance with its{" "}
                <a href="https://collectionstrust.org.uk/what-we-do/statutory-information">
                  Privacy Policy
                </a>
                . Data may be used to support analytics, diagnostics, and
                service development, but will not be sold or shared with third
                parties without user consent, unless required by law.
              </p>
              <h2 className="terms-h2">5. Intellectual property</h2>
              <h3 className="terms-h3">5.1 Ownership</h3>
              <p>
                All content submitted by users, including but not limited to
                text entries, comments, annotations, transcriptions, or
                interpretive material linked to museum collections (“User
                Content”), remains the intellectual property of the original
                contributor or their institution. Nothing in these Terms
                transfers ownership of such content to Collections Trust.
              </p>
              <h3 className="terms-h3">5.2 Licensing and access controls</h3>
              <p>
                We encourage open licensing of User Content. However,
                contributing institutions may apply specific licensing terms or
                restrict access to certain content.
              </p>
              <p> When submitting content, users must:</p>
              <ul>
                <li>Specify the applicable licence or access restriction;</li>
                <li>Ensure any content shared complies with these terms;</li>
                <li>
                  Honour any third-party rights, including copyright, privacy,
                  and data protection obligations.
                </li>
              </ul>
              <h3 className="terms-h3">
                5.3 Ownership and open source licensing
              </h3>
              <p>
                The core software that powers this platform (“the Tool”) is
                developed and maintained by Collections Trust and is made
                available under an open source MIT licence (Modified for
                non-commercial use).{" "}
              </p>
              <p>MIT License (Modified for non-commercial use)</p>
              <p>Copyright (c) 2025 Collections Trust</p>
              <p>
                Permission is hereby granted, free of charge, to any person
                obtaining a copy of this software and associated documentation
                files (the "Software"), to use, copy, modify, merge, publish,
                distribute, copies of the Software for non-commercial purposes
                only, subject to the following conditions:
              </p>
              <ol>
                <li>
                  <p>Non-commercial use only</p>
                  <p>
                    The Software may only be used for non-commercial purposes.
                  </p>
                  <p>
                    Commercial use—including but not limited to selling,
                    licensing, or using the Software as part of a commercial
                    product or service—is strictly prohibited without prior
                    written permission from the copyright holder.
                  </p>
                </li>
                <li>
                  <p>Commercial licensing</p>
                  <p>
                    For commercial use, please contact
                    office@collectionstrust.org.uk to obtain a separate
                    commercial license.
                  </p>
                </li>
                <li>
                  <p>Attribution</p>
                  <p>
                    The above copyright notice and this permission notice shall
                    be included in all copies or substantial portions of the
                    Software.
                  </p>
                  <p>
                    The source code and associated documentation are available
                    at{" "}
                    <a href="https://github.com/CollectionsTrust/CT-text-tool.git">
                      https://github.com/CollectionsTrust/CT-text-tool.git
                    </a>
                  </p>
                </li>
              </ol>
              <h3 className="terms-h3">5.4 Scope of the licence</h3>
              <p>
                While the tool’s source code is open-licensed, this does not
                automatically apply to:
              </p>
              <ul>
                <li>Content submitted by users (see Section 5.1);</li>
                <li>
                  Content hosted on the platform that has its own licensing
                  terms;
                </li>
                <li>
                  System-generated content derived from user activity or data.
                </li>
              </ul>
              <p>
                You must respect any separate intellectual property or licence
                terms that apply to these other types of content.
              </p>
              <h3 className="terms-h3">
                5.5 Documentation and support material
              </h3>
              <p>
                Any documentation, training materials, or API specifications
                provided with the tool are licensed under Creative Commons
                Attribution 4.0 (CC-BY 4.0), unless otherwise stated. Where
                different licences apply, they will be clearly indicated.
              </p>
              <p>
                We encourage reuse and adaptation of these materials in line
                with our goal to support open, interoperable collections
                infrastructure.
              </p>
              <h3 className="terms-h3">5.6 Platform interface and branding</h3>
              <p>
                The design of the user interface (UI), branding, and other
                visual elements of the hosted platform may be protected by
                copyright or trademark law and are not covered under the open
                source software licence. These may not be used without
                permission, except as permitted by law.
              </p>
              <h3 className="terms-h3">5.7 Aggregated and derived content</h3>
              <p>
                The platform may generate aggregated or derived content (e.g.
                indexes, usage statistics, normalised data structures) from
                user-submitted information. Collections Trust retains rights to
                this system-generated content but will make anonymised or
                summary outputs available under open licences wherever possible,
                in alignment with our open data principles.
              </p>
              <h2 className="terms-h2">6. Limitation of liability</h2>
              <p>
                The service is provided "as is" without warranties of any kind,
                either express or implied. Collections Trust makes no guarantee
                of uninterrupted access, completeness, accuracy, or fitness for
                a particular purpose. To the extent permitted by law,
                Collections Trust is not liable for any direct, indirect, or
                consequential damages arising from use of the Site.
              </p>
              <h2 className="terms-h2">7. Changes to terms</h2>
              <p>
                Collections Trust reserves the right to modify these Terms at
                any time. Updates will be posted on the Site with a revised
                effective date. Continued use of the CT Text Tool following any
                changes constitutes acceptance of the revised Terms.
              </p>
              <h2 className="terms-h2">8. Contact information</h2>
              <p>
                For questions about these terms and conditions, please contact:
              </p>
              <ul>
                <li>
                  <strong>Collections Trust</strong>
                </li>
                <li>
                  <strong>Email:</strong> office@Collectionstrust.org.uk
                </li>
                <li>
                  <strong>Website:</strong>{" "}
                  <a href="https://collectionstrust.org.uk">
                    https://collectionstrust.org.uk
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
