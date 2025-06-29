import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await taskService.getCategories();
      console.log('Loaded categories:', categoriesData);
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('tasks.createTask')}
            </h1>
            <p className="text-gray-600">
              Describe your task and find the perfect provider
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
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.taskTitle')} *
                    </label>
                    <Field
                      name="title"
                      type="text"
                      placeholder="e.g., Clean my apartment"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.title && touched.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.category')} *
                    </label>
                    <Field
                      as="select"
                      name="categoryId"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.categoryId && touched.categoryId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                      </option>
                      {!categoriesLoading && categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {getCategoryName(category)}
                          </option>
                        ))
                      ) : !categoriesLoading ? (
                        <option value="" disabled>No categories available</option>
                      ) : null}
                    </Field>
                    <ErrorMessage name="categoryId" component="div" className="mt-1 text-sm text-red-600" />
                    {!categoriesLoading && categories.length === 0 && (
                      <p className="mt-1 text-sm text-yellow-600">
                        No categories found. Please contact support.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.description')} *
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={5}
                      placeholder="Provide detailed information about what needs to be done..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.description && touched.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tasks.budget')} (₪) *
                      </label>
                      <Field
                        name="budget"
                        type="number"
                        min="1"
                        placeholder="100"
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                          errors.budget && touched.budget ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <ErrorMessage name="budget" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tasks.deadline')} (optional)
                      </label>
                      <Field
                        name="deadline"
                        type="datetime-local"
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                          errors.deadline && touched.deadline ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <ErrorMessage name="deadline" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.location')} *
                    </label>
                    <Field
                      name="location"
                      type="text"
                      placeholder="e.g., Tel Aviv, Ramat Gan"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        errors.location && touched.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Tips for a great task post:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Be specific about what you need done</li>
                      <li>• Include any special requirements or preferences</li>
                      <li>• Set a realistic budget and timeline</li>
                      <li>• Mention if you'll provide materials or tools</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="flex-1"
                      disabled={categoriesLoading}
                    >
                      {isLoading ? 'Creating Task...' : 'Create Task'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/tasks')}
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