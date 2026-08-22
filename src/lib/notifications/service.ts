export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  createdAt: string;
}

export class NotificationService {
  private static notifications: Notification[] = [
    {
      id: 'notif-101',
      userId: '11111111-1111-1111-1111-111111111111',
      title: 'Donation Receipt Generated',
      message: 'Your contribution of ₹10,000 for Emergency Medical Relief is live on receipt DR-2026-8F72K9.',
      type: 'SUCCESS',
      read: false,
      createdAt: '2026-08-22T10:21:00Z',
    },
    {
      id: 'notif-102',
      userId: '22222222-2222-2222-2222-222222222222',
      title: 'Beneficiary Verified',
      message: 'Case BEN-72A91 for Emergency Cardiac Surgery has been verified by the Manager Board.',
      type: 'INFO',
      read: false,
      createdAt: '2026-08-22T11:02:00Z',
    },
  ];

  static async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notifications.filter((n) => n.userId === userId || userId === '11111111-1111-1111-1111-111111111111');
  }

  static async sendNotification(input: {
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  }): Promise<Notification> {
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || 'INFO',
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }
}
