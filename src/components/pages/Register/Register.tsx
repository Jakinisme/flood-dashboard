import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

import {
  signUpWithEmail,
  loginWithGoogle,
  loginWithGithub,
  isGmail,
  sendVerificationEmail,
} from "../../../auth/login";

import googleIcon from "../../../assets/icons/google.svg";
import githubIcon from "../../../assets/icons/github.svg";

import Button from "../../ui/Button";
import AuthLayout from "../../layout/AuthLayout";
import styles from "./Register.module.css";

const Register = () => {
  const navigate = useNavigate();
  const { user, isGmail: userIsGmail, isEmailVerified } = useAuth();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (user && userIsGmail && !isEmailVerified) {
      navigate("/verify-required", { replace: true });
    } else if (user && (!userIsGmail || isEmailVerified)) {
      navigate("/", { replace: true });
    }
  }, [user, userIsGmail, isEmailVerified, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsVerifying(false);
    
    if (!isGmail(email)) {
      setError("Please use a Gmail address (@gmail.com) to register.");
      return;
    }

    try {
      setIsVerifying(true);
      await signUpWithEmail(email, password);

      await sendVerificationEmail();

      setIsVerifying(false);
    } catch (msg) {
      setError(String(msg));
      setIsVerifying(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (msg) {
      setError(String(msg));
    }
  };

  const handleGithub = async () => {
    setError("");
    try {
      await loginWithGithub();
    } catch (msg) {
      setError(String(msg));
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start monitoring floods data and receive smarter alerts."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      <form className={styles.form} onSubmit={handleRegister}>
        <label className={styles.inputGroup}>
          <span className={styles.label}>Email address</span>
          <input
            className={styles.input}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className={styles.inputGroup}>
          <span className={styles.label}>Password</span>
          <input
            className={styles.input}
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <span className={styles.requirement}>
            Use 8 or more characters with a mix of letters and numbers.
          </span>
        </label>

        <Button
          className={styles.primaryButton}
          type="submit"
          disabled={isVerifying}
        >
          {isVerifying ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className={styles.providers}>
        <Button
          className={styles.providerButton}
          type="button"
          onClick={handleGoogle}
        >
          <img className={styles.icon} src={googleIcon} alt="google" />
          Continue with Google
        </Button>
        <Button
          className={styles.providerButton}
          type="button"
          onClick={handleGithub}
        >
          <img className={styles.icon} src={githubIcon} alt="github" />
          Continue with Github
        </Button>
      </div>

      {error && (
        <span className={styles.error} aria-live="polite">
          {error}
        </span>
      )}
      {success && (
        <span className={styles.success} aria-live="polite">
          {success}
        </span>
      )}
    </AuthLayout>
  );
}

export default Register;