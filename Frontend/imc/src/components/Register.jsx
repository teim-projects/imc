import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GoogleAuthButton from "./GoogleAuthButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_RE = /^[0-9]{10}$/;
const MAX_PHOTO_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_FIELD_NAME = "photo";

const Register = () => {
  const navigate = useNavigate();
  const REGISTER_URL = `${import.meta.env.VITE_BASE_API_URL}/auth/dj-rest-auth/registration/`;

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile_no: "",
    password1: "",
    password2: "",
  });
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const emailErr = useMemo(() => (form.email && !EMAIL_RE.test(form.email) ? "Invalid email" : ""), [form.email]);
  const mobileErr = useMemo(() => (form.mobile_no && !PHONE_RE.test(form.mobile_no) ? "10-digit number required" : ""), [form.mobile_no]);
  const passwordMatchErr = useMemo(
    () => (form.password2 && form.password1 !== form.password2 ? "Passwords do not match" : ""),
    [form.password1, form.password2]
  );

  const isFormValid =
    form.full_name.trim().length >= 2 &&
    EMAIL_RE.test(form.email) &&
    PHONE_RE.test(form.mobile_no) &&
    form.password1.length >= 8 &&
    !passwordMatchErr &&
    agreeTerms;

  const handlePhoto = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return setPhotoError("Only JPG, PNG, WebP allowed");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setPhotoError(`Max ${MAX_PHOTO_MB}MB`);

    setPhotoError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setMessage("Creating your account...");

    try {
      const fd = new FormData();
      fd.append("full_name", form.full_name);
      fd.append("email", form.email);
      fd.append("mobile_no", form.mobile_no);
      fd.append("password1", form.password1);
      fd.append("password2", form.password2);
      if (photoFile) fd.append(PHOTO_FIELD_NAME, photoFile);

      const res = await fetch(REGISTER_URL, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errors = {};
        Object.entries(data).forEach(([k, v]) => {
          errors[k] = Array.isArray(v) ? v[0] : v;
        });
        setFieldErrors(errors);
        setMessage("Please check the highlighted fields");
        return;
      }

      setMessage("Welcome! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch {
      setMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="auth-container">
        {/* Left - Welcome */}
        <div className="welcome-side">
          <div className="welcome-overlay"></div>
          <div className="welcome-content">
            <h1>Welcome</h1>
            <p>
              Join our warm community and start<br />
              meaningful connections today.
            </p>
          </div>
        </div>

        {/* Right - Compact Form */}
        <div className="form-side">
          <div className="form-card">
            <h2 className="form-title">Create Account</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group floating-group">
                <input
                  type="text"
                  name="full_name"
                  id="fullName"
                  value={form.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder=" "
                />
                <label htmlFor="fullName">Full Name</label>
                {touched.full_name && fieldErrors.full_name && <span className="error">{fieldErrors.full_name}</span>}
              </div>

              <div className="form-group floating-group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder=" "
                />
                <label htmlFor="email">Email</label>
                {(touched.email && (emailErr || fieldErrors.email)) && <span className="error">{emailErr || fieldErrors.email}</span>}
              </div>

              <div className="form-group floating-group">
                <input
                  type="tel"
                  name="mobile_no"
                  id="mobile"
                  maxLength={10}
                  value={form.mobile_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder=" "
                />
                <label htmlFor="mobile">Mobile Number</label>
                {(touched.mobile_no && (mobileErr || fieldErrors.mobile_no)) && <span className="error">{mobileErr || fieldErrors.mobile_no}</span>}
              </div>

              <div className="form-group floating-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password1"
                  id="password1"
                  value={form.password1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder=" "
                />
                <label htmlFor="password1">Password</label>
                <button type="button" className="show-hide" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
                {fieldErrors.password1 && <span className="error">{fieldErrors.password1}</span>}
              </div>

              <div className="form-group floating-group">
                <input
                  type="password"
                  name="password2"
                  id="password2"
                  value={form.password2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder=" "
                />
                <label htmlFor="password2">Confirm Password</label>
                {(touched.password2 && passwordMatchErr) && <span className="error">{passwordMatchErr}</span>}
              </div>

              <div className="form-group photo-group">
                <label>Profile Photo (optional)</label>
                <div
                  className="photo-upload"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); handlePhoto(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {photoPreview ? (
                    <div className="preview-container">
                      <img src={photoPreview} alt="preview" className="photo-preview" />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(""); }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">↑</span>
                      <span>Upload</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handlePhoto(e.target.files?.[0])}
                  />
                </div>
                {photoError && <span className="error">{photoError}</span>}
                {fieldErrors.photo && <span className="error">{fieldErrors.photo}</span>}
              </div>

              <div className="terms">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>
                    I agree to the <a href="#" className="terms-link">Terms of Service</a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className={`submit-btn ${!isFormValid || loading ? "disabled" : ""}`}
                disabled={!isFormValid || loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              {message && (
                <div className={`status-message ${message.includes("Welcome") ? "success" : "error"}`}>
                  {message}
                </div>
              )}
            </form>

            <div className="social-section">
              <div className="social-divider">
                <span>or continue with</span>
              </div>
              <GoogleAuthButton endpoint="/auth/google/" onSuccessNavigate="/dashboard" />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .register-page {
          height: 100vh;
          background: linear-gradient(135deg, #fdfbf7 0%, #f8f1e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: system-ui, sans-serif;
          overflow-y: auto;
        }

        .auth-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          max-width: 1000px;
          width: 100%;
          background: rgba(255, 248, 240, 0.95);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(212, 163, 115, 0.25);
          box-shadow: 0 20px 60px rgba(139, 92, 46, 0.18);
          height: fit-content;
          max-height: 95vh;
        }

        .welcome-side {
          background: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90') center/cover no-repeat;
          position: relative;
        }

        .welcome-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(253, 251, 247, 0.65), rgba(248, 241, 233, 0.45));
        }

        .welcome-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 3rem 2rem;
          color: #4b3f2a;
        }

        .welcome-content h1 {
          font-size: 3.8rem;
          font-weight: 900;
          margin: 0 0 1rem;
          background: linear-gradient(90deg, #d4a373, #e6c68a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-content p {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.9;
          max-width: 340px;
        }

        .form-side {
          background: #fff8f0;
          padding: 2rem 1.8rem;
        }

        .form-card {
          max-width: 340px;
          margin: 0 auto;
        }

        .form-title {
          color: #4b3f2a;
          font-size: 1.9rem;
          font-weight: 800;
          margin: 0 0 1.4rem;
          text-align: center;
        }

        .form-group {
          position: relative;
          margin-bottom: 1.1rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.95rem 1.1rem;
          border: none;
          border-radius: 12px;
          background: rgba(212, 163, 115, 0.15);
          color: #4b3f2a;
          font-size: 0.98rem;
          transition: all 0.3s;
        }

        .form-group input:focus {
          outline: none;
          background: rgba(212, 163, 115, 0.25);
          box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.2);
        }

        .form-group label {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #8b6f47;
          font-size: 0.98rem;
          pointer-events: none;
          transition: all 0.3s ease;
          background: #fff8f0;
          padding: 0 6px;
        }

        .form-group input:focus + label,
        .form-group input:not(:placeholder-shown) + label {
          top: -0.45rem;
          font-size: 0.8rem;
          color: #d4a373;
        }

        .password-group {
          position: relative;
        }

        .show-hide {
          position: absolute;
          right: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #8b6f47;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .photo-upload {
          height: 80px;
          border: 2px dashed #d4a373;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 163, 115, 0.1);
          cursor: pointer;
          transition: all 0.3s;
        }

        .photo-upload:hover {
          border-color: #e6c68a;
          background: rgba(212, 163, 115, 0.15);
        }

        .photo-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }

        .preview-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .remove-photo {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .upload-placeholder {
          text-align: center;
          color: #8b6f47;
          font-size: 0.9rem;
        }

        .upload-icon {
          font-size: 1.6rem;
          margin-bottom: 0.3rem;
          display: block;
        }

        .terms {
          margin: 0.9rem 0 1.3rem;
          font-size: 0.92rem;
          color: #4b3f2a;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          accent-color: #d4a373;
        }

        .terms-link {
          color: #d4a373;
          text-decoration: underline;
          font-weight: 500;
        }

        .submit-btn {
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(90deg, #d4a373, #e6c68a);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .submit-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212,163,115,0.3);
        }

        .submit-btn.disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .status-message {
          margin-top: 0.9rem;
          padding: 0.8rem;
          border-radius: 10px;
          text-align: center;
          font-size: 0.92rem;
        }

        .status-message.success { background: rgba(16,185,129,0.15); color: #059669; }
        .status-message.error   { background: rgba(239,68,68,0.15); color: #dc2626; }

        .social-divider {
          text-align: center;
          color: #8b6f47;
          margin: 1.4rem 0 1rem;
          font-size: 0.92rem;
        }

        .social-section {
          text-align: center;
        }

        .error {
          color: #dc2626;
          font-size: 0.82rem;
          margin-top: 0.4rem;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default Register;