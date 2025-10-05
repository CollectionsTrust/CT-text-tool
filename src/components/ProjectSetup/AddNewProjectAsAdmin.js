import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import useAllUsers from "../../hooks/useAllUsers";

const AddNewProjectAsAdmin = ({ setSuccessMessage, handleRefreshProjects }) => {
  const { register, handleSubmit, reset } = useForm();

  const { user } = useAuth();
  const { users } = useAllUsers();

  const onSubmit = async (data) => {
    const newProjectRef = await addDoc(collection(db, "projects"), {
      title: data.projectTitle,
      status: "active",
      createdAt: serverTimestamp(),
      createdBy: user.email,
      owner: data.owner,
    });

    const ownerRef = doc(db, "projectUsers", data.owner);
    updateDoc(ownerRef, { [`projectRoles.${newProjectRef.id}`]: "owner" });

    reset();
    handleRefreshProjects();
    setSuccessMessage("Project added.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="add-user-form">
      <div className="user-form-row">
        <label className="user-form-label">Add new project</label>
        <div className="user-form-input-wrapper">
          <input
            {...register("projectTitle", { required: true })}
            type="text"
            placeholder="Project name"
            className="user-form-input"
            required
          />
          <select
            {...register("owner", { required: true })}
            className="user-form-input"
            required
          >
            <option value="">Select an owner</option>
            {users?.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
          <button type="submit" className="primary-btn reset-btn">
            Add new project
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddNewProjectAsAdmin;
