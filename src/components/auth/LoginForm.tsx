import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, Mail, AlertCircle, User, Github, Home } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(formData.email, formData.password);
      
      // Navigate to intended page or home after successful login
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setErrors({ general: error.message || "Invalid email or password. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    setIsSubmitting(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGithub();
      }
      
      // Navigate to intended page or home after successful social login
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error(`${provider} login failed:`, error);
      setErrors({ general: error.message || `Failed to sign in with ${provider}` });
    } finally {
      setSocialLoading(null);
      setIsSubmitting(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, y: -2 },
    blur: { scale: 1, y: 0 }
  };

  // const fillDummyData = () => {
  //   setFormData({
  //     email: "demo@example.com",
  //     password: "demo",
  //     rememberMe: false
  //   });
  //   setErrors({}); // Clear any previous errors
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto"
      >
        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <motion.div
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Home className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium group-hover:underline">Back to Home</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-block mb-4 sm:mb-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2 max-w-sm mx-auto">
            Sign in to continue building your professional resume
          </p>
        </motion.div>

        {/* Social Login Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3 sm:space-y-4 mb-6"
        >
          <motion.button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={socialLoading === "google"}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 group py-3 sm:py-4 rounded-xl font-medium shadow-sm hover:shadow-md flex items-center justify-center"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {socialLoading === "google" ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm sm:text-base font-medium ml-2">Continue with Google</span>
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleSocialLogin("github")}
            disabled={socialLoading === "github"}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 hover:border-gray-600 transition-all duration-300 group py-3 sm:py-4 rounded-xl font-medium shadow-sm hover:shadow-md flex items-center justify-center"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {socialLoading === "github" ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <>
                <Github className="w-5 h-5" />
                <span className="text-sm sm:text-base font-medium ml-2">Continue with GitHub</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="my-6 sm:my-8 text-center"
        >
          <div className="flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </motion.div>
          )}

          <div className="space-y-5 sm:space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                Email Address
              </Label>
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-12 pr-4 py-4 text-base border-2 transition-all duration-300 rounded-xl ${
                      errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="john.doe@company.com"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                Password
              </Label>
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
              >
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-12 pr-12 py-4 text-base border-2 transition-all duration-300 rounded-xl ${
                      errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.password}</span>
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center space-x-3"
              >
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                  Remember me
                </Label>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center sm:text-right"
              >
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>
            </div>

            {/* Dummy Data Button */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="mb-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={fillDummyData}
                className="w-full text-xs sm:text-sm py-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-xl"
              >
                🧪 Fill Test Data (demo@example.com / demo123)
              </Button>
            </motion.div> */}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="btn-sign-in"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-text">
                {isSubmitting ? "Signing In..." : "Sign In"}
              </span>
            </motion.button>
          </div>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-6 sm:mt-8"
        >
          <p className="text-sm sm:text-base text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign up here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;