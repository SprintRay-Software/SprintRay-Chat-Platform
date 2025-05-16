import { UserPersonalInfo } from './user-personal-info';
import { UserBusinessInfo } from './user-business-info';

export interface UserProfile {
    personalInfo: UserPersonalInfo;
    businessInfo: UserBusinessInfo;
    role: string;
    registrationCompleted: boolean;
}
