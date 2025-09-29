
import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Goal, Task, TaskStatus, Exam } from '../types';
import Card from './common/Card';
import { AcademicCapIcon, ListBulletIcon } from './icons';

const COLORS = {
  [TaskStatus.ToDo]: '#94a3b8',
  [TaskStatus.InProgress]: '#facc15',
  [TaskStatus.Completed]: '#4ade80',
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex items-center p-4">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </Card>
);

const Countdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents: React.ReactNode[] = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval as keyof typeof timeLeft] && Object.keys(timeLeft).length > 1 && interval !== 'seconds' ) { // Always show seconds if it's the only unit left
            return;
        }

        timerComponents.push(
            <div key={interval} className="text-center">
                <span className="text-2xl lg:text-3xl font-bold text-primary-600 dark:text-primary-400">{timeLeft[interval as keyof typeof timeLeft]}</span>
                <span className="block text-xs uppercase text-slate-500 dark:text-slate-400">{interval}</span>
            </div>
        );
    });
    
    return (
        <div className="flex justify-center gap-4 sm:gap-6">
            {timerComponents.length ? timerComponents.map((component, index) => (
                <React.Fragment key={index}>
                    {component}
                    {index < timerComponents.length - 1 && <span className="text-2xl lg:text-3xl font-light text-slate-300 dark:text-slate-600 self-center">:</span>}
                </React.Fragment>
            )) : <span className="text-xl font-bold text-slate-700 dark:text-slate-300">Exam day is here! Good luck!</span>}
        </div>
    );
};


const Dashboard: React.FC<{ goals: Goal[]; tasks: Task[]; exams: Exam[] }> = ({ goals, tasks, exams }) => {
  const taskStatusData = useMemo(() => {
    const counts = {
      [TaskStatus.ToDo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Completed]: 0,
    };
    tasks.forEach(task => {
      counts[task.status]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(task => task.status !== TaskStatus.Completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  const upcomingExam = useMemo(() => {
      const now = new Date();
      return exams
        .filter(exam => new Date(exam.date) >= now)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [exams]);

  const subjectProgressData = useMemo(() => {
      const subjectMap = new Map<string, { total: number, completed: number }>();
      goals.forEach(goal => {
          if (!subjectMap.has(goal.category)) {
              subjectMap.set(goal.category, { total: 0, completed: 0 });
          }
      });
      tasks.forEach(task => {
          const goal = goals.find(g => g.id === task.goalId);
          if (goal) {
              const subject = subjectMap.get(goal.category);
              if (subject) {
                  subject.total++;
                  if (task.status === TaskStatus.Completed) {
                      subject.completed++;
                  }
              }
          }
      });
      return Array.from(subjectMap.entries()).map(([name, data]) => ({ 
          name, 
          Completed: data.completed,
          Remaining: data.total - data.completed
       }));
  }, [goals, tasks]);


  const totalGoals = goals.length;
  const completedTasksCount = tasks.filter(t => t.status === TaskStatus.Completed).length;
  const inProgressTasksCount = tasks.filter(t => t.status === TaskStatus.InProgress).length;
  const toDoTasksCount = tasks.length - completedTasksCount - inProgressTasksCount;
  const overallProgress = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;

  return (
    <div className="p-4 sm:p-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Goals" value={totalGoals} icon={<ListBulletIcon className="w-6 h-6 text-blue-800 dark:text-blue-200" />} color="bg-blue-100 dark:bg-blue-900/50" />
            <StatCard title="Completed Tasks" value={completedTasksCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-800 dark:text-green-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>} color="bg-green-100 dark:bg-green-900/50" />
            <StatCard title="In Progress" value={inProgressTasksCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-800 dark:text-yellow-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992" /></svg>} color="bg-yellow-100 dark:bg-yellow-900/50" />
            <StatCard title="To Do" value={toDoTasksCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.15 2.25 2.25 0 0 0 2.25 2.25h1.5m-3.75-2.25a2.25 2.25 0 0 0-2.25-2.25a2.25 2.25 0 0 0-2.25 2.25v11.25c0 1.242 1.008 2.25 2.25 2.25h9.75a2.25 2.25 0 0 0 2.25-2.25V9.75a2.25 2.25 0 0 0-2.25-2.25h-4.5Z" /></svg>} color="bg-slate-100 dark:bg-slate-700" />
        </div>

        {upcomingExam && (
            <Card>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
                    Countdown to <span className="text-primary-600 dark:text-primary-400">{upcomingExam.title}</span>
                </h3>
                <Countdown targetDate={upcomingExam.date} />
            </Card>
        )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Overall Progress</h3>
            <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(overallProgress)}%</span>
            </div>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {completedTasksCount} of {tasks.length} tasks completed across {totalGoals} goals.
            </p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Task Status Breakdown</h3>
          {taskStatusData.length > 0 ? (
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as TaskStatus]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.75rem' }}/>
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          ) : <p className="text-slate-500 dark:text-slate-400 text-center py-10">No tasks to display.</p>}
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Subject Progress</h3>
          {subjectProgressData.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
               <BarChart data={subjectProgressData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" darkStroke="#374151" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }}/>
                    <Tooltip cursor={{fill: 'rgba(219, 234, 254, 0.5)'}} contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.75rem' }}/>
                    <Legend iconType="circle" />
                    <Bar dataKey="Completed" stackId="a" fill="#1d4ed8" radius={[4, 4, 4, 4]} />
                    <Bar dataKey="Remaining" stackId="a" fill="#93c5fd" radius={[4, 4, 4, 4]}/>
                </BarChart>
            </ResponsiveContainer>
          </div>
          ) : <p className="text-slate-500 dark:text-slate-400 text-center py-10">Create goals with categories to see progress here.</p>}
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Upcoming Tasks</h3>
          {upcomingTasks.length > 0 ? (
            <ul className="space-y-3">
              {upcomingTasks.map(task => {
                  const goal = goals.find(g => g.id === task.goalId);
                  
                  // Use UTC for calculations to avoid timezone issues
                  const now = new Date();
                  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                  const dueDate = new Date(task.dueDate);
                  
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
                  
                  let dueText, dueColor;
                  if (diffDays < 0) {
                      dueText = 'Overdue';
                      dueColor = 'text-red-500';
                  } else if (diffDays === 0) {
                      dueText = 'Today';
                      dueColor = 'text-amber-500';
                  } else if (diffDays === 1) {
                      dueText = 'Tomorrow';
                      dueColor = 'text-sky-500';
                  } else {
                      dueText = `${diffDays} days left`;
                      dueColor = 'text-slate-500 dark:text-slate-400';
                  }
                  
                  return (
                    <li key={task.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{goal?.title || 'General'}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                           <span className={`font-semibold text-sm ${dueColor}`}>
                            {dueText}
                           </span>
                           <span className={`block text-xs font-semibold uppercase px-2 py-0.5 rounded-full mt-1 ${
                               task.status === TaskStatus.ToDo ? 'bg-slate-200 text-slate-800' : 'bg-yellow-200 text-yellow-800'
                           }`}>{task.status}</span>
                        </div>
                    </li>
                  )
                })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-slate-500 dark:text-slate-400 mt-2">No upcoming tasks. You're all caught up!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
