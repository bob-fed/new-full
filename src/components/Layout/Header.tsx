import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, MessageCircle, Bell, Zap, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const isRTL = i18n.language === 'he';

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-pink-500/25 transition-all duration-300"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-7 h-7 text-white" />
            </motion.div>
            <motion.span 
              className="text-2xl font-black text-white group-hover:text-pink-300 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              TaskHub
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/tasks"
              className="relative text-white/80 hover:text-white transition-colors font-semibold group"
            >
              {t('navigation.tasks')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-violet-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-tasks"
                  className="relative text-white/80 hover:text-white transition-colors font-semibold group"
                >
                  {t('navigation.myTasks')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-violet-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/chat"
                  className="relative text-white/80 hover:text-white transition-colors font-semibold group p-2"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 text-white hover:text-pink-300 transition-colors group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-pink-500/25 transition-all duration-300">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="hidden sm:block font-semibold">
                    {user?.firstName}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 z-50`}
                    >
                      <div className="px-4 py-3 border-b border-white/20">
                        <p className="text-white font-semibold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-white/60 text-sm">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 inline mr-3" />
                        {t('navigation.profile')}
                      </Link>
                      
                      <Link
                        to="/create-task"
                        className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Zap className="w-4 h-4 inline mr-3" />
                        {t('navigation.createTask')}
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Bell className="w-4 h-4 inline mr-3" />
                          {t('navigation.dashboard')}
                        </Link>
                      )}
                      
                      <div className="border-t border-white/20 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-3 text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4 inline mr-3" />
                          {t('auth.logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-colors font-semibold"
                >
                  {t('auth.login')}
                </Link>
                <Link to="/register">
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-full shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('auth.register')}
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/10 backdrop-blur-xl border-t border-white/20 rounded-b-2xl mt-4 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  to="/tasks"
                  className="block text-white hover:text-pink-300 transition-colors font-semibold py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.tasks')}
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/my-tasks"
                      className="block text-white hover:text-pink-300 transition-colors font-semibold py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('navigation.myTasks')}
                    </Link>
                    <Link
                      to="/chat"
                      className="block text-white hover:text-pink-300 transition-colors font-semibold py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('chat.title')}
                    </Link>
                  </>
                )}
                {!isAuthenticated && (
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <Link
                      to="/login"
                      className="block text-white hover:text-pink-300 transition-colors font-semibold py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('auth.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('auth.register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};