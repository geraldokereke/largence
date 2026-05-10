import { SetMetadata } from '@nestjs/common';

export const CHECK_TIER_KEY = 'check_tier';
export const CheckTier = (
  limitKey: 'activeWorkspaces' | 'activeMatters' | 'timeTracking' | 'billing',
) => SetMetadata(CHECK_TIER_KEY, limitKey);
