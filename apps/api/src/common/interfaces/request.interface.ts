import { Role, WorkspaceMemberRole } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  orgId: string;
  roles: Role[];
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  workspaceRole?: WorkspaceMemberRole;
}
