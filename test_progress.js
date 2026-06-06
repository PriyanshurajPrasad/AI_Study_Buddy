// Test script to simulate quiz completion and verify progress tracking
const testResult = {
  id: Date.now().toString(),
  quizId: "test-quiz-123",
  subject: "Physics",
  topic: "Newton's Laws",
  title: "Newton's Laws Quiz",
  score: 2,
  totalQuestions: 10,
  correctAnswers: 2,
  wrongAnswers: 8,
  percentage: 20,
  completedAt: new Date().toISOString(),
  answers: ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"]
};

console.log("Test Quiz Result:");
console.log(testResult);

// Save to localStorage
const oldResults = JSON.parse(localStorage.getItem("quizResults") || "[]");
const updatedResults = [testResult, ...oldResults];
localStorage.setItem("quizResults", JSON.stringify(updatedResults));

console.log("Result saved to localStorage");
console.log("Total quiz results:", updatedResults.length);

// Calculate stats
const totalQuizzes = updatedResults.length;
const totalQuestions = updatedResults.reduce((sum, r) => sum + Number(r.totalQuestions || 0), 0);
const totalCorrect = updatedResults.reduce((sum, r) => sum + Number(r.correctAnswers || 0), 0);
const averageScore = totalQuestions > 0
  ? Math.round((totalCorrect / totalQuestions) * 100)
  : 0;

console.log("Calculated Stats:");
console.log("Total Quizzes:", totalQuizzes);
console.log("Total Questions:", totalQuestions);
console.log("Total Correct:", totalCorrect);
console.log("Average Score:", averageScore + "%");
console.log("Completed Topics:", [...new Set(updatedResults.map(r => r.topic).filter(Boolean))]);

// Dispatch event for live update
window.dispatchEvent(new Event("quizResultSaved"));
console.log("Dispatched quizResultSaved event");

console.log("\n✓ Test completed. Check Progress page for live updates.");