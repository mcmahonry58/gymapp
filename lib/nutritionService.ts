import { supabase } from './supabase';

export interface MealEntry {
  meal_name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export async function saveMeal(entry: MealEntry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('nutrition_logs').insert({
    user_id: user.id,
    logged_date: today,
    meal_name: entry.meal_name,
    calories: entry.calories,
    protein_g: entry.protein_g,
    carbs_g: entry.carbs_g,
    fat_g: entry.fat_g,
  });

  if (error) throw error;
}
