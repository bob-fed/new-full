import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Briefcase, DollarSign, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('admin.totalUsers'),
      value: '2,543',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('admin.activeTasks'),
      value: '1,234',
      change: '+8%',
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('admin.totalRevenue'),
      value: '₪125,430',
      change: '+15%',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'provider', status: 'pending' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'client', status: 'verified' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'provider', status: 'pending' },
  ];

  const recentTasks = [
    { id: 1, title: 'Clean apartment', client: 'Sarah Wilson', status: 'open', budget: 150 },
    { id: 2, title: 'Fix plumbing', client: 'David Brown', status: 'assigned', budget: 300 },
    { id: 3, title: 'Garden maintenance', client: 'Lisa Davis', status: 'completed', budget: 200 },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.dashboard')}
            </h1>
            <p className="text-gray-600">
              Monitor and manage your TaskHub platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className="ml-2 text-sm font-medium text-green-600">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {user.role}
                      </span>
                      {user.status === 'pending' ? (
                        <div className="flex space-x-1">
                          <Button size="sm" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verify
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Suspend
                          </Button>
                        </div>
                      ) : (
                        <span className="text-green-600 text-sm">✓ Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Tasks */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">by {task.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₪{task.budget}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="flex items-center justify-center p-4">
                <Users className="w-5 h-5 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="flex items-center justify-center p-4">
                <Briefcase className="w-5 h-5 mr-2" />
                Review Tasks
              </Button>
              <Button variant="outline" className="flex items-center justify-center p-4">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Reports
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};