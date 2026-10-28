import Phaser from 'phaser';

/** Kênh sự kiện chung giữa React và các scene Phaser. Tên sự kiện ở protocol.ts. */
export const EventBus = new Phaser.Events.EventEmitter();
