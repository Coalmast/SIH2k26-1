import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';

export class Notification extends Model {
  static table = 'notifications';

  @text('remote_id') remoteId!: string;
  @text('type') type!: string;
  @text('priority') priority!: string;
  @text('title') title!: string;
  @text('message') message!: string;
  @text('target_user_id') targetUserId?: string;
  @text('mine_id') mineId?: string;
  @text('entity_type') entityType?: string;
  @text('entity_id') entityId?: string;
  @text('status') status!: string; // unread | read
  @date('read_at') readAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
  @text('sync_status') syncStatus!: string; // synced | pending_ack
}
