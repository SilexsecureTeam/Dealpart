// app/shop/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ChevronRight, ChevronDown } from 'lucide-react';

// Mock products (replace with real data/API later)
const allProducts = [
  { id: 1, slug: 'uthium-lifepo4-battery-12v-100ah', name: 'Uthium LiFePO4 Battery 12V / 100Ah', price: 119999, image: '/offer.jpg', rating: 4.5, stock: 'In stock' },
  { id: 2, slug: 'solar-motion-sensor-light-24z', name: 'Solar Motion Sensor Light (24z)', price: 11999, image: '/offer.jpg', rating: 4.2, stock: 'In stock' },
  { id: 3, slug: 'mppt-charge-controller-60a', name: 'MPPT Charge Controller 60A', price: 119999, image: '/offer.jpg', rating: 4.7, stock: 'In stock' },
  { id: 4, slug: 'felicity-ivem6048-6kva-hybrid-inverter-48v', name: 'Felicity Solar Hybrid Inverter 6kVA', price: 485000, image: '/offer.jpg', rating: 4.8, stock: 'In stock' },
  { id: 5, slug: 'lithium-lifepo4-battery-12v-200ah', name: 'Lithium LiFePO4 Battery 12V / 200Ah', price: 189999, image: '/offer.jpg', rating: 4.6, stock: 'In stock' },
  { id: 6, slug: 'solar-battery-deep-cycle-150ah', name: 'Solar Battery Deep Cycle 150Ah', price: 149999, image: '/offer.jpg', rating: 4.4, stock: 'Low stock' },
  { id: 7, slug: 'growatt-5kw-hybrid-inverter', name: 'Growatt 5kW Hybrid Inverter', price: 580000, image: '/offer.jpg', rating: 4.9, stock: 'In stock' },
  { id: 8, slug: 'mppt-solar-charge-controller-40a', name: 'MPPT Solar Charge Controller 40A', price: 89999, image: '/offer.jpg', rating: 4.3, stock: 'In stock' },
  { id: 9, slug: 'lithium-lifepo4-battery-12v-200ah-2', name: 'Lithium LiFePO4 Battery 12V / 200Ah', price: 189999, image: '/offer.jpg', rating: 4.6, stock: 'In stock' },
];

export default function ShopPage() {
  const [priceMax, setPriceMax] = useState(1000000);
  const [brand, setBrand] = useState('All Brands');
  const [applyFilter, setApplyFilter] = useState(false); // to trigger filter on button click

  // Filter products
  const filteredProducts = allProducts.filter((p) => {
    if (!applyFilter) return true; // show all until filter button clicked
    const priceMatch = p.price <= priceMax;
    const brandMatch = brand === 'All Brands' || p.name.includes(brand);
    return priceMatch && brandMatch;
  });

  return (
    <div className="min-h-screen bg-[#EAF8E7]/50">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#4EA674]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/inverters" className="hover:text-[#4EA674]">Inverters</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#4EA674] font-medium">Hybrid Inverters</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 bg-white rounded-xl p-6 shadow-sm h-fit lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Filter By Price</h2>

            <div className="mb-8">
              <label className="block text-sm text-gray-600 mb-2">Price</label>
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4EA674]"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>₦0.00</span>
                <span>₦{priceMax.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setApplyFilter(true)}
                className="w-full mt-4 py-2.5 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3e8c5f] transition"
              >
                Filter
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Filter By Brands</h2>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674] text-gray-700"
            >
              <option>All Brands</option>
              <option>Felicity</option>
              <option>Growatt</option>
              <option>Deye</option>
              <option>Luminous</option>
              <option>Uthium</option>
              <option>SolarTech</option>
              <option>MPPT Pro</option>
            </select>
          </aside>

          {/* Main Product Grid */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Hybrid Inverters
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Showing 1 - {filteredProducts.length} / {allProducts.length}</span>
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4EA674]">
                    <option>Default sorting</option>
                    <option>Price: low to high</option>
                    <option>Price: high to low</option>
                    <option>Popularity</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-600 bg-white rounded-xl">
                No products match your filters. Try adjusting price or brand.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div className="relative pt-[75%]">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                      <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                        {p.name}
                      </h3>

                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(p.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      <p
                        className={`text-xs font-medium mb-2 ${
                          p.stock === 'In stock' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {p.stock}
                      </p>

                      <p className="text-xl font-bold text-[#4EA674] mb-4">
                        ₦{p.price.toLocaleString()}
                      </p>

                      <div className="flex gap-3">
                        {/* FIXED: Now links to dynamic slug page */}
                        <Link
                          href={`/products/${p.slug}`}
                          className="flex-1 text-center py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-medium hover:bg-[#4EA674]/10 transition"
                        >
                          View Details
                        </Link>
                        <button className="flex-1 bg-[#4EA674] text-white py-2 rounded-full text-sm font-medium hover:bg-[#3e8c5f] transition">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

           
          </main>
        </div>
      </div>
    </div>
  );
}