import { useState } from "react";
import Logo from "../assets/logo.png";
import banner from "../assets/banner.png";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: null,
    password: null,
  });

  const navigate = useNavigate();
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null })); // Reset error when input changes
    // console.log(formData.email, formData.password);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (validateForm()) {
        console.log("Form Submitted:", formData);
        const response = await fetch(
          `https://backend-ddi2.onrender.com/api/user/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          }
        );
        const data = await response.json();
        // console.log(await response.json());
        if (!response.ok) {
          setErrors((prev) => ({ ...prev, email: "enter correct email" }));
        } else {
          sessionStorage.setItem("userToken", JSON.stringify(data.accessToken));
          sessionStorage.setItem("user", JSON.stringify(data.user));
          navigate("/chats");
        }
      } else {
        console.log("Validation Failed:", errors);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="login-form-div">
          <img src={Logo} className="login-form-logo" alt="" />
          <h1 className="login-form-div-h1">Login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
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
            <label htmlFor="name" style={{ visibility: "hidden" }}>
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </label>
            <button type="submit" className="login-submit-btn">
              Login
            </button>
          </form>
          <div className="login-forgot-password">
            <Link
              to="/signup"
              style={{ textDecoration: "none", color: "black" }}
            >
              <span>Create a Account ?</span>
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

export default Login;
