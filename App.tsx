
import React, { useState } from 'react';
import { Goal, Task, Exam } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import GoalAndTaskManagement from './components/GoalAndTaskManagement';
import ExamManagement from './components/ExamManagement';
import { ChartPieIcon, ListBulletIcon, CalendarDaysIcon, AcademicCapIcon } from './components/icons';

type View = 'dashboard' | 'goals' | 'timeline' | 'exams';

const App: React.FC = () => {
  const [goals, setGoals] = useLocalStorage<Goal[]>('study_goals', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('study_tasks', []);
  const [exams, setExams] = useLocalStorage<Exam[]>('study_exams', []);
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard goals={goals} tasks={tasks} exams={exams} />;
      case 'goals':
        return <GoalAndTaskManagement goals={goals} tasks={tasks} setGoals={setGoals} setTasks={setTasks} />;
      case 'timeline':
        return <Timeline goals={goals} tasks={tasks} />;
      case 'exams':
        return <ExamManagement exams={exams} setExams={setExams} />;
      default:
        return <Dashboard goals={goals} tasks={tasks} exams={exams} />;
    }
  };

  const NavButton: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
        activeView === view
          ? 'bg-primary-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="hidden sm:inline-block font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
              Smart Study Planner
            </h1>
            <nav className="flex items-center gap-2 sm:gap-3">
              <NavButton view="dashboard" label="Dashboard" icon={<ChartPieIcon className="w-5 h-5"/>} />
              <NavButton view="goals" label="Goals" icon={<ListBulletIcon className="w-5 h-5"/>} />
              <NavButton view="timeline" label="Timeline" icon={<CalendarDaysIcon className="w-5 h-5"/>} />
              <NavButton view="exams" label="Exams" icon={<AcademicCapIcon className="w-5 h-5"/>} />
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-screen-xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;