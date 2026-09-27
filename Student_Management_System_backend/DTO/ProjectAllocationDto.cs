namespace Student_Management_System.DTO
{
    public class ProjectAllocationDto
    {
        public int      AllocationId  { get; set; }
        public int      ProjectId     { get; set; }
        public string?  ProjectTitle  { get; set; }
        public int      StudentId     { get; set; }
        public string?  StudentName   { get; set; }
        public DateTime AssignedDate  { get; set; }
        public DateTime? CreatedAt    { get; set; }
    }
}
