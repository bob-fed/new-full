import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Edit, MapPin, Calendar, Star, Shield, Phone, Mail, Award, 
  TrendingUp, Users, CheckCircle, Clock, DollarSign, Eye 
} from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Profile not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'Rating', value: user.rating.toFixed(1), icon: Star, color: 'from-yellow-500 to-orange-500' },
    { label: 'Reviews', value: user.totalReviews.toString(), icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Tasks', value: '24', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Response Time', value: '2h', icon: Clock, color: 'from-purple-500 to-pink-500' },
  ];

  const achievements = [
    { title: 'Top Rated', description: 'Maintained 4.8+ rating', icon: '🏆', earned: true },
    { title: 'Quick Responder', description: 'Responds within 1 hour', icon: '⚡', earned: true },
    { title: 'Reliable Provider', description: 'Completed 50+ tasks', icon: '🎯', earned: false },
    { title: 'Customer Favorite', description: '95% positive feedback', icon: '❤️', earned: true },
  ];

  const recentActivity = [
    { type: 'task_completed', title: 'Completed "House Cleaning"', time: '2 hours ago', amount: '₪150' },
    { type: 'review_received', title: 'Received 5-star review', time: '1 day ago', rating: 5 },
    { type: 'task_applied', title: 'Applied to "Garden Maintenance"', time: '3 days ago' },
    { type: 'profile_updated', title: 'Updated profile information', time: '1 week ago' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card variant="glass" className="relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-2xl">
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
                  
                  {/* Online Status */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h1 className="text-4xl font-black text-white">
                      {user.firstName} {user.lastName}
                    </h1>
                    {user.isVerified && (
                      <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-semibold text-sm">Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-white/70 mb-4">
                    <span className="capitalize bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
                      {user.role}
                    </span>
                    {user.rating > 0 && (
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-bold text-white">{user.rating.toFixed(1)}</span>
                        <span className="text-sm">({user.totalReviews} reviews)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-6">
                    {user.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>Profile views: 1,247</span>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="text-white/80 leading-relaxed mb-6 max-w-2xl">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Edit Button */}
                <Button
                  onClick={() => navigate('/profile/edit')}
                  variant="gradient"
                  size="lg"
                  icon={<Edit className="w-5 h-5" />}
                >
                  {t('profile.editProfile')}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="text-center hover:scale-105 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-white/60 font-medium">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card variant="glass">
                  <h2 className="text-2xl font-bold text-white mb-6">About Me</h2>
                  {user.bio ? (
                    <div className="space-y-4">
                      <p className="text-white/80 leading-relaxed">{user.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {['React', 'Node.js', 'TypeScript', 'Design', 'Consulting'].map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 border border-white/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60 italic mb-4">No bio added yet.</p>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/profile/edit')}
                      >
                        Add Bio
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card variant="glass">
                  <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`p-4 rounded-2xl border transition-all duration-300 ${
                          achievement.earned
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <div className={`font-semibold ${achievement.earned ? 'text-yellow-400' : 'text-white/60'}`}>
                              {achievement.title}
                            </div>
                            <div className="text-sm text-white/60">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card variant="glass">
                  <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10"
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          activity.type === 'task_completed' ? 'bg-green-500/20 text-green-400' :
                          activity.type === 'review_received' ? 'bg-yellow-500/20 text-yellow-400' :
                          activity.type === 'task_applied' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {activity.type === 'task_completed' && <CheckCircle className="w-6 h-6" />}
                          {activity.type === 'review_received' && <Star className="w-6 h-6" />}
                          {activity.type === 'task_applied' && <TrendingUp className="w-6 h-6" />}
                          {activity.type === 'profile_updated' && <Edit className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">{activity.title}</div>
                          <div className="text-white/60 text-sm">{activity.time}</div>
                        </div>
                        {activity.amount && (
                          <div className="text-green-400 font-bold">{activity.amount}</div>
                        )}
                        {activity.rating && (
                          <div className="flex items-center">
                            {[...Array(activity.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card variant="glass">
                  <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-white/70">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3 text-white/70">
                        <Phone className="w-5 h-5 text-green-400" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 text-white/70">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <span className="text-sm">{user.location || 'Location not set'}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Verification Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card variant="glass">
                  <h3 className="text-xl font-bold text-white mb-6">Verification Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Email</span>
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Phone</span>
                      <div className={`flex items-center ${user.phone ? 'text-green-400' : 'text-white/40'}`}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">
                          {user.phone ? 'Verified' : 'Not added'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Identity</span>
                      <div className={`flex items-center ${user.isVerified ? 'text-green-400' : 'text-white/40'}`}>
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">
                          {user.isVerified ? 'Verified' : 'Not verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!user.isVerified && user.role === 'provider' && (
                    <Button variant="gradient" size="sm" fullWidth className="mt-4">
                      Request Verification
                    </Button>
                  )}
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card variant="glass">
                  <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/my-tasks')}
                    >
                      View My Tasks
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/create-task')}
                    >
                      Create New Task
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/chat')}
                    >
                      Messages
                    </Button>
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