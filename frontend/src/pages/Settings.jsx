import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Download, 
  Trash2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Save,
  AlertCircle
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';

const Settings = () => {
  // State management
  const [accountSettings, setAccountSettings] = useState({
    fullName: 'Priyanshuraj',
    email: 'priyanshuraj@gmail.com',
    username: '@priyanshuraj'
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    themeColor: 'blue',
    fontSize: 'medium'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    quizReminders: true,
    aiSummaries: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false
  });

  const [appPreferences, setAppPreferences] = useState({
    language: 'english',
    autoGenerateQuizzes: true,
    saveAiResponses: true
  });

  const handleSaveAccountSettings = () => {
    toast.success('Account settings saved successfully');
  };

  const handleExportData = () => {
    toast.success('Data export initiated. Check your email.');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.success('Account deletion initiated');
    }
  };

  const handleChangePassword = () => {
    toast.success('Password change email sent');
  };

  const ToggleSwitch = ({ enabled, onToggle, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 font-medium text-sm">{label}</span>
      <button
        onClick={onToggle}
        className="relative w-12 h-6 rounded-full transition-colors duration-200"
        style={{ backgroundColor: enabled ? '#3B82F6' : '#E5E7EB' }}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Settings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your account, preferences, security, and app experience.</p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={accountSettings.fullName}
                  onChange={(e) => setAccountSettings({ ...accountSettings, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={accountSettings.email}
                  onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={accountSettings.username}
                  onChange={(e) => setAccountSettings({ ...accountSettings, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveAccountSettings}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                label="Dark Mode"
                enabled={appearanceSettings.darkMode}
                onToggle={() => setAppearanceSettings({ ...appearanceSettings, darkMode: !appearanceSettings.darkMode })}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme Color</label>
                <div className="flex space-x-3">
                  {['blue', 'purple', 'green', 'orange'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, themeColor: color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        appearanceSettings.themeColor === color
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color === 'blue' ? '#3B82F6' : color === 'purple' ? '#8B5CF6' : color === 'green' ? '#10B981' : '#F97316' }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
                <select
                  value={appearanceSettings.fontSize}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                label="Email Notifications"
                enabled={notificationSettings.emailNotifications}
                onToggle={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
              />
              <ToggleSwitch
                label="Quiz Reminders"
                enabled={notificationSettings.quizReminders}
                onToggle={() => setNotificationSettings({ ...notificationSettings, quizReminders: !notificationSettings.quizReminders })}
              />
              <ToggleSwitch
                label="AI Summary Notifications"
                enabled={notificationSettings.aiSummaries}
                onToggle={() => setNotificationSettings({ ...notificationSettings, aiSummaries: !notificationSettings.aiSummaries })}
              />
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={handleChangePassword}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500">Update your password regularly</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <ToggleSwitch
                label="Two-Factor Authentication"
                enabled={securitySettings.twoFactorEnabled}
                onToggle={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
              />
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-3">Active Sessions</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Chrome on Windows</p>
                        <p className="text-xs text-gray-500">Last active 5 minutes ago</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Current</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Safari on iPhone</p>
                        <p className="text-xs text-gray-500">Last active 2 days ago</p>
                      </div>
                    </div>
                    <button className="text-xs text-red-600 hover:text-red-700">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Export Data</span>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400" />
              </motion.button>
              
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-medium text-red-900">Danger Zone</h3>
                </div>
                <p className="text-sm text-red-700 mb-4">
                  Deleting your account is permanent. All your data will be removed and cannot be recovered.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* App Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">App Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Default Language</label>
                <select
                  value={appPreferences.language}
                  onChange={(e) => setAppPreferences({ ...appPreferences, language: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all"
                >
                  <option value="english">English</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
              
              <ToggleSwitch
                label="Auto-generate Quizzes"
                enabled={appPreferences.autoGenerateQuizzes}
                onToggle={() => setAppPreferences({ ...appPreferences, autoGenerateQuizzes: !appPreferences.autoGenerateQuizzes })}
              />
              <ToggleSwitch
                label="Save AI Responses"
                enabled={appPreferences.saveAiResponses}
                onToggle={() => setAppPreferences({ ...appPreferences, saveAiResponses: !appPreferences.saveAiResponses })}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
