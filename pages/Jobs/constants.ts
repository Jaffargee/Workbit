import { JobStatus } from "@/types/types";

export const STATUS_META: Record<JobStatus, { label: string; color: 'success' | 'warning' | 'danger' | 'subtle' | 'informative'; }> = {
      DRAFT:      { label: 'Draft',     color: 'subtle' },
      ACTIVE:     { label: 'Active',    color: 'success' },
      COMPLETED:  { label: 'Completed', color: 'informative' },
      EXPIRED:    { label: 'Expired',   color: 'danger' },
      CANCELLED:  { label: 'Cancelled', color: 'subtle' },
      PAUSED:  { label: 'Paused', color: 'warning' },
};

export const ALL_STATUSES: Array<JobStatus | 'ALL'> = ['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED', 'EXPIRED', 'CANCELLED'];
