export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  displayOrder?: number;
  active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  displayOrder?: number;
  active?: boolean;
}
