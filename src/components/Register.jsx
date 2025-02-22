import { useState } from "react";
import Logo from "../assets/logo.png";
import banner from "../assets/banner.png";
import { Link, useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import service from "../appwrite/config"; // Import the Appwrite service

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: null,
    email: null,
    password: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null })); // Reset error when input changes
    // console.log(formData.name, formData.email, formData.password);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form Submitted:", formData);
      const fileResponse = await service.uploadFile(file);
      if (!fileResponse) {
        throw new Error("Upload failed");
      }
      const previewUrl = await service.getFilePreview(fileResponse.$id);

      const response = await fetch(
        `https://backend-ddi2.onrender.com/api/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.name,
            email: formData.email,
            password: formData.password,
            file: previewUrl,
          }),
        }
      );
      console.log(response);
      if (!response.ok) {
        setErrors((prev) => ({ ...prev, email: "enter correct email" }));
      } else {
        navigate("/login");
      }
    } else {
      console.log("Validation Failed:", errors);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="login-form-div">
          <h1 className="login-form-div-h1">Register</h1>
          <FileUpload
            setFilePreview={setFilePreview}
            filePreview={filePreview}
            setFile={setFile}
          />
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="name">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </label>

            <label htmlFor="email">
              <span>Email</span>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </label>

            <label htmlFor="password">
              <span>Enter Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </label>
            <button type="submit" className="login-submit-btn">
              Register
            </button>
          </form>
          <div className="login-forgot-password">
            <Link
              to="/login"
              style={{ textDecoration: "none", color: "black" }}
            >
              <span>Already Registerd ?</span>
            </Link>{" "}
          </div>
        </div>
        <div
          className="login-form-banner"
          style={{ backgroundImage: `url(${banner})` }}
        ></div>
      </div>
    </>
  );
}

export default Register;
