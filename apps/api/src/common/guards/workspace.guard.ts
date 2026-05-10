import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;
    const body = request.body as Record<string, unknown>;
    const workspaceId = (request.params.id as string) || (body.workspaceId as string);

    if (!workspaceId) return true;

    // Platform Admins and Org Admins bypass workspace-level isolation
    if (user.roles.includes(Role.ORG_ADMIN) || user.roles.includes(Role.PLATFORM_ADMIN)) {
      return true;
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('WORKSPACE_ACCESS_DENIED');
    }

    // Attach workspace role to request for later use in controllers
    request.workspaceRole = membership.role;

    return true;
  }
}
