const TokenField = ({ token, setToken, error }) => {
  return (
    <div className="form-group">
      <label htmlFor="token">
        MDS API token:
        <span className="required-indicator">*</span>
        <span className="tooltip-icon" title="The API token needed to access the Museum Data Service. This is required to fetch object records.">ⓘ</span>
      </label>
      <textarea
        id="token"
        className="token-input"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste your MDS API token here..."
        rows={6}
        required
      />
      <p className="token-help">Your token should look similar to: 9AyjhGNQQFkSCT5QtkaPdQ7-Cz7onxXq231/T8F-QRk1xVnplfxcvDRgm081xpDxKINpIz0zW-vnLXs...</p>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default TokenField;
