'use client';

import { useState } from 'react';

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const SkeletonRow = () => (
  <tr>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="animate-pulse bg-gray-200 h-4 rounded" />
      </td>
    ))}
  </tr>
);

export default function ProductTable({ products, onEdit, onDelete, isLoading }) {
  const [confirmSlug, setConfirmSlug] = useState(null);

  const getMinPrice = (variants) => {
    if (!variants || variants.length === 0) return null;
    const prices = variants.map((v) => Number(v.price)).filter((p) => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const isActive = (variants) =>
    variants?.some((v) => v.available === true && Number(v.stock) > 0);

  const getCategoryNames = (category) => {
    if (!category || category.length === 0) return '—';
    return category.map((c) => c.name).join(', ');
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table aria-label="Products table" className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['#', 'Name', 'Category', 'Price (₹)', 'Variants', 'Status', 'Actions'].map((col) => (
              <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No products found
              </td>
            </tr>
          ) : (
            products.map((product, idx) => {
              const minPrice = getMinPrice(product.variants);
              const active = isActive(product.variants);
              return (
                <>
                  <tr key={product.slug} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.title || product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{getCategoryNames(product.category)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {minPrice !== null ? `₹${minPrice}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{product.variants?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label="Edit product"
                          onClick={() => onEdit(product.slug)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          aria-label="Delete product"
                          onClick={() => setConfirmSlug(product.slug)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {confirmSlug === product.slug && (
                    <tr key={`confirm-${product.slug}`} className="bg-red-50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-red-700 font-medium">Deactivate this product?</span>
                          <button
                            onClick={() => { onDelete(product.slug); setConfirmSlug(null); }}
                            className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmSlug(null)}
                            className="px-3 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
