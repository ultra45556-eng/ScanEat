
export interface FoodProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  quantity?: string;
  ingredients_text?: string;
  allergens?: string;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  countries?: string;
  nutriments?: {
    energy_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    salt_100g?: number;
    proteins_100g?: number;
  };
}

export interface ScanResult {
  id: string;
  data: string;
  timestamp: number;
  type: 'url' | 'text' | 'barcode' | 'wifi' | 'contact';
  foodProduct?: FoodProduct;
  isFavorite?: boolean;
}

export enum AppTab {
  SCAN = 'SCAN',
  HISTORY = 'HISTORY',
  FAVORITES = 'FAVORITES',
  SETTINGS = 'SETTINGS'
}

export interface AppSettings {
  vibrate: boolean;
  beep: boolean;
  autoOpenUrl: boolean;
  aiAnalysis: boolean;
}
