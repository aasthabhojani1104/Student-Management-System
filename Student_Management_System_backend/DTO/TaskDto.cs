namespace Student_Management_System.DTO
{
    public class TaskDto
    {
        public int      TaskId             { get; set; }
        public int      AllocationId       { get; set; }
        public string?  ProjectTitle       { get; set; }
        public string?  StudentName        { get; set; }
        public string   TaskTitle          { get; set; } = string.Empty;
        public string?  TaskDescription    { get; set; }
        public int      TaskStatus         { get; set; }
        public string?  StatusName         { get; set; }
        public string?  StatusCssClass     { get; set; }
        public int      PriorityId         { get; set; }
        public string?  PriorityName       { get; set; }
        public string?  PriorityCssClass   { get; set; }
        public decimal  AssignedScore      { get; set; }
        public decimal? EarnedScore        { get; set; }
        public decimal  ProgressPercentage { get; set; }
        public DateTime? StartDate         { get; set; }
        public DateTime? DueDate           { get; set; }
        public DateTime? CompletedDate     { get; set; }
        public string?  FacultyRemarks     { get; set; }
        public string?  StudentRemarks     { get; set; }
        public DateTime? CreatedAt         { get; set; }
        public DateTime? UpdatedAt         { get; set; }
    }
}
