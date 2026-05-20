'use client';

import { useState } from 'react';

const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default function ProductForm({ initialData, categories, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    is_active: initialData?.is_active ?? true,
    category_ids: initialData?.category?.map((c) => c.id) || [],
    variant_data:
      initialData?.variants?.length > 0
        ? initialData.variants.map((v) => ({
            price: v.price,
            discounted_price: v.discounted_price,
            stock: v.stock,
            available: v.available ?? true,
          }))
        : [{ price: '', discounted_price: '', stock: '', available: true }],
  });
  const [errors, setErrors] = useState({});

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleCategory = (id) => {
    setField(
      'category_ids',
      form.category_ids.includes(id)
        ? form.category_ids.filter((c) => c !== id)
        : [...form.category_ids, id]
    );
  };

  const setVariantField = (i, key, value) => {
    const updated = form.variant_data.map((v, idx) =>
      idx === i ? { ...v, [key]: value } : v
    );
    setField('variant_data', updated);
  };

  const addVariant = () =>
    setField('variant_data', [
      ...form.variant_data,
      { price: '', discounted_price: '', stock: '', available: true },
    ]);

  const removeVariant = (i) =>
    setField(
      'variant_data',
      form.variant_data.filter((_, idx) => idx !== i)
    );

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.category_ids.length === 0) errs.category_ids = 'Select at least one category';
    form.variant_data.forEach((v, i) => {
      if (!v.price || Number(v.price) <= 0)
        errs[`variant_${i}_price`] = 'Price must be greater than 0';
      if (v.stock === '' || Number(v.stock) < 0)
        errs[`variant_${i}_stock`] = 'Stock must be 0 or more';
    });
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit({
      title: form.title,
      description: form.description,
      is_active: form.is_active,
      category_ids: form.category_ids,
      variant_data: form.variant_data.map((v) => ({
        ...v,
        price: Number(v.price),
        discounted_price: v.discounted_price !== '' ? Number(v.discounted_price) : null,
        stock: Number(v.stock),
      })),
    });
  };

  const inputClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400';
  const errorClass = 'text-xs text-red-600 mt-1';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Section 1 — Basic Info */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Info</h3>

        <div className="mb-4">
          <label className={labelClass}>Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className={inputClass}
            disabled={isSubmitting}
          />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </div>

        <div className="mb-4">
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            className={inputClass}
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setField('is_active', e.target.checked)}
              disabled={isSubmitting}
              className="accent-gray-800"
            />
            Active (visible to customers)
          </label>
        </div>

        <div className="mb-4">
          <label className={labelClass}>Categories <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.category_ids.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  disabled={isSubmitting}
                  className="accent-gray-800"
                />
                {cat.name}
              </label>
            ))}
          </div>
          {errors.category_ids && <p className={errorClass}>{errors.category_ids}</p>}
        </div>
      </div>

      {/* Section 2 — Variants */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b">Variants</h3>

        {form.variant_data.map((variant, i) => (
          <div key={i} className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-gray-500">Variant {i + 1}</span>
              <button
                type="button"
                onClick={() => removeVariant(i)}
                disabled={form.variant_data.length === 1 || isSubmitting}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Price (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => setVariantField(i, 'price', e.target.value)}
                  className={inputClass}
                  disabled={isSubmitting}
                />
                {errors[`variant_${i}_price`] && (
                  <p className={errorClass}>{errors[`variant_${i}_price`]}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Discounted Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.discounted_price ?? ''}
                  onChange={(e) => setVariantField(i, 'discounted_price', e.target.value)}
                  className={inputClass}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className={labelClass}>Stock <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={variant.stock}
                  onChange={(e) => setVariantField(i, 'stock', e.target.value)}
                  className={inputClass}
                  disabled={isSubmitting}
                />
                {errors[`variant_${i}_stock`] && (
                  <p className={errorClass}>{errors[`variant_${i}_stock`]}</p>
                )}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={variant.available}
                    onChange={(e) => setVariantField(i, 'available', e.target.checked)}
                    disabled={isSubmitting}
                    className="accent-gray-800"
                  />
                  Available
                </label>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          disabled={isSubmitting}
          className="text-sm text-gray-600 border border-dashed border-gray-400 rounded px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
        >
          + Add Variant
        </button>
      </div>

      {/* Section 3 — Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-60 flex items-center gap-2"
        >
          {isSubmitting && <SpinnerIcon />}
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
