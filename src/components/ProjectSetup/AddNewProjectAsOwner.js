import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const AddNewProjectAsOwner = ({ setSuccessMessage, handleRefreshProjects }) => {
  const { register, handleSubmit, reset } = useForm();

  const { user } = useAuth();

  const onSubmit = async (data) => {
    const newProjData = {
      title: data.projectTitle,
      status: "active",
      createdAt: serverTimestamp(),
      createdBy: user.email,
      owner: user.email,
    };

    const newProjectRef = await addDoc(collection(db, "projects"), newProjData);
    const ownerRef = doc(db, "projectUsers", user.email);
    await updateDoc(ownerRef, {
      [`projectRoles.${newProjectRef.id}`]: "owner",
    });

    // Fetch the doc to get server-generated fields
    const docSnap = await getDoc(newProjectRef);

    reset();
    handleRefreshProjects(newProjectRef.id, docSnap.data());
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
          <button type="submit" className="primary-btn reset-btn">
            Add new project
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddNewProjectAsOwner;
