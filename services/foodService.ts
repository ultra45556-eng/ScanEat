
import { FoodProduct } from '../types';

export const fetchProductData = async (barcode: string): Promise<FoodProduct | null> => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1) {
      return data.product as FoodProduct;
    }
    return null;
  } catch (error) {
    console.error('Error fetching food data:', error);
    return null;
  }
};
