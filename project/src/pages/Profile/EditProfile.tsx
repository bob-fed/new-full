import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
}

export const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .required('Last name is required'),
    phone: Yup.string()
      .matches(/^[\+]?[0-9\-\s\(\)]+$/, 'Invalid phone number format')
      .optional(),
    location: Yup.string()
      .optional(),
    bio: Yup.string()
      .max(500, 'Bio must be less than 500 characters')
      .optional(),
  });

  const initialValues: EditProfileFormValues = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || '',
  };

  const handleSubmit = async (values: EditProfileFormValues) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(values);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="mb-6 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('profile.editProfile')}
            </h1>
            <p className="text-gray-600">
              Update your profile information
            </p>
          </div>

          <Card className="p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.firstName')} *
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
                        {t('auth.lastName')} *
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
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.location')}
                    </label>
                    <Field
                      name="location"
                      type="text"
                      placeholder="e.g., Tel Aviv, Israel"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.location && touched.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.bio')}
                    </label>
                    <Field
                      as="textarea"
                      name="bio"
                      rows={4}
                      placeholder="Tell others about yourself, your skills, and experience..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.bio && touched.bio ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-600" />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum 500 characters
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Profile Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Add a professional photo to increase trust</li>
                      <li>• Write a compelling bio highlighting your skills</li>
                      <li>• Keep your contact information up to date</li>
                      <li>• Complete verification to boost credibility</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/profile')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};