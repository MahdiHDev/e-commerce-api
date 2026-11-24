import { UserRole } from "../../generated/enums";

export interface IRequestUser {
    userId: string;
    role: UserRole;
    email: string;
}
