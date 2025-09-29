
export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string; // ISO date string
}

export interface Task {
  id:string;
  goalId: string;
  title: string;
  dueDate: string; // ISO date string
  status: TaskStatus;
}

export interface Exam {
  id: string;
  title: string;
  date: string; // ISO date string
}
