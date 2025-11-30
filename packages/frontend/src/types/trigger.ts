export interface TriggerVO {
  id: number;
  name: string;
  taskName: string;
  cron: string;
  params: Record<string, unknown>;
  description?: string;
  enabled: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTriggerDTO {
  name: string;
  taskName: string;
  cron: string;
  params?: Record<string, unknown>;
  description?: string;
  enabled?: boolean;
}

export interface UpdateTriggerDTO {
  name?: string;
  taskName?: string;
  cron?: string;
  params?: Record<string, unknown>;
  description?: string;
  enabled?: boolean;
}

export interface DeleteTriggerVO {
  success: boolean;
}
