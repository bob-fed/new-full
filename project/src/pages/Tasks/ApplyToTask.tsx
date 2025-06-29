import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, DollarSign, Clock, User } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { formatDistanceToNow } from 'date-fns';

// Helper function to safely format dates
const safeFormatDistanceToNow = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return formatDistanceToNow(date, { addSuffix: true });
};

interface ApplyFormValues {
  message: string;
  proposedPrice: string;
}

export const ApplyToTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [task, setTask] = React.useState<Task | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'provider') {
      navigate('/tasks');
      return;
    }

    if (id) {
      loadTask();
    }
  }, [id, isAuthenticated, user]);

  const loadTask = async () => {
    try {
      const taskData = await taskService.getTask(id!);
      
      // Check if user can apply
      if (taskData.status !== 'open') {
        toast.error('This task is no longer open for applications');
        navigate(`/tasks/${id}`);
        return;
      }

      if (taskData.clientId === user?.id) {
        toast.error('You cannot apply to your own task');
        navigate(`/tasks/${id}`);
        return;
      }

      setTask(taskData);
    } catch (error) {
      console.error('Failed to load task:', error);
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (category: any) => {
    if (!category) return '';
    switch (i18n.language) {
      case 'he':
        return category.nameHe;
      case 'ru':
        return category.nameRu;
      default:
        return category.nameEn;
    }
  };

  const validationSchema = Yup.object({
    message: Yup.string()
      .max(1000, 'Message must be less than 1000 characters')
      .optional(),
    proposedPrice: Yup.number()
      .min(1, 'Proposed price must be at least ₪1')
      .optional(),
  });

  const initialValues: ApplyFormValues = {
    message: '',
    proposedPrice: '',
  };

  const handleSubmit = async (values: ApplyFormValues) => {
    setIsSubmitting(true);
    try {
      await taskService.applyToTask(id!, {
        message: values.message || undefined,
        proposedPrice: values.proposedPrice ? Number(values.proposedPrice) : undefined,
      });
      toast.success('Application sent successfully!');
      navigate(`/tasks/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Task not found</h1>
        </div>
      </Layout>
    );
  }

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
            onClick={() => navigate(`/tasks/${id}`)}
            className="mb-6 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Task
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Apply for Task
            </h1>
            <p className="text-gray-600">
              Submit your application for this task
            </p>
          </div>

          {/* Task Summary */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Summary</h2>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ₪{task.budget.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {task.location}
                </div>
                {task.deadline && new Date(task.deadline).getTime() && !isNaN(new Date(task.deadline).getTime()) && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {safeFormatDistanceToNow(task.deadline)}
                  </div>
                )}
                {task.category && (
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-1">📋</span>
                    {getCategoryName(task.category)}
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-sm line-clamp-3">{task.description}</p>

              {/* Client Info */}
              <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  {task.client?.avatarUrl ? (
                    <img
                      src={task.client.avatarUrl}
                      alt={task.client.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {task.client?.firstName} {task.client?.lastName}
                  </div>
                  {task.client?.rating && (
                    <div className="text-xs text-gray-600">
                      ⭐ {task.client.rating.toFixed(1)} ({task.client.totalReviews} reviews)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Application Form */}
          <Card className="p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Message (optional)
                    </label>
                    <Field
                      as="textarea"
                      name="message"
                      rows={5}
                      placeholder="Tell the client why you're the right person for this task. Mention your relevant experience, approach, and any questions you might have..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.message && touched.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="message" component="div" className="mt-1 text-sm text-red-600" />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum 1000 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="proposedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Proposed Price (₪) - optional
                    </label>
                    <Field
                      name="proposedPrice"
                      type="number"
                      min="1"
                      placeholder={`Client's budget: ₪${task.budget.toLocaleString()}`}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.proposedPrice && touched.proposedPrice ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="proposedPrice" component="div" className="mt-1 text-sm text-red-600" />
                    <p className="mt-1 text-sm text-gray-500">
                      Leave empty to use the client's budget. You can negotiate the final price later.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Application Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Be specific about your relevant experience</li>
                      <li>• Explain your approach to completing the task</li>
                      <li>• Ask clarifying questions if needed</li>
                      <li>• Be professional and courteous</li>
                      <li>• Respond promptly to client messages</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Sending Application...' : 'Send Application'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/tasks/${id}`)}
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