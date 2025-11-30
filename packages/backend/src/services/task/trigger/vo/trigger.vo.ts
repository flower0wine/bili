export class TriggerVo {
  id!: number;
  name!: string;
  taskName!: string;
  cron!: string;
  params?: any;
  enabled!: boolean;
  description?: string;
  source!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
