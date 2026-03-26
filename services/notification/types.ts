export interface ParsedNotification {
  app: string;
  appLabel: string;
  title: string;
  text: string;
  date: string;
  amount: number;
  transactionTypeId: number;
}

export interface RawAndroidNotification {
  app?: string;
  text?: string;
  bigText?: string;
  title?: string;
  time?: string;
}

export interface QueueItem {
  app: string;
  appLabel: string;
  title: string;
  text: string;
  date: string;
  amount: string;
  transactionTypeId: string;
  savedAt: string;
}
