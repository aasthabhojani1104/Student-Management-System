namespace Student_Management_System.DTO
{
    public class UserDto
    {
        public int     UserId             { get; set; }
        public string  FullName           { get; set; } = string.Empty;
        public string  Email              { get; set; } = string.Empty;
        public string? Password           { get; set; }
        public string  MobileNumber       { get; set; } = string.Empty;
        public string? ProfilePicturePath { get; set; }
        public bool    IsActive           { get; set; } = true;
        public int?    RoleId             { get; set; }
        public string? RoleName           { get; set; }
        public DateTime? CreatedAt        { get; set; }
        public DateTime? UpdatedAt        { get; set; }
    }
}
