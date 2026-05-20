'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import {
  fetchAdminProductsThunk,
  fetchCategoriesThunk,
  fetchProductBySlugThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  setFilters,
} from '../../redux/slices/adminProductsSlice';
import { addToast } from '../../redux/toastSlice';

import ProductTable from '../../../../components/admin/products/ProductTable';
import ProductFilters from '../../../../components/admin/products/ProductFilters';
import ProductForm from '../../../../components/admin/products/ProductForm';
import Pagination from '../../../../components/admin/products/Pagination';

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const userState = useSelector((state) => state.user);
  const { products, selectedProduct, categories, pagination, filters, status } = useSelector(
    (state) => state.adminProducts
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth guard — redirect non-staff users after user state is resolved
  useEffect(() => {
    if (userState.status !== 'idle' && userState.status !== 'loading') {
      if (!userState.user?.is_staff) {
        router.replace('/');
      }
    }
  }, [userState.status, userState.user, router]);

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchAdminProductsThunk({}));
  }, [dispatch]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchAdminProductsThunk(newFilters));
  };

  const handlePageChange = (page) => {
    dispatch(fetchAdminProductsThunk({ ...filters, page }));
  };

  const handleEdit = (slug) => {
    dispatch(fetchProductBySlugThunk(slug));
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (slug) => {
    try {
      await dispatch(deleteProductThunk(slug)).unwrap();
      dispatch(addToast({ message: 'Product deleted successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: err || 'Failed to delete product', type: 'error' }));
    }
  };

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dispatch(updateProductThunk({ slug: selectedProduct.slug, data: payload })).unwrap();
        dispatch(addToast({ message: 'Product updated successfully', type: 'success' }));
      } else {
        await dispatch(createProductThunk(payload)).unwrap();
        dispatch(addToast({ message: 'Product created successfully', type: 'success' }));
      }
      setIsModalOpen(false);
      dispatch(fetchAdminProductsThunk(filters));
    } catch (err) {
      dispatch(addToast({ message: err || 'Failed to save product', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <ProductFilters
        filters={filters}
        categories={categories}
        onChange={handleFilterChange}
      />

      {/* Table */}
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={status === 'loading'}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <ProductForm
              initialData={isEditing ? selectedProduct : undefined}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}


