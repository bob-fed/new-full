import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
      console.log('Form values being submitted:', values);
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">TaskHub</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.register')}
            </h2>
            <p className="text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                {t('auth.login')}
              </Link>
            </p>
          </div>

          <Card className="mt-8 p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form className="space-y-6">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      I want to:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          values.role === 'client' 
                            ? 'border-primary-600 bg-primary-50' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => setFieldValue('role', 'client')}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🔍</div>
                          <div className="font-medium">Find Services</div>
                          <div className="text-sm text-gray-500">Post tasks</div>
                        </div>
                      </div>
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          values.role === 'provider' 
                            ? 'border-primary-600 bg-primary-50' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => setFieldValue('role', 'provider')}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">💼</div>
                          <div className="font-medium">Provide Services</div>
                          <div className="text-sm text-gray-500">Earn money</div>
                        </div>
                      </div>
                    </div>
                    <ErrorMessage name="role" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.firstName')}
                      </label>
                      <Field
                        name="firstName"
                        type="text"
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                          errors.firstName && touched.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.lastName')}
                      </label>
                      <Field
                        name="lastName"
                        type="text"
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                          errors.lastName && touched.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.email')}
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.phone')}
                    </label>
                    <Field
                      name="phone"
                      type="tel"
                      placeholder="+972-XX-XXX-XXXX"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.phone && touched.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.password')}
                    </label>
                    <Field
                      name="password"
                      type="password"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.confirmPassword')}
                    </label>
                    <Field
                      name="confirmPassword"
                      type="password"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                      I agree to the{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-500">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-500">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : t('auth.register')}
                  </Button>
                </Form>
              )}
            </Formik>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};