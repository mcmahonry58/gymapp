export interface Movement {
  id: string;
  name: string;
  description: string | null;
  muscle_groups: string[];
  equipment: string[];
  is_member_only: boolean;
}
