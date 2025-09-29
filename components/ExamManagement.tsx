
import React, { useState } from 'react';
import { Exam } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, AcademicCapIcon } from './icons';
import Card from './common/Card';
import Modal from './common/Modal';

const ExamForm: React.FC<{
    onSave: (exam: Omit<Exam, 'id'> | Exam) => void;
    onClose: () => void;
    examToEdit?: Exam | null;
    existingExams: Exam[];
}> = ({ onSave, onClose, examToEdit, existingExams }) => {
    const [title, setTitle] = useState(examToEdit?.title || '');
    const [date, setDate] = useState(examToEdit?.date ? examToEdit.date.split('T')[0] : '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) {
            setError('Please fill in all fields.');
            return;
        }
        if (existingExams.some(e => e.title.toLowerCase() === title.trim().toLowerCase() && e.id !== examToEdit?.id)) {
            setError('An exam with this title already exists.');
            return;
        }
        
        // Ensure date is handled as UTC to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day));

        const newExam = {
            ...examToEdit,
            id: examToEdit?.id || crypto.randomUUID(),
            title: title.trim(),
            date: utcDate.toISOString(),
        };
        onSave(newExam);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="exam-title" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Exam Title</label>
                <input type="text" id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" required />
            </div>
            <div>
                <label htmlFor="exam-date" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Date</label>
                <input type="date" id="exam-date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="text-slate-500 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-slate-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Cancel</button>
                <button type="submit" className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Save Exam</button>
            </div>
        </form>
    );
};

const ExamManagement: React.FC<{
    exams: Exam[];
    setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
}> = ({ exams, setExams }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [examToEdit, setExamToEdit] = useState<Exam | null>(null);

    const handleAdd = () => {
        setExamToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (exam: Exam) => {
        setExamToEdit(exam);
        setIsModalOpen(true);
    };

    const handleDelete = (examId: string) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            setExams(exams.filter(e => e.id !== examId));
        }
    };

    const handleSave = (examData: Omit<Exam, 'id'> | Exam) => {
        if ('id' in examData && exams.some(e => e.id === examData.id)) {
            setExams(exams.map(e => (e.id === examData.id ? { ...e, ...examData } : e)));
        } else {
            const newExam: Exam = { ...examData, id: crypto.randomUUID() };
            setExams([...exams, newExam]);
        }
    };

    const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="p-4 sm:p-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Upcoming Exams</h2>
                <button onClick={handleAdd} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Exam
                </button>
            </div>
            {sortedExams.length > 0 ? (
                <Card className="p-0">
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {sortedExams.map(exam => {
                            const examDate = new Date(exam.date);
                            const now = new Date();
                            const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                            const isPast = examDate < today;

                            return (
                                <li key={exam.id} className="flex items-center justify-between p-4 sm:p-6 group">
                                    <div className={`flex items-center gap-4 ${isPast ? 'opacity-50' : ''}`}>
                                        <div className="flex flex-col text-center w-12">
                                            <span className="text-xs uppercase text-red-500 font-semibold">{examDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' })}</span>
                                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{examDate.getUTCDate()}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{exam.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{examDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(exam)} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(exam.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <AcademicCapIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">No exams scheduled</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by adding an upcoming exam.</p>
                    <div className="mt-6">
                        <button onClick={handleAdd} type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Add Exam
                        </button>
                    </div>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={examToEdit ? 'Edit Exam' : 'Add New Exam'}>
                <ExamForm onSave={handleSave} onClose={() => setIsModalOpen(false)} examToEdit={examToEdit} existingExams={exams} />
            </Modal>
        </div>
    );
};

export default ExamManagement;
