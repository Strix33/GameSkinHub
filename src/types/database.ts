export interface AccountData {
  id: string;
  title: string;
  game: string;
  price: number;
  bundle?: string;
  featured: boolean;
  image_url?: string;
  skins: SkinData[];
}

export interface SkinData {
  id: string;
  name: string;
  rarity?: string;
}