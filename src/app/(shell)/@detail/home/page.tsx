import { HomeSlider, type HomeSlide } from '@/components/home-slider';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type SliderRow = {
  id: string | number;
  photo_url: string;
  url: string;
};

export default async function HomeDetailSlot() {
  void HomeSlider;
  void createClient;
  return null;
}
