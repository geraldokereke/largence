import { PrismaService } from '../prisma/prisma.service';
import { OrgType, OrgTier, OnboardingMode } from "@prisma/client";
export declare class OnboardingService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrganisation(data: {
        name: string;
        type: OrgType;
        tier: OrgTier;
        onboardingMode: OnboardingMode;
    }): Promise<{
        type: import("@prisma/client").$Enums.OrgType;
        slug: string;
        tier: import("@prisma/client").$Enums.OrgTier;
        id: string;
        createdAt: Date;
        name: string;
        metadata: import("src/prisma/client/runtime/library").JsonValue | null;
        isSandbox: boolean;
        onboardingMode: import("@prisma/client").$Enums.OnboardingMode;
        mfaRequired: boolean;
        trialEndsAt: Date | null;
        scimEnabled: boolean;
        scimApiKey: string | null;
        dataResidency: string;
        isActive: boolean;
        updatedAt: Date;
    }>;
}
