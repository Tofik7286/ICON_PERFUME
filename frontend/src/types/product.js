/**
 * @typedef {{ id: number, name: string }} Note
 *
 * @typedef {{ id: number, name: string, slug: string, parent: number | null }} ProductCategory
 *
 * @typedef {{
 *   id: number,
 *   size: string,
 *   concentration: string,
 *   price: number,
 *   stock: number,
 *   sku: string
 * }} ProductVariant
 *
 * @typedef {{
 *   id: number,
 *   name: string,
 *   slug: string,
 *   thumbnail: string,
 *   category: ProductCategory,
 *   base_price: number,
 *   is_active: boolean,
 *   created_at: string,
 *   variant_count: number
 * }} Product
 *
 * @typedef {Product & {
 *   variants: ProductVariant[],
 *   notes: Note[],
 *   description: string
 * }} ProductDetail
 *
 * @typedef {{
 *   name: string,
 *   description: string,
 *   category_id: number,
 *   variants: Omit<ProductVariant, 'id'>[],
 *   notes: number[]
 * }} CreateProductPayload
 *
 * @typedef {{
 *   results: ProductDetail[],
 *   count: number,
 *   total_pages: number,
 *   current_page: number
 * }} PaginatedProducts
 *
 * @typedef {{
 *   category?: string,
 *   search?: string,
 *   is_active?: boolean,
 *   page?: number
 * }} ProductFilters
 */
