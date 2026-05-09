import { OrgType } from "@prisma/client";
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    orgName: string;
    orgType: OrgType;
    isSandbox?: boolean;
}
