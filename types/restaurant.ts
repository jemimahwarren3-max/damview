export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
}
