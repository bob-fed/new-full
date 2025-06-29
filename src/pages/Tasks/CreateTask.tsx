import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Plus, DollarSign, MapPin, Calendar, Tag, 
  FileText, Lightbulb, Target, Clock, Users 
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { Category } from '../../types';
import { taskService } from '../../services/taskService';

interface CreateTaskFormValues {
  title: string;
  description: string;
  budget: number;
  location: string;
  categoryId: string;
  deadline: string;
}

export const CreateTask: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [currentStep, setCurrentStep] = React.useState(1);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await taskService.getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const getCategoryName = (category: Category) => {
    switch (i18n.language) {
      case 'he':
        return category.name_he || category.nameHe || 'Unknown Category';
      case 'ru':
        return category.name_ru || category.nameRu || 'Unknown Category';
      default:
        return category.name_en || category.nameEn || 'Unknown Category';
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title must be less than 200 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must be less than 2000 characters')
      .required('Description is required'),
    budget: Yup.number()
      .min(1, 'Budget must be at least ₪1')
      .required('Budget is required'),
    location: Yup.string()
      .min(2, 'Location must be at least 2 characters')
      .required('Location is required'),
    categoryId: Yup.string()
      .required('Please select a category'),
    deadline: Yup.date()
      .min(new Date(), 'Deadline must be in the future')
      .optional(),
  });

  const initialValues: CreateTaskFormValues = {
    title: '',
    description: '',
    budget: 0,
    location: '',
    categoryId: '',
    deadline: '',
  };

  const handleSubmit = async (values: CreateTaskFormValues) => {
    setIsLoading(true);
    try {
      const taskData = {
        ...values,
        deadline: values.deadline || undefined,
      };
      const task = await taskService.createTask(taskData);
      toast.success('Task created successfully!');
      navigate(`/tasks/${task.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Details', icon: Target },
    { number: 3, title: 'Budget & Timeline', icon: DollarSign },
  ];

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
              onClick={() => navigate('/tasks')}
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Back to Tasks
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
              Create Your
              <span className="block bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Perfect Task
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Describe what you need done and connect with skilled professionals ready to help
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg' 
                        : 'bg-white/10 text-white/60'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= step.number ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 ${
                        currentStep > step.number ? 'bg-gradient-to-r from-pink-500 to-violet-500' : 'bg-white/20'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
                    <Form className="space-y-8">
                      {/* Task Title */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <label htmlFor="title" className="block text-lg font-bold text-white mb-3">
                          <FileText className="w-5 h-5 inline mr-2 text-pink-400" />
                          {t('tasks.taskTitle')} *
                        </label>
                        <Field
                          name="title"
                          type="text"
                          placeholder="e.g., Clean my apartment, Fix my laptop, Design a logo..."
                          className={`block w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-lg ${
                            errors.title && touched.title ? 'border-red-400 focus:ring-red-500' : ''
                          }`}
                        />
                        <ErrorMessage name="title" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                      </motion.div>

                      {/* Category Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <label htmlFor="categoryId" className="block text-lg font-bold text-white mb-3">
                          <Tag className="w-5 h-5 inline mr-2 text-purple-400" />
                          {t('tasks.category')} *
                        </label>
                        <Field
                          as="select"
                          name="categoryId"
                          className={`block w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                            errors.categoryId && touched.categoryId ? 'border-red-400 focus:ring-red-500' : ''
                          }`}
                        >
                          <option value="" className="bg-gray-800">
                            {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                          </option>
                          {!categoriesLoading && categories && categories.length > 0 ? (
                            categories.map((category) => (
                              <option key={category.id} value={category.id} className="bg-gray-800">
                                {getCategoryName(category)}
                              </option>
                            ))
                          ) : !categoriesLoading ? (
                            <option value="" disabled className="bg-gray-800">No categories available</option>
                          ) : null}
                        </Field>
                        <ErrorMessage name="categoryId" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                      </motion.div>

                      {/* Description */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <label htmlFor="description" className="block text-lg font-bold text-white mb-3">
                          <FileText className="w-5 h-5 inline mr-2 text-blue-400" />
                          {t('tasks.description')} *
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          rows={6}
                          placeholder="Provide detailed information about what needs to be done. Include any specific requirements, preferences, or important details..."
                          className={`block w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                            errors.description && touched.description ? 'border-red-400 focus:ring-red-500' : ''
                          }`}
                        />
                        <ErrorMessage name="description" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                        <div className="mt-2 text-sm text-white/60">
                          {values.description.length}/2000 characters
                        </div>
                      </motion.div>

                      {/* Budget and Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <label htmlFor="budget" className="block text-lg font-bold text-white mb-3">
                            <DollarSign className="w-5 h-5 inline mr-2 text-green-400" />
                            {t('tasks.budget')} (₪) *
                          </label>
                          <Field
                            name="budget"
                            type="number"
                            min="1"
                            placeholder="100"
                            className={`block w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 ${
                              errors.budget && touched.budget ? 'border-red-400 focus:ring-red-500' : ''
                            }`}
                          />
                          <ErrorMessage name="budget" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <label htmlFor="location" className="block text-lg font-bold text-white mb-3">
                            <MapPin className="w-5 h-5 inline mr-2 text-orange-400" />
                            {t('tasks.location')} *
                          </label>
                          <Field
                            name="location"
                            type="text"
                            placeholder="e.g., Tel Aviv, Ramat Gan, Jerusalem"
                            className={`block w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                              errors.location && touched.location ? 'border-red-400 focus:ring-red-500' : ''
                            }`}
                          />
                          <ErrorMessage name="location" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                        </motion.div>
                      </div>

                      {/* Deadline */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <label htmlFor="deadline" className="block text-lg font-bold text-white mb-3">
                          <Calendar className="w-5 h-5 inline mr-2 text-purple-400" />
                          {t('tasks.deadline')} (optional)
                        </label>
                        <Field
                          name="deadline"
                          type="datetime-local"
                          className={`block w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                            errors.deadline && touched.deadline ? 'border-red-400 focus:ring-red-500' : ''
                          }`}
                        />
                        <ErrorMessage name="deadline" component="div" className="mt-2 text-sm text-red-400 font-medium" />
                      </motion.div>

                      {/* Tips Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6"
                      >
                        <h4 className="flex items-center text-lg font-bold text-white mb-4">
                          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                          💡 Tips for a great task post
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <Target className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>Be specific about what you need done</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <span>Set a realistic budget and timeline</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <Users className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>Mention if you'll provide materials or tools</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <FileText className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                              <span>Include any special requirements</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Submit Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6"
                      >
                        <Button
                          type="submit"
                          variant="gradient"
                          size="lg"
                          fullWidth
                          isLoading={isLoading}
                          disabled={isLoading || categoriesLoading}
                          icon={<Plus className="w-5 h-5" />}
                        >
                          {isLoading ? 'Creating Task...' : 'Create Task'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          fullWidth
                          onClick={() => navigate('/tasks')}
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
    </Layout>
  );
};