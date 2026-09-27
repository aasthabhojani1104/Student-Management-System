export interface User {
  userId:             number;
  fullName:           string;
  email:              string;
  password?:          string;
  mobileNumber?:      string;
  profilePicturePath?: string;
  isActive:           boolean;
  isDeleted?:         boolean;
  roleId?:            number;
  roleName?:          string;
  createdAt?:         string;
  updatedAt?:         string;
}
