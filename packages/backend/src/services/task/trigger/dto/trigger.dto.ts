export class CreateTriggerDto {
  name!: string;
  taskName!: string;
  cron!: string;
  params?: any;
  description?: string;
  enabled?: boolean;
}

export class UpdateTriggerDto {
  cron?: string;
  params?: any;
  enabled?: boolean;
  description?: string;
}
