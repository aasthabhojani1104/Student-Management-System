export interface Project {
  projectId: number;
  projectTitle: string;
  description?: string;
  studentId: number;
  studentName?: string;
  allocationId?: number;
  facultyId: number;
  facultyName?: string;
  assignedDate: string;
  isDeleted?: boolean;
  projectStatus: number;
  statusName?: string;
  statusCssClass?: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}
