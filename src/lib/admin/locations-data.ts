import type { City, Governorate } from "@/lib/admin/locations-types";

export const GOVERNORATES: Governorate[] = [
  { id: 1, name_ar: "القاهرة", name_en: "Cairo", code: "CAI", is_active: 1, cities_count: 3 },
  { id: 2, name_ar: "الجيزة", name_en: "Giza", code: "GIZ", is_active: 1, cities_count: 2 },
  { id: 3, name_ar: "الإسكندرية", name_en: "Alexandria", code: "ALX", is_active: 1, cities_count: 2 },
  { id: 4, name_ar: "أسيوط", name_en: "Assiut", code: "AST", is_active: 0, cities_count: 1 },
];

export const CITIES: City[] = [
  { id: 1, name_ar: "مدينة نصر", name_en: "Nasr City", code: "NSR", governorate_id: 1, governorate_name: "القاهرة", is_active: 1 },
  { id: 2, name_ar: "المعادي", name_en: "Maadi", code: "MAD", governorate_id: 1, governorate_name: "القاهرة", is_active: 1 },
  { id: 3, name_ar: "مصر الجديدة", name_en: "Heliopolis", code: "HLN", governorate_id: 1, governorate_name: "القاهرة", is_active: 1 },
  { id: 4, name_ar: "المهندسين", name_en: "Mohandessin", code: "MOH", governorate_id: 2, governorate_name: "الجيزة", is_active: 1 },
  { id: 5, name_ar: "6 أكتوبر", name_en: "6th of October", code: "OCT", governorate_id: 2, governorate_name: "الجيزة", is_active: 1 },
  { id: 6, name_ar: "سيدي جابر", name_en: "Sidi Gaber", code: "SDG", governorate_id: 3, governorate_name: "الإسكندرية", is_active: 1 },
  { id: 7, name_ar: "المنتزه", name_en: "Montaza", code: "MNT", governorate_id: 3, governorate_name: "الإسكندرية", is_active: 0 },
  { id: 8, name_ar: "مركز أسيوط", name_en: "Assiut Center", code: "ASC", governorate_id: 4, governorate_name: "أسيوط", is_active: 0 },
];
