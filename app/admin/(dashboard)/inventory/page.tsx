'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Loader2,
  Upload,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useInventory, useDeleteInventoryItem, useImportInventory, InventoryItem} from '@/hooks/useInventory';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInventory({ page, limit: 10, search: searchQuery });
  const deleteMutation = useDeleteInventoryItem();
  const importMutation = useImportInventory();
  
  const items = data?.data || [];
  const totalPages = data?.last_page || 1;

  const handleDelete = (id: number, name: string) => {
    toast((t) => (
      <div>
        <p>Delete "{name}" from inventory?</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)}>Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            await deleteMutation.mutateAsync(id);
          }}>Delete</button>
        </div>
      </div>
    ));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header similar to other pages */}
      <main className="p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <div className="flex gap-3">
            <label className="px-4 py-2 border border-[#4EA674] text-[#4EA674] rounded-lg cursor-pointer hover:bg-[#4EA674] hover:text-white transition">
              <Upload className="w-4 h-4 inline mr-2" />
              Import CSV
              <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
            </label>
            <button className="px-4 py-2 bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59] transition">
              <Plus className="w-4 h-4 inline mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Inventory table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#EAF8E7]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Current Stock</th>
                <th className="px-4 py-3 text-left">Total Stock</th>
                <th className="px-4 py-3 text-left">Cost Price</th>
                <th className="px-4 py-3 text-left">Sales Price</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: InventoryItem) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.category_name}</td>
                  <td className="px-4 py-3">
                    <span className={item.current_stock < 10 ? 'text-orange-600 font-medium' : ''}>
                      {item.current_stock}
                      {item.current_stock < 10 && <AlertTriangle className="w-4 h-4 inline ml-1 text-orange-600" />}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.total_stock}</td>
                  <td className="px-4 py-3">₦{item.cost_price?.toLocaleString()}</td>
                  <td className="px-4 py-3">₦{item.sales_price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#4EA674] mr-3"><Edit className="w-4 h-4" /></button>
                    <button className="text-red-600" onClick={() => handleDelete(item.id, item.name)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}