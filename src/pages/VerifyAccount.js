import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyAccount, reSendVerificationOtp } from "../services/authService";

const VerifyAccount = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const autoResendDone = React.useRef(false);

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [location]);

  // Auto resend OTP once when page loads with email (e.g. redirect from login)
  useEffect(() => {
    const emailToUse = location.state?.email?.trim();
    if (!emailToUse || autoResendDone.current) return;
    autoResendDone.current = true;
    reSendVerificationOtp(emailToUse)
      .then((res) => {
        if (res?.success) {
          toast.info(res.message || "Verification code sent to your email.");
          setResendCooldown(60);
        }
      })
      .catch(() => { /* silent; user can click Resend OTP */ });
  }, [location.state?.email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyAccount({
        email: email.trim().toLowerCase(),
        otp: otp,
      });

      if (response.success) {
        toast.success("Account verified successfully! You can now sign in.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        toast.error(response.message || "Verification failed");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const emailToUse = email?.trim();
    if (!emailToUse) {
      toast.error("Email is required to resend OTP");
      return;
    }
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const response = await reSendVerificationOtp(emailToUse);
      if (response?.success) {
        toast.success(response.message || "OTP sent to your email.");
        setResendCooldown(60);
      } else {
        toast.error(response?.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-primary/20 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">MADADGAAR</h1>
          <p className="text-gray-600">Verify Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!email && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Enter your email"
              />
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleChange}
              required
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || resendCooldown > 0 || !email?.trim()}
              className="text-primary hover:text-primary-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-primary font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
