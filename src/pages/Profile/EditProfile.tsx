import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Save, Camera, Shield } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Profile not found</h1>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Back to Profile
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-black text-white mb-4">
              Edit <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Update your profile information to help others get to know you better
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card variant="glass">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-6">Profile Picture</h3>
                  
                  {/* Avatar */}
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          className="w-32 h-32 rounded-3xl object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-black text-white">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    {/* Camera Button */}
                    <motion.button
                      className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </motion.button>
                  </div>
                  
                  <p className="text-white/60 text-sm mb-4">
                    Upload a professional photo to increase trust and get more responses
                  </p>
                  
                  <Button variant="outline" size="sm" fullWidth>
                    Change Photo
                  </Button>
                </div>
              </Card>

              {/* Verification Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6"
              >
                <Card variant="glass">
                  <h3 className="text-lg font-bold text-white mb-4">
                    <Shield className="w-5 h-5 inline mr-2 text-green-400" />
                    Verification Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Email</span>
                      <div className="flex items-center text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm font-semibold">Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Phone</span>
                      <div className={`flex items-center ${user.phone ? 'text-green-400' : 'text-yellow-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${user.phone ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        <span className="text-sm font-semibold">
                          {user.phone ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Identity</span>
                      <div className={`flex items-center ${user.isVerified ? 'text-green-400' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${user.isVerified ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <span className="text-sm font-semibold">
                          {user.isVerified ? 'Verified' : 'Not verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!user.isVerified && (
                    <Button variant="gradient" size="sm" fullWidth className="mt-4">
                      Request Verification
                    </Button>
                  )}
                </Card>
              </motion.div>
            </motion.div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card variant="glass" className="relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                  </div>

                  <div className="relative z-10">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, touched, values }) => (
                        <Form className="space-y-6">
                          {/* Name Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                            >
                              <label htmlFor="firstName" className="block text-sm font-bold text-white mb-2">
                                <User className="w-4 h-4 inline mr-2 text-pink-400" />
                                {t('auth.firstName')} *
                              </label>
                              <Field
                                name="firstName"
                                type="text"
                                placeholder="First name"
                                className={`block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                                  errors.firstName && touched.firstName ? 'border-red-400 focus:ring-red-500' : ''
                                }`}
                              />
                              <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            >
                              <label htmlFor="lastName" className="block text-sm font-bold text-white mb-2">
                                <User className="w-4 h-4 inline mr-2 text-violet-400" />
                                {t('auth.lastName')} *
                              </label>
                              <Field
                                name="lastName"
                                type="text"
                                placeholder="Last name"
                                className={`block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 ${
                                  errors.lastName && touched.lastName ? 'border-red-400 focus:ring-red-500' : ''
                                }`}
                              />
                              <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                            </motion.div>
                          </div>

                          {/* Contact Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                            >
                              <label htmlFor="phone" className="block text-sm font-bold text-white mb-2">
                                <Phone className="w-4 h-4 inline mr-2 text-green-400" />
                                {t('auth.phone')}
                              </label>
                              <Field
                                name="phone"
                                type="tel"
                                placeholder="+972-XX-XXX-XXXX"
                                className={`block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 ${
                                  errors.phone && touched.phone ? 'border-red-400 focus:ring-red-500' : ''
                                }`}
                              />
                              <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                            >
                              <label htmlFor="location" className="block text-sm font-bold text-white mb-2">
                                <MapPin className="w-4 h-4 inline mr-2 text-blue-400" />
                                {t('tasks.location')}
                              </label>
                              <Field
                                name="location"
                                type="text"
                                placeholder="e.g., Tel Aviv, Israel"
                                className={`block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                                  errors.location && touched.location ? 'border-red-400 focus:ring-red-500' : ''
                                }`}
                              />
                              <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                            </motion.div>
                          </div>

                          {/* Bio Field */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                          >
                            <label htmlFor="bio" className="block text-sm font-bold text-white mb-2">
                              <FileText className="w-4 h-4 inline mr-2 text-purple-400" />
                              {t('profile.bio')}
                            </label>
                            <Field
                              as="textarea"
                              name="bio"
                              rows={5}
                              placeholder="Tell others about yourself, your skills, and experience..."
                              className={`block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none ${
                                errors.bio && touched.bio ? 'border-red-400 focus:ring-red-500' : ''
                              }`}
                            />
                            <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-400 font-medium" />
                            <div className="mt-2 text-sm text-white/60">
                              {values.bio.length}/500 characters
                            </div>
                          </motion.div>

                          {/* Tips Section */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6"
                          >
                            <h4 className="font-bold text-white mb-3">💡 Profile Tips:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
                              <div className="space-y-2">
                                <div>• Add a professional photo to increase trust</div>
                                <div>• Write a compelling bio highlighting your skills</div>
                              </div>
                              <div className="space-y-2">
                                <div>• Keep your contact information up to date</div>
                                <div>• Complete verification to boost credibility</div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Submit Buttons */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6"
                          >
                            <Button
                              type="submit"
                              variant="gradient"
                              size="lg"
                              fullWidth
                              isLoading={isLoading}
                              icon={<Save className="w-5 h-5" />}
                            >
                              {isLoading ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              fullWidth
                              onClick={() => navigate('/profile')}
                            >
                              Cancel
                            </Button>
                          </motion.div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};