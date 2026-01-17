export interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  occupation: string | null;
  referral_code: string | null;
  invitations_count: number;
  notifications_enabled: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Skane {
  id: string;
  user_id: string;
  internal_state: 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED';
  signal_label: string;
  skane_index: number;
  micro_action_id: string;
  micro_action_completed: boolean;
  feedback: 'better' | 'same' | 'worse' | null;
  amplifier_used: string | null;
  is_guest_mode: boolean;
  created_at: string;
}

export interface RecentSkane {
  id: string;
  internal_state: 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED';
  signal_label: string;
  skane_index: number;
  created_at: string;
  timeLabel: string; // "Today - 14:34", "Yesterday", "2 days ago"
}
