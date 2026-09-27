export interface Task {
  taskId: number;
  projectId: number;
  projectTitle?: string;
  taskTitle: string;
  taskDescription?: string;
  taskStatus: number;
  statusName?: string;
  statusCssClass?: string;
  priorityId: number;
  priorityName?: string;
  priorityCssClass?: string;
  assignedScore?: number;
  earnedScore?: number;
  progressPercentage: number;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  facultyRemarks?: string;
  studentRemarks?: string;
  isDeleted?: boolean;
  assignedStudentId?: number;
  assignedStudentName?: string;
}
