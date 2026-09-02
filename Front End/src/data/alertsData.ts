import { AlertItem } from '../types';

export const initialAlerts: AlertItem[] = [
  {
    id: 'alert-001',
    title: 'Morning Medicine Confirmed',
    message: 'Asha took Amlodipine (5mg) on time at 08:35 AM.',
    type: 'info',
    timestamp: 'Today at 08:35 AM',
    isAcknowledged: true,
    category: 'medication',
    actionLabel: 'View Log',
  },
  {
    id: 'alert-002',
    title: 'Cognitive Activity Completed',
    message: 'Asha finished Assam Heritage Memory Match with 100% accuracy in 2m 14s.',
    type: 'info',
    timestamp: 'Today at 10:42 AM',
    isAcknowledged: true,
    category: 'cognition',
    actionLabel: 'Review Performance',
  },
  {
    id: 'alert-003',
    title: 'Evening Donepezil Due Soon',
    message: 'Evening dose is scheduled for 08:00 PM. Automated gentle audio reminder queued.',
    type: 'reminder',
    timestamp: 'Scheduled for 08:00 PM',
    isAcknowledged: false,
    category: 'medication',
    actionLabel: 'Send Reminder',
  },
  {
    id: 'alert-004',
    title: 'Doctor Appointment Tomorrow',
    message: 'Routine follow-up with Dr. N. Barua (Neurology) scheduled tomorrow at 10:30 AM.',
    type: 'reminder',
    timestamp: 'Tomorrow, 10:30 AM',
    isAcknowledged: false,
    category: 'appointment',
    actionLabel: 'View Appointment',
  },
  {
    id: 'alert-005',
    title: 'Pattern Sequencing Trend',
    message: 'AI detected a 15% improvement in visual pattern recognition compared to last week baseline.',
    type: 'info',
    timestamp: 'Yesterday at 06:15 PM',
    isAcknowledged: false,
    category: 'cognition',
    actionLabel: 'See AI Insight',
  }
];
