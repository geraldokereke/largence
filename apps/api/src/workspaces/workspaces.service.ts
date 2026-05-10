import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WorkspaceMemberRole, WorkspaceType } from '@prisma/client';
import { SlugUtil } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(data: {
    name: string;
    orgId: string;
    departmentId?: string;
    type: WorkspaceType;
    createdBy: string;
    jurisdictionProfile?: Prisma.InputJsonValue;
  }) {
    let slug = SlugUtil.generateSlug(data.name);

    // Check if slug already exists in this org
    const existing = await this.prisma.workspace.findUnique({
      where: { orgId_slug: { orgId: data.orgId, slug } },
    });

    if (existing) {
      slug = SlugUtil.appendSuffix(slug);
    }

    return this.prisma.$transaction(async tx => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug,
          orgId: data.orgId,
          departmentId: data.departmentId,
          type: data.type,
          createdBy: data.createdBy,
          jurisdictionProfile: data.jurisdictionProfile || {},
        },
      });

      // Automatically add creator as WORKSPACE_ADMIN
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: data.createdBy,
          role: WorkspaceMemberRole.WORKSPACE_ADMIN,
          addedBy: data.createdBy,
        },
      });

      return workspace;
    });
  }

  async getOrgWorkspaces(orgId: string) {
    return this.prisma.workspace.findMany({
      where: { orgId, status: 'ACTIVE' },
      include: {
        _count: { select: { matters: true, members: true } },
      },
    });
  }

  async getWorkspaceById(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            workspace: false,
          },
        },
        _count: { select: { matters: true } },
      },
    });

    if (!workspace) throw new NotFoundException('WORKSPACE_NOT_FOUND');
    return workspace;
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceMemberRole, addedBy: string) {
    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
        addedBy,
      },
    });
  }

  async removeMember(workspaceId: string, userId: string) {
    return this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
  }
}
