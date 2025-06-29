import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight, Briefcase, Search } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'client' | 'provider';
}

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  const defaultRole = (searchParams.get('role') as 'client' | 'provider') || 'client';

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[\+]?[0-9\-\s\(\)]+$/, 'Invalid phone number format')
      .optional(),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    role: Yup.string()
      .oneOf(['client', 'provider'], 'Please select a role')
      .required('Please select a role'),
  });

  const initialValues: RegisterFormValues = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: defaultRole,
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, ...userData } = values;
      await registerUser(userData);
      toast.success(t('auth.registerSuccess'));
      navigate('/tasks');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -180, -360],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.1, 1, 1.1],
              rotate: [-360, -180, 0],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10"
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
              Join <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">TaskHub</span>
            </motion.h2>
            
            <motion.p 
              className="text-white/70 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                {t('auth.login')}
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
                {({ values, setFieldValue, errors, touched }) => (
                  <Form className="space-y-6">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-4">
                        I want to:
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                          className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                            values.role === 'client' 
                              ? 'border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/25' 
                              : 'border-white/30 bg-white/10 hover:border-pink-400 hover:bg-white/20'
                          }`}
                          onClick={() => setFieldValue('role', 'client')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-center">
                            <Search className="w-8 h-8 mx-auto mb-3 text-pink-400" />
                            <div className="font-semibold text-white">Find Services</div>
                            <div className="text-sm text-white/60 mt-1">Post tasks & hire</div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                            values.role === 'provider' 
                              ? 'border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/25' 
                              : 'border-white/30 bg-white/10 hover:border-violet-400 hover:bg-white/20'
                          }`}
                          onClick={() => setFieldValue('role', 'provider')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-center">
                            <Briefcase className="w-8 h-8 mx-auto mb-3 text-violet-400" />
                            <div className="font-semibold text-white">Provide Services</div>
                            <div className="text-sm text-white/60 mt-1">Earn money</div>
                          </div>
                        </motion.div>
                      </div>
                      <ErrorMessage name="role" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label htmlFor="firstName" className="block text-sm font-semibold text-white mb-2">
                          {t('auth.firstName')} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <Field
                            name="firstName"
                            type="text"
                            placeholder="First name"
                            className={`block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                              errors.firstName && touched.firstName ? 'border-red-400 focus:ring-red-500' : ''
                            }`}
                          />
                        </div>
                        <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                      </div>
                      
                      <div className="relative">
                        <label htmlFor="lastName" className="block text-sm font-semibold text-white mb-2">
                          {t('auth.lastName')} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <Field
                            name="lastName"
                            type="text"
                            placeholder="Last name"
                            className={`block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                              errors.lastName && touched.lastName ? 'border-red-400 focus:ring-red-500' : ''
                            }`}
                          />
                        </div>
                        <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                        {t('auth.email')} *
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

                    {/* Phone Field */}
                    <div className="relative">
                      <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                        {t('auth.phone')}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                        <Field
                          name="phone"
                          type="tel"
                          placeholder="+972-XX-XXX-XXXX"
                          className={`block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                            errors.phone && touched.phone ? 'border-red-400 focus:ring-red-500' : ''
                          }`}
                        />
                      </div>
                      <ErrorMessage name="phone" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                          {t('auth.password')} *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <Field
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
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
                        <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                      </div>
                      
                      <div className="relative">
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                          {t('auth.confirmPassword')} *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <Field
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm password"
                            className={`block w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                              errors.confirmPassword && touched.confirmPassword ? 'border-red-400 focus:ring-red-500' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-white/30 rounded bg-white/10 mt-1"
                      />
                      <label htmlFor="terms" className="ml-3 block text-sm text-white/80">
                        I agree to the{' '}
                        <a href="#" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                          Privacy Policy
                        </a>
                      </label>
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
                      {isLoading ? 'Creating Account...' : t('auth.register')}
                    </Button>
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