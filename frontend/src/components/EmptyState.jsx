import { FaInbox, FaBook, FaQuestionCircle, FaRobot } from 'react-icons/fa';

const EmptyState = ({ type = 'default', message = '', action = null }) => {
  const icons = {
    default: FaInbox,
    notes: FaBook,
    quiz: FaQuestionCircle,
    ai: FaRobot,
  };

  const messages = {
    default: message || 'No data available',
    notes: message || 'No notes uploaded yet. Upload your first note to get started!',
    quiz: message || 'No quizzes attempted yet. Take your first quiz to track your progress!',
    ai: message || 'Start by uploading notes or asking a question to use AI features!',
  };

  const Icon = icons[type] || icons.default;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="text-6xl text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">{messages[type]}</h3>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
