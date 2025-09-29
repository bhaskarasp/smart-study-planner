
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Goal, Task } from '../types';
import Card from './common/Card';
import { CalendarDaysIcon } from './icons';

const Timeline: React.FC<{ goals: Goal[]; tasks: Task[] }> = ({ goals, tasks }) => {
  const timelineData = useMemo(() => {
    if (goals.length === 0) return [];
    
    const sortedGoals = [...goals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    
    return sortedGoals.map(goal => {
      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      
      // Use UTC for calculations to avoid timezone issues
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const deadline = new Date(goal.deadline);
      const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const completedTasks = goalTasks.filter(t => t.status === 'Completed').length;
      const remainingTasks = goalTasks.length - completedTasks;

      return {
        name: goal.title.length > 20 ? `${goal.title.substring(0, 20)}...` : goal.title,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        completedTasks,
        remainingTasks,
      };
    });
  }, [goals, tasks]);

  if (goals.length === 0) {
      return (
          <div className="p-4 sm:p-0 text-center text-slate-500 dark:text-slate-400">
               <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">Timeline</h2>
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <CalendarDaysIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">No Goals to Display</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add some goals to see your study timeline.</p>
                </div>
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-0 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">Goals Deadline Timeline</h2>
        <Card>
          <div style={{ width: '100%', height: goals.length * 50 + 50, minHeight: 250 }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={timelineData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit=" days" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }}/>
                <Tooltip
                  formatter={(value, name, props) => [`${value} days`, 'Days Remaining']}
                  contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="daysRemaining" fill="#3b82f6" name="Days Remaining to Deadline" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">Task Progress per Goal</h2>
         <Card>
          <div style={{ width: '100%', height: goals.length * 60 + 50, minHeight: 250 }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={timelineData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }}/>
                <Tooltip contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                  }}/>
                <Legend iconType="circle" />
                <Bar dataKey="remainingTasks" stackId="a" fill="#93c5fd" name="Remaining Tasks" />
                <Bar dataKey="completedTasks" stackId="a" fill="#1d4ed8" name="Completed Tasks" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Timeline;
