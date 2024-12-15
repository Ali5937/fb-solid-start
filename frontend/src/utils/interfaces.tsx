export interface NewItem {
  id: string;
  coordinates: [number, number];
  images: string[];
  originalPrice: number;
  euroPrice: number;
  userId: string;
  firmId: string;
  realtorFeePercentage: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}
