import useOwnedAuthors from "../../hooks/useOwnedAuthors";

const AuthorsSelector = ({
  selectedAuthors,
  onAddAuthor,
  onRemoveAuthor,
  isAdmin,
}) => {
  const { ownedAuthors } = useOwnedAuthors();

  if (!ownedAuthors || !selectedAuthors) {
    return;
  }

  const selectedAuthorsIds = selectedAuthors.map((val) => val.id);

  return (
    <div className="form-group">
      <select
        id="authors"
        onChange={(e) =>
          onAddAuthor(ownedAuthors.find((a) => a.id === e.target.value))
        }
        className="form-select"
        defaultValue=""
        disabled={isAdmin}
      >
        <option value="">Select author</option>
        {ownedAuthors
          .filter((author) => !selectedAuthorsIds.includes(author.id))
          .map((author) => (
            <option key={author.id} value={author.id}>
              {author.name} - {author.id}
            </option>
          ))}
      </select>
      {selectedAuthors.length > 0 && (
        <div className="selected-items-container">
          <ul className="selected-items-list">
            {selectedAuthors.map((author) => (
              <li
                key={author.id}
                className={`${
                  author.role === "owner"
                    ? "selected-item-disabled"
                    : "selected-item"
                }`}
              >
                <span>
                  {author.name} {author.role === "owner" && "(Owner)"}
                </span>
                {author.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => onRemoveAuthor(author.id)}
                    className="remove-item-btn"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuthorsSelector;
