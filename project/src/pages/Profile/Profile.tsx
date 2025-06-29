import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, MapPin, Calendar, Star, Shield, Phone, Mail } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <Card className="p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-600">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.isVerified && (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-gray-600 mb-3">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded-full text-sm">
                    {user.role}
                  </span>
                  {user.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{user.rating.toFixed(1)}</span>
                      <span className="text-sm">({user.totalReviews} reviews)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {user.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => navigate('/profile/edit')}
                variant="outline"
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('profile.editProfile')}
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* About */}
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                {user.bio ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio added yet.</p>
                )}
              </Card>

              {/* Reviews */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Reviews ({user.totalReviews})
                </h2>
                {user.totalReviews > 0 ? (
                  <div className="space-y-4">
                    {/* Placeholder for reviews - would be loaded from API */}
                    <div className="text-gray-500 text-center py-8">
                      Reviews will be displayed here
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    No reviews yet
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{user.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-medium">{user.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Verification */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="text-green-600 font-medium">✓ Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className={user.phone ? "text-green-600 font-medium" : "text-gray-400"}>
                      {user.phone ? "✓ Verified" : "Not added"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Identity</span>
                    <span className={user.isVerified ? "text-green-600 font-medium" : "text-gray-400"}>
                      {user.isVerified ? "✓ Verified" : "Not verified"}
                    </span>
                  </div>
                </div>
                {!user.isVerified && user.role === 'provider' && (
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Request Verification
                  </Button>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};