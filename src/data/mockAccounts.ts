import { AccountData } from '@/components/AccountCard';
import valorantImage from '@/assets/valorant-skins.jpg';
import minecraftImage from '@/assets/minecraft-character.jpg';
import csgoImage from '@/assets/csgo-weapons.jpg';

export const mockAccounts: AccountData[] = [
  // Valorant Accounts
  {
    id: 'val-1',
    game: 'valorant',
    title: 'Radiant Account - Prime Collection',
    price: 299,
    rank: 'Radiant',
    level: 250,
    featured: true,
    bundle: 'Prime 2.0 Bundle',
    image: valorantImage,
    skins: [
      { name: 'Prime Vandal', rarity: 'legendary' },
      { name: 'Prime Phantom', rarity: 'legendary' },
      { name: 'Prime Spectre', rarity: 'legendary' },
      { name: 'Reaver Operator', rarity: 'epic' },
      { name: 'Dragon Knife', rarity: 'legendary' },
    ],
  },
  {
    id: 'val-2',
    game: 'valorant',
    title: 'Immortal Smurf - Glitchpop',
    price: 189,
    rank: 'Immortal 2',
    level: 180,
    bundle: 'Glitchpop Bundle',
    image: valorantImage,
    skins: [
      { name: 'Glitchpop Vandal', rarity: 'epic' },
      { name: 'Glitchpop Phantom', rarity: 'epic' },
      { name: 'Ion Sheriff', rarity: 'epic' },
    ],
  },
  {
    id: 'val-3',
    game: 'valorant',
    title: 'Diamond Account - Elderflame',
    price: 125,
    rank: 'Diamond 3',
    level: 120,
    bundle: 'Elderflame Collection',
    image: valorantImage,
    skins: [
      { name: 'Elderflame Vandal', rarity: 'legendary' },
      { name: 'Elderflame Knife', rarity: 'legendary' },
    ],
  },

  // Minecraft Accounts
  {
    id: 'mc-1',
    game: 'minecraft',
    title: 'Premium Java + Bedrock',
    price: 45,
    level: 50,
    featured: true,
    bundle: 'Minecon Cape Collection',
    image: minecraftImage,
    skins: [
      { name: 'Minecon 2016 Cape', rarity: 'legendary' },
      { name: 'Pancape', rarity: 'rare' },
      { name: 'Translator Cape', rarity: 'epic' },
      { name: 'Cobalt Skin', rarity: 'rare' },
    ],
  },
  {
    id: 'mc-2',
    game: 'minecraft',
    title: 'OG Account - 2010 Join Date',
    price: 89,
    level: 80,
    bundle: 'Vintage Collection',
    image: minecraftImage,
    skins: [
      { name: 'Alpha Tester Cape', rarity: 'legendary' },
      { name: 'Classic Steve', rarity: 'common' },
    ],
  },
  {
    id: 'mc-3',
    game: 'minecraft',
    title: 'Hypixel VIP++ Account',
    price: 65,
    level: 120,
    bundle: 'Hypixel Exclusive',
    image: minecraftImage,
    skins: [
      { name: 'VIP Skin', rarity: 'epic' },
      { name: 'MVP++ Cosmetics', rarity: 'rare' },
      { name: 'Network Level Cape', rarity: 'rare' },
    ],
  },

  // CS:GO Accounts
  {
    id: 'csgo-1',
    game: 'csgo',
    title: 'Global Elite - Dragon Lore',
    price: 450,
    rank: 'Global Elite',
    level: 40,
    featured: true,
    bundle: 'Dragon Collection',
    image: csgoImage,
    skins: [
      { name: 'AWP Dragon Lore', rarity: 'legendary' },
      { name: 'AK-47 Fire Serpent', rarity: 'legendary' },
      { name: 'M4A4 Howl', rarity: 'legendary' },
      { name: 'Karambit Fade', rarity: 'legendary' },
    ],
  },
  {
    id: 'csgo-2',
    game: 'csgo',
    title: 'Supreme Master - Asiimov Set',
    price: 180,
    rank: 'Supreme Master First Class',
    level: 25,
    bundle: 'Asiimov Collection',
    image: csgoImage,
    skins: [
      { name: 'AWP Asiimov', rarity: 'epic' },
      { name: 'M4A4 Asiimov', rarity: 'epic' },
      { name: 'P250 Asiimov', rarity: 'rare' },
    ],
  },
  {
    id: 'csgo-3',
    game: 'csgo',
    title: 'Legendary Eagle - Knife Collection',
    price: 220,
    rank: 'Legendary Eagle Master',
    level: 30,
    bundle: 'Knife Paradise',
    image: csgoImage,
    skins: [
      { name: 'Butterfly Knife Doppler', rarity: 'legendary' },
      { name: 'AK-47 Redline', rarity: 'rare' },
      { name: 'USP-S Kill Confirmed', rarity: 'epic' },
    ],
  },
];