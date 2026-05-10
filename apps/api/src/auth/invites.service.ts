import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, UserTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { AcceptInviteDto, InviteUserDto } from './dto/invite.dto';
import { EmailService } from './email.service';
import { PasswordService } from './password.service';

@Injectable()
export class InvitesService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
    private emailService: EmailService,
    private passwordService: PasswordService,
  ) {}

  async createInvite(dto: InviteUserDto, orgId: string, invitedBy: string) {
    // Check if user already exists in the system
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('USER_ALREADY_REGISTERED');
    }

    // Check if there is already an active invite
    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email: dto.email,
        orgId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new ConflictException('INVITE_ALREADY_PENDING');
    }

    const token = this.crypto.generateSecureToken(32);
    const tokenHash = this.crypto.hashSha256(token);

    const invite = await this.prisma.invite.create({
      data: {
        email: dto.email,
        role: dto.role,
        orgId,
        invitedBy,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: { org: true },
    });

    await this.emailService.sendInviteEmail(dto.email, token, invite.org.name, invite.org.slug);

    return { message: 'INVITE_SENT_SUCCESSFULLY' };
  }

  async getInviteByToken(token: string) {
    const tokenHash = this.crypto.hashSha256(token);
    const invite = await this.prisma.invite.findUnique({
      where: { tokenHash },
      include: { org: true },
    });

    if (!invite || invite.expiresAt < new Date() || invite.acceptedAt) {
      throw new NotFoundException('INVALID_OR_EXPIRED_INVITE');
    }

    return {
      email: invite.email,
      orgName: invite.org.name,
      role: invite.role,
    };
  }

  async acceptInvite(token: string, dto: AcceptInviteDto) {
    const tokenHash = this.crypto.hashSha256(token);
    const invite = await this.prisma.invite.findUnique({
      where: { tokenHash },
      include: { org: true },
    });

    if (!invite || invite.expiresAt < new Date() || invite.acceptedAt) {
      throw new BadRequestException('INVALID_OR_EXPIRED_INVITE');
    }

    this.passwordService.validateStrength(dto.password, [
      dto.firstName,
      dto.lastName,
      invite.org.name,
    ]);
    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.prisma.$transaction(async tx => {
      const newUser = await tx.user.create({
        data: {
          email: invite.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          orgId: invite.orgId,
          roles: [invite.role as Role],
          tier: UserTier.EDGE,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return newUser;
    });

    return { message: 'INVITE_ACCEPTED_SUCCESSFULLY', userId: user.id };
  }
}
