import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createQuiz } from '../api/quiz';
import { generateQuiz } from '../api/ai';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { FaArrowLeft, FaMagic, FaSave, FaPlay } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';

const QuizCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions: preloadedQuestions, noteId } = location.state || {};
  const [questions, setQuestions] = useState(preloadedQuestions || []);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!noteId) {
      toast.error('No note selected');
      navigate('/quiz');
    }
  }, [noteId, navigate]);

  const handleGenerateQuiz = async () => {
    if (!noteId) return;

    setGenerating(true);
    try {
      const response = await generateQuiz(noteId);
      if (response.success) {
        setQuestions(response.data.quiz);
        toast.success('Quiz generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!questions || questions.length === 0) {
      toast.error('No questions to save');
      return;
    }

    setSaving(true);
    try {
      const response = await createQuiz({
        noteId,
        questions,
      });
      if (response.success) {
        toast.success('Quiz saved successfully');
        navigate(`/quiz/attempt/${response.data.quiz.id}`);
      }
    } catch (error) {
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!questions || questions.length === 0) {
      toast.error('No questions to attempt');
      return;
    }

    // Save quiz first, then navigate to attempt
    setSaving(true);
    try {
      const response = await createQuiz({
        noteId,
        questions,
      });
      if (response.success) {
        navigate(`/quiz/attempt/${response.data.quiz.id}`);
      }
    } catch (error) {
      toast.error('Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  if (!noteId) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/quiz')}>
            <FaArrowLeft className="mr-2" />
            Back to Quiz Center
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleGenerateQuiz}
              loading={generating}
              disabled={generating || saving}
              className="flex items-center space-x-2"
            >
              <FaMagic />
              <span>Generate Questions</span>
            </Button>
            {questions.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleSaveQuiz}
                  loading={saving}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <FaSave />
                  <span>Save Quiz</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStartQuiz}
                  loading={saving}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <FaPlay />
                  <span>Start Quiz</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quiz Preview */}
        {generating ? (
          <div className="flex justify-center items-center h-96">
            <Loader size="lg" text="Generating quiz questions..." />
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                {questions.length} questions generated. Review them below before starting the quiz.
              </p>
            </div>
            {questions.map((q, index) => (
              <Card key={index}>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">
                    Q{index + 1}: {q.question}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border ${
                          option === q.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                        {option}
                        {option === q.correctAnswer && (
                          <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <FaMagic className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Questions Yet</h3>
              <p className="text-gray-500 mb-4">
                Generate AI-powered quiz questions from your notes
              </p>
              <Button
                variant="primary"
                onClick={handleGenerateQuiz}
                loading={generating}
                disabled={generating}
              >
                <FaMagic className="mr-2" />
                Generate Questions
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default QuizCreate;
