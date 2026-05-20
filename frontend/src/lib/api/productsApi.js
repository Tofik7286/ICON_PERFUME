import axiosInstance from '../axiosInstance';

export async function fetchAdminProducts(filters = {}) {
  const response = await axiosInstance.get('/products/admin/', { params: filters });
  return response.data.data;
}

export async function fetchProductBySlug(slug) {
  const response = await axiosInstance.get(`/products/admin/${slug}/`);
  return response.data.data;
}

export async function createProduct(data) {
  const response = await axiosInstance.post('/products/admin/', data);
  return response.data.data;
}

export async function updateProduct(slug, data) {
  const response = await axiosInstance.patch(`/products/admin/${slug}/`, data);
  return response.data.data;
}

export async function deleteProduct(slug) {
  const response = await axiosInstance.delete(`/products/admin/${slug}/`);
  return response.data.data;
}

export async function updateVariant(slug, variantId, data) {
  const response = await axiosInstance.patch(
    `/products/admin/${slug}/variants/${variantId}/`,
    data
  );
  return response.data.data;
}

export async function fetchCategories() {
  const response = await axiosInstance.get('/categories/tree/');
  return response.data.data;
}
