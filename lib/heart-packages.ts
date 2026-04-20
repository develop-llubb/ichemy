export const HEART_UNIT_PRICE = 19000;

export type HeartPackageKey = "hearts_1" | "hearts_3" | "hearts_5";

export interface HeartPackage {
  key: HeartPackageKey;
  hearts: number;
  price: number;
  discountPercent: number;
  perHeart: number;
}

export const HEART_PACKAGES: Record<HeartPackageKey, HeartPackage> = {
  hearts_1: {
    key: "hearts_1",
    hearts: 1,
    price: 19000,
    discountPercent: 0,
    perHeart: 19000,
  },
  hearts_3: {
    key: "hearts_3",
    hearts: 3,
    price: 51000,
    discountPercent: 10,
    perHeart: 17000,
  },
  hearts_5: {
    key: "hearts_5",
    hearts: 5,
    price: 76000,
    discountPercent: 20,
    perHeart: 15200,
  },
};

export const HEART_PACKAGE_LIST: HeartPackage[] = [
  HEART_PACKAGES.hearts_1,
  HEART_PACKAGES.hearts_3,
  HEART_PACKAGES.hearts_5,
];

export function isHeartPackageKey(value: string): value is HeartPackageKey {
  return value in HEART_PACKAGES;
}
