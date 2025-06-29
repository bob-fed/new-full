/*
  # Initial Schema for TaskRabbit-like Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `role` (enum: client, provider, admin)
      - `is_verified` (boolean)
      - `avatar_url` (text)
      - `location` (text)
      - `bio` (text)
      - `rating` (decimal)
      - `total_reviews` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `categories`
      - `id` (uuid, primary key)
      - `name_en` (text)
      - `name_he` (text)
      - `name_ru` (text)
      - `icon` (text)
      - `created_at` (timestamp)

    - `tasks`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `budget` (decimal)
      - `deadline` (timestamp)
      - `location` (text)
      - `status` (enum: open, assigned, in_progress, completed, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `task_applications`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `provider_id` (uuid, foreign key)
      - `message` (text)
      - `proposed_price` (decimal)
      - `status` (enum: pending, accepted, rejected)
      - `created_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `sender_id` (uuid, foreign key)
      - `receiver_id` (uuid, foreign key)
      - `content` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

    - `reviews`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `reviewer_id` (uuid, foreign key)
      - `reviewee_id` (uuid, foreign key)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp)

    - `payments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `client_id` (uuid, foreign key)
      - `provider_id` (uuid, foreign key)
      - `amount` (decimal)
      - `status` (enum: pending, held, released, refunded)
      - `stripe_payment_intent_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE task_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'held', 'released', 'refunded');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role user_role DEFAULT 'client',
  is_verified boolean DEFAULT false,
  avatar_url text,
  location text,
  bio text,
  rating decimal(3,2) DEFAULT 0.00,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_he text NOT NULL,
  name_ru text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  budget decimal(10,2) NOT NULL,
  deadline timestamptz,
  location text NOT NULL,
  status task_status DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task applications table
CREATE TABLE IF NOT EXISTS task_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES users(id) ON DELETE CASCADE,
  message text,
  proposed_price decimal(10,2),
  status application_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, provider_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, reviewer_id, reviewee_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON users
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for tasks
CREATE POLICY "Tasks are viewable by everyone" ON tasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Task owners can update tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (auth.uid() = client_id);

-- RLS Policies for task applications
CREATE POLICY "Applications are viewable by task owner and applicant" ON task_applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = provider_id OR 
    auth.uid() IN (SELECT client_id FROM tasks WHERE id = task_id)
  );

CREATE POLICY "Providers can create applications" ON task_applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = provider_id);

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by participants" ON messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for payments
CREATE POLICY "Payments are viewable by participants" ON payments
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Insert default categories
INSERT INTO categories (name_en, name_he, name_ru, icon) VALUES
  ('Cleaning', 'ניקיון', 'Уборка', 'cleaning'),
  ('Plumbing', 'אינסטלציה', 'Сантехника', 'wrench'),
  ('Tutoring', 'שיעורים פרטיים', 'Репетиторство', 'book'),
  ('Delivery', 'משלוחים', 'Доставка', 'truck'),
  ('Handyman', 'איש מקצוע', 'Мастер на час', 'hammer'),
  ('Moving', 'הובלות', 'Переезд', 'package'),
  ('Pet Care', 'טיפול בחיות מחמד', 'Уход за животными', 'heart'),
  ('Gardening', 'גינון', 'Садоводство', 'flower');

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_location ON tasks(location);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_messages_task_id ON messages(task_id);
CREATE INDEX idx_messages_participants ON messages(sender_id, receiver_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location);