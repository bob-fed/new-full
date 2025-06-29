export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'client' | 'provider' | 'admin';
  isVerified: boolean;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameHe: string;
  nameRu: string;
  icon: string;
  createdAt: string;
}

export interface Task {
  id: string;
  clientId: string;
  categoryId: string;
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  location: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  client?: User;
  category?: Category;
  applications?: TaskApplication[];
  applicationsCount?: number;
}

export interface TaskApplication {
  id: string;
  taskId: string;
  providerId: string;
  message?: string;
  proposedPrice?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  provider?: User;
  task?: Task;
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: User;
  reviewee?: User;
  task?: Task;
}

export interface Payment {
  id: string;
  taskId: string;
  clientId: string;
  providerId: string;
  amount: number;
  status: 'pending' | 'held' | 'released' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface TaskFilters {
  category?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  deadline?: string;
  status?: string;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}