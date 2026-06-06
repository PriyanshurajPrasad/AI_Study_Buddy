import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteById, deleteNote } from '../api/notes';
import { summarizeNotes, generateQuiz, generateViva } from '../api/ai';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { FaArrowLeft, FaTrash, FaMagic, FaQuestionCircle, FaComments, FaFileAlt } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/helpers';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [vivaQuestions, setVivaQuestions] = useState(null);
  const [generatingViva, setGeneratingViva] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await getNoteById(id);
      if (response.success) {
        setNote(response.data.note);
        setSummary(response.data.note.summary || '');
      }
    } catch (error) {
      toast.error('Failed to load note');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const response = await summarizeNotes(id);
      if (response.success) {
        setSummary(response.data.summary);
        toast.success('Summary generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      const response = await generateQuiz(id);
      if (response.success) {
        // Navigate to quiz creation with generated questions
        navigate('/quiz/create', { state: { questions: response.data.quiz, noteId: id } });
      }
    } catch (error) {
      toast.error('Failed to generate quiz');
    }
  };

  const handleGenerateViva = async () => {
    setGeneratingViva(true);
    try {
      const response = await generateViva(id);
      if (response.success) {
        setVivaQuestions(response.data.vivaQuestions);
        setActiveTab('viva');
        toast.success('Viva questions generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate viva questions');
    } finally {
      setGeneratingViva(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await deleteNote(id);
      if (response.success) {
        toast.success('Note deleted successfully');
        navigate('/notes');
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <Loader size="lg" text="Loading note..." />
        </div>
      </MainLayout>
    );
  }

  if (!note) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Note not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/notes')}>
            <FaArrowLeft className="mr-2" />
            Back to Notes
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="mr-2" />
            Delete Note
          </Button>
        </div>

        {/* Note Title */}
        <Card>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-800">{note.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <FaFileAlt className="mr-1" />
                {note.originalFileName}
              </span>
              <span>Uploaded on {formatDateTime(note.createdAt)}</span>
            </div>
          </div>
        </Card>

        {/* AI Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={handleGenerateQuiz}
            className="flex items-center space-x-2"
          >
            <FaQuestionCircle />
            <span>Generate Quiz</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateViva}
            loading={generatingViva}
            disabled={generatingViva}
            className="flex items-center space-x-2"
          >
            <FaComments />
            <span>Generate Viva Questions</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateSummary}
            loading={generatingSummary}
            disabled={generatingSummary}
            className="flex items-center space-x-2"
          >
            <FaMagic />
            <span>Generate Summary</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Summary
            </button>
            {vivaQuestions && (
              <button
                onClick={() => setActiveTab('viva')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'viva'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Viva Questions
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <Card>
          {activeTab === 'content' && (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                {note.extractedText}
              </pre>
            </div>
          )}

          {activeTab === 'summary' && (
            <div>
              {summary ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">{summary}</pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaMagic className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No summary generated yet</p>
                  <Button
                    variant="primary"
                    onClick={handleGenerateSummary}
                    loading={generatingSummary}
                    disabled={generatingSummary}
                    className="mt-4"
                  >
                    Generate Summary
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'viva' && vivaQuestions && (
            <div className="space-y-4">
              {vivaQuestions.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Q{index + 1}: {item.question}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Answer:</span> {item.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default NoteDetail;
