'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Bell, Settings, Calendar, Upload, Plus, Trash2 } from 'lucide-react';

export default function AddProductPage() {
  // Form states
  const [productName, setProductName] = useState('Lithium LifePO4Battery 12 / 100Ah');
  const [description, setDescription] = useState(
    'Upgrade your energy storage with this high-performance 12V 100Ah Lithium Iron Phosphate (LiFePO4) battery. Designed as a superior drop-in replacement for traditional lead-acid batteries, it delivers consistent power, significantly longer lifespan, and cutting-edge safety features in a package that weighs half as much.'
  );
  const [price, setPrice] = useState('999.89');
  const [discountedPrice, setDiscountedPrice] = useState('900.89');
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [unlimitedStock, setUnlimitedStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Images
  const [images, setImages] = useState<string[]>(['/solarpanel.png']);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Product Name
    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (productName.trim().length < 5) {
      newErrors.productName = 'Product name must be at least 5 characters';
    }

    // Description
    if (!description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
    }

    // Price
    if (!price.trim()) {
      newErrors.price = 'Product price is required';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    // Discounted Price (optional)
    if (discountedPrice.trim() && !isNaN(Number(discountedPrice))) {
      if (Number(discountedPrice) >= Number(price)) {
        newErrors.discountedPrice = 'Discounted price must be lower than regular price';
      }
    }

    // Stock Quantity when not unlimited
    if (!unlimitedStock) {
      if (!stockQuantity.trim()) {
        newErrors.stockQuantity = 'Stock quantity is required';
      } else if (!/^\d+$/.test(stockQuantity) || Number(stockQuantity) <= 0) {
        newErrors.stockQuantity = 'Must be a positive whole number';
      }
    }

    // Dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = () => {
    if (validateForm()) {
      // Here would be your submit logic (API call, etc.)
      alert('Form is valid! Product would be published now.');
    } else {
      alert('Please fix the errors in the form.');
    }
  };

  const handleSaveDraft = () => {
    // Draft saving logic (can be less strict)
    alert('Draft saved!');
  };

  const handleAddImage = () => {
    setImages([...images, '/solarpanel.png']);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Product</h1>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-72 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover" />
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Product</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search product for add"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              />
            </div>
            <button
              onClick={handlePublish}
              className="px-6 py-3 bg-[#4EA674] text-white rounded-xl font-medium hover:bg-[#3D8B59] transition"
            >
              Publish Product
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-6 py-3 border border-[#4EA674] text-[#4EA674] rounded-xl font-medium hover:bg-[#4EA674] hover:text-white transition"
            >
              Save to draft
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Basic Details</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 ${
                      errors.productName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.productName && (
                    <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <div className="flex justify-end gap-3 mt-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <span className="text-gray-500">✎</span>
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <span className="text-gray-500">🔗</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Pricing</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">₦</span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full pl-10 pr-16 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 ${
                        errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <select className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent text-sm text-gray-600">
                      <option>NGN</option>
                      <option>USD</option>
                    </select>
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Discounted Price (Optional)</label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                        <input
                          type="text"
                          value={discountedPrice}
                          onChange={(e) => setDiscountedPrice(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 ${
                            errors.discountedPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      </div>
                      <div className="text-sm text-gray-600 whitespace-nowrap">
                        Sale = ₦{discountedPrice || '0'}
                      </div>
                    </div>
                    {errors.discountedPrice && (
                      <p className="mt-1 text-sm text-red-600">{errors.discountedPrice}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-8 self-end">
                    <span className="text-sm font-medium">Tax Included</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={taxIncluded}
                          onChange={() => setTaxIncluded(true)}
                          className="w-4 h-4 accent-[#4EA674]"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={!taxIncluded}
                          onChange={() => setTaxIncluded(false)}
                          className="w-4 h-4 accent-[#4EA674]"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiration */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Expiration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Start</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Inventory</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                  <input
                    type="text"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    disabled={unlimitedStock}
                    placeholder={unlimitedStock ? 'Unlimited' : ''}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 ${
                      unlimitedStock ? 'opacity-60 cursor-not-allowed' : ''
                    } ${errors.stockQuantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.stockQuantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock Status</label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  >
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={unlimitedStock}
                      onChange={(e) => setUnlimitedStock(e.target.checked)}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className="absolute inset-0 bg-gray-300 rounded-full peer-checked:bg-[#4EA674] transition-colors"></span>
                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unlimited</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 text-[#4EA674] border-gray-300 rounded focus:ring-[#4EA674]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Highlight this product in a featured section.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Image + Categories */}
          <div className="space-y-8">
            {/* Upload Product Image */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Upload Product Image</h3>

              <div className="space-y-6">
                {images.length > 0 && (
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <Image src={images[0]} alt="Main preview" fill className="object-cover" />
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 group">
                      <Image src={img} alt={`Thumb ${i}`} fill className="rounded-lg object-cover border" />
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={handleAddImage}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#4EA674]"
                  >
                    <Plus className="w-8 h-8 text-gray-400" />
                  </button>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Browse</button>
                  <button className="flex-1 py-3 border rounded-xl hover:bg-gray-50 transition">Replace</button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Categories</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Categories</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <option>Select your product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Tag</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <option>Select your product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select your color</label>
                  <div className="flex gap-3 flex-wrap">
                    {['#90EE90', '#FFB6C1', '#D3D3D3', '#000000', '#FFD700'].map((c, i) => (
                      <button
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 hover:scale-110 transition"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-4 mt-12">
          <button
            onClick={handleSaveDraft}
            className="px-8 py-3.5 border border-[#4EA674] text-[#4EA674] rounded-xl font-medium hover:bg-[#4EA674] hover:text-white transition"
          >
            Save to draft
          </button>
          <button
            onClick={handlePublish}
            className="px-8 py-3.5 bg-[#4EA674] text-white rounded-xl font-medium hover:bg-[#3D8B59] transition"
          >
            Publish Product
          </button>
        </div>
      </main>
    </>
  );
}