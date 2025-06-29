import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success(t('auth.loginSuccess'));
      navigate('/tasks');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('auth.invalidCredentials'));
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              x: [0, -30, 0],
              y: [0, 20, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-pink-500/25 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <span className="text-3xl font-black text-white group-hover:text-pink-300 transition-colors duration-300">
                TaskHub
              </span>
            </Link>
            
            <motion.h2 
              className="text-4xl font-black text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Welcome <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Back!</span>
            </motion.h2>
            
            <motion.p 
              className="text-white/70 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                {t('auth.register')}
              </Link>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="mt-8 p-8" variant="glass">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values }) => (
                  <Form className="space-y-6">
                    {/* Email Field */}
                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                        <Field
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className={`block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                            errors.email && touched.email ? 'border-red-400 focus:ring-red-500' : ''
                          }`}
                        />
                      </div>
                      <ErrorMessage name="email" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                      <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                        {t('auth.password')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                        <Field
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className={`block w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                            errors.password && touched.password ? 'border-red-400 focus:ring-red-500' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <ErrorMessage name="password" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Field
                          name="rememberMe"
                          type="checkbox"
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-white/30 rounded bg-white/10"
                        />
                        <label htmlFor="rememberMe" className="ml-3 block text-sm text-white/80">
                          Remember me
                        </label>
                      </div>

                      <div className="text-sm">
                        <a href="#" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                          {t('auth.forgotPassword')}
                        </a>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      fullWidth
                      isLoading={isLoading}
                      disabled={isLoading}
                      icon={<ArrowRight className="w-5 h-5" />}
                    >
                      {isLoading ? 'Signing in...' : t('auth.login')}
                    </Button>

                    {/* Social Login */}
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-transparent text-white/60">Or continue with</span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="w-full inline-flex justify-center py-3 px-4 rounded-2xl shadow-sm bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition-all duration-300"
                        >
                          <span className="text-xl mr-2">🔍</span>
                          Google
                        </button>
                        <button
                          type="button"
                          className="w-full inline-flex justify-center py-3 px-4 rounded-2xl shadow-sm bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition-all duration-300"
                        >
                          <span className="text-xl mr-2">📘</span>
                          Facebook
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};