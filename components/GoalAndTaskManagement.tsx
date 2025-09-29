
import React, { useState, useMemo } from 'react';
import { Goal, Task, TaskStatus } from '../types';
import { PlusIcon, TrashIcon, PencilIcon } from './icons';
import Card from './common/Card';
import Modal from './common/Modal';

// Using a constant for categories
const CATEGORIES = ["Mathematics", "Science", "History", "Literature", "Programming", "General"];

const GoalForm: React.FC<{
    onSave: (goal: Omit<Goal, 'id'> | Goal) => void;
    onClose: () => void;
    goalToEdit?: Goal | null;
    existingGoals: Goal[];
}> = ({ onSave, onClose, goalToEdit, existingGoals }) => {
    const [title, setTitle] = useState(goalToEdit?.title || '');
    const [description, setDescription] = useState(goalToEdit?.description || '');
    const [category, setCategory] = useState(goalToEdit?.category || CATEGORIES[0]);
    const [deadline, setDeadline] = useState(goalToEdit?.deadline ? goalToEdit.deadline.split('T')[0] : '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !deadline) {
            setError('Please fill in all required fields.');
            return;
        }
        if (existingGoals.some(g => g.title.toLowerCase() === title.trim().toLowerCase() && g.id !== goalToEdit?.id)) {
            setError('A goal with this title already exists.');
            return;
        }
        
        // Ensure date is handled as UTC to avoid timezone issues
        const [year, month, day] = deadline.split('-').map(Number);
        const utcDeadline = new Date(Date.UTC(year, month - 1, day));

        const newGoal = {
            ...goalToEdit,
            id: goalToEdit?.id || crypto.randomUUID(),
            title: title.trim(),
            description,
            category,
            deadline: utcDeadline.toISOString(),
        };
        onSave(newGoal);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Goal Title</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" required />
            </div>
            <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"></textarea>
            </div>
            <div>
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Category</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="deadline" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Deadline</label>
                <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="text-slate-500 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-slate-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Cancel</button>
                <button type="submit" className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Save Goal</button>
            </div>
        </form>
    );
};

const TaskForm: React.FC<{
    onSave: (task: Omit<Task, 'id' | 'goalId'> | Task) => void;
    onClose: () => void;
    taskToEdit?: Task | null;
    existingTasks: Task[];
}> = ({ onSave, onClose, taskToEdit, existingTasks }) => {
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
    const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status || TaskStatus.ToDo);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dueDate) {
            setError('Title and due date are required.');
            return;
        }
        if (existingTasks.some(t => t.title.toLowerCase() === title.trim().toLowerCase() && t.id !== taskToEdit?.id)) {
            setError('A task with this title already exists for this goal.');
            return;
        }

        // Ensure date is handled as UTC to avoid timezone issues
        const [year, month, day] = dueDate.split('-').map(Number);
        const utcDueDate = new Date(Date.UTC(year, month - 1, day));
        
        const newTask = {
            ...taskToEdit,
            id: taskToEdit?.id || crypto.randomUUID(),
            title: title.trim(),
            dueDate: utcDueDate.toISOString(),
            status,
        };
        onSave(newTask);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {error && <p className="text-red-500">{error}</p>}
            <div>
                <label htmlFor="task-title" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Task Title</label>
                <input type="text" id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" required />
            </div>
            <div>
                <label htmlFor="task-dueDate" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Due Date</label>
                <input type="date" id="task-dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" required />
            </div>
             <div>
                <label htmlFor="task-status" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Status</label>
                <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white">
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="text-slate-500 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-slate-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Cancel</button>
                <button type="submit" className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Save Task</button>
            </div>
        </form>
    );
}

const TaskItem: React.FC<{
    task: Task;
    onUpdate: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onEdit: (task: Task) => void;
}> = ({ task, onUpdate, onDelete, onEdit }) => {
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({ ...task, status: e.target.value as TaskStatus });
    };

    return (
        <li className="flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg group">
            <div className="flex items-center gap-3">
                 <select value={task.status} onChange={handleStatusChange} className="bg-transparent border-none text-slate-900 text-sm rounded-lg focus:ring-0 focus:border-0 block p-0 dark:text-white appearance-none cursor-pointer">
                    <option value={TaskStatus.ToDo}>To Do</option>
                    <option value={TaskStatus.InProgress}>In Progress</option>
                    <option value={TaskStatus.Completed}>Completed</option>
                </select>
                <div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{task.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(task)} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><PencilIcon className="w-4 h-4" /></button>
                <button onClick={() => onDelete(task.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><TrashIcon className="w-4 h-4" /></button>
            </div>
        </li>
    );
};


const GoalItem: React.FC<{
    goal: Goal;
    tasks: Task[];
    onAddTask: (goalId: string) => void;
    onUpdateTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onEditTask: (task: Task) => void;
    onEditGoal: (goal: Goal) => void;
    onDeleteGoal: (goalId: string) => void;
}> = ({ goal, tasks, onAddTask, onUpdateTask, onDeleteTask, onEditTask, onEditGoal, onDeleteGoal }) => {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return (
        <Card className="flex flex-col h-full">
             <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full text-primary-600 bg-primary-100 dark:text-primary-200 dark:bg-primary-900/50">
                        {goal.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 leading-tight">{goal.title}</h3>
                </div>
                <div className="flex gap-1">
                     <button onClick={() => onEditGoal(goal)} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><PencilIcon className="w-4 h-4"/></button>
                     <button onClick={() => onDeleteGoal(goal.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Deadline: {new Date(goal.deadline).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm mb-4 flex-grow">{goal.description}</p>
            
            <div className="mt-auto">
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Progress</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                        <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Tasks ({tasks.length})</h4>
                        <button onClick={() => onAddTask(goal.id)} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-semibold">
                            <PlusIcon className="w-4 h-4" /> Add Task
                        </button>
                    </div>
                    {tasks.length > 0 ? (
                        <ul className="space-y-1 -mx-2.5">
                            {tasks.map(task => (
                                <TaskItem key={task.id} task={task} onUpdate={onUpdateTask} onDelete={onDeleteTask} onEdit={onEditTask}/>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet. Add one!</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

const GoalAndTaskManagement: React.FC<{
    goals: Goal[];
    tasks: Task[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}> = ({ goals, tasks, setGoals, setTasks }) => {

    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
    
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);

    const handleAddGoal = () => {
        setGoalToEdit(null);
        setIsGoalModalOpen(true);
    };

    const handleEditGoal = (goal: Goal) => {
        setGoalToEdit(goal);
        setIsGoalModalOpen(true);
    }
    
    const handleDeleteGoal = (goalId: string) => {
        if(window.confirm('Are you sure you want to delete this goal and all its tasks?')) {
            setGoals(goals.filter(g => g.id !== goalId));
            setTasks(tasks.filter(t => t.goalId !== goalId));
        }
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id'> | Goal) => {
        if ('id' in goalData && goals.some(g => g.id === goalData.id)) {
            setGoals(goals.map(g => g.id === goalData.id ? { ...g, ...goalData } : g));
        } else {
            const newGoal: Goal = { ...goalData, id: crypto.randomUUID() };
            setGoals([...goals, newGoal]);
        }
    };

    const handleAddTask = (goalId: string) => {
        setCurrentGoalId(goalId);
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
    };
    
    const handleEditTask = (task: Task) => {
        setCurrentGoalId(task.goalId);
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    }

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };
    
    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    }

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'goalId'> | Task) => {
        if ('id' in taskData && tasks.some(t => t.id === taskData.id)) {
            handleUpdateTask(taskData as Task);
        } else if (currentGoalId) {
            const newTask: Task = { ...(taskData as Omit<Task, 'id' | 'goalId'>), id: crypto.randomUUID(), goalId: currentGoalId, status: TaskStatus.ToDo };
            setTasks([...tasks, newTask]);
        }
    };
    
    const sortedGoals = useMemo(() => {
        return [...goals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }, [goals]);
    
    const goalTasksForForm = useMemo(() => {
        if (!currentGoalId) return [];
        return tasks.filter(t => t.goalId === currentGoalId);
    }, [tasks, currentGoalId]);

    return (
        <div className="p-4 sm:p-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Study Goals</h2>
                <button onClick={handleAddGoal} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" /> New Goal
                </button>
            </div>

            {sortedGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedGoals.map(goal => (
                        <GoalItem
                            key={goal.id}
                            goal={goal}
                            tasks={tasks.filter(t => t.goalId === goal.id)}
                            onAddTask={handleAddTask}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            onEditTask={handleEditTask}
                            onEditGoal={handleEditGoal}
                            onDeleteGoal={handleDeleteGoal}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2.25 2.25 0 00-2.242-2.242H10.5a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25H4.5m15 0a2.25 2.25 0 00-2.25-2.25H4.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25H10.5a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25H4.5" /></svg>
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">No goals yet!</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new study goal.</p>
                    <div className="mt-6">
                        <button onClick={handleAddGoal} type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Create New Goal
                        </button>
                    </div>
                </div>
            )}
            
            <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title={goalToEdit ? "Edit Goal" : "Create New Goal"}>
                <GoalForm onSave={handleSaveGoal} onClose={() => setIsGoalModalOpen(false)} goalToEdit={goalToEdit} existingGoals={goals} />
            </Modal>
            
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={taskToEdit ? "Edit Task" : "Create New Task"}>
                <TaskForm onSave={handleSaveTask} onClose={() => setIsTaskModalOpen(false)} taskToEdit={taskToEdit} existingTasks={goalTasksForForm}/>
            </Modal>
        </div>
    );
};

export default GoalAndTaskManagement;
