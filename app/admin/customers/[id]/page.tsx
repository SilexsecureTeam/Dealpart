'use client';

import { useParams } from "next/navigation";
import Image from "next/image";
import { Search, Bell, Settings, MoreVertical, MessageSquare, Trash2, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

// Mock data for demonstration (in real app, fetch by id)
const customer = {
  id: "CUST001",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  address: "123 Main St, NY",
  registration: "15.01.2025",
  lastPurchase: "10.01.2025",
  totalOrders: 150,
  completedOrders: 140,
  canceledOrders: 10,
  status: "Active",
};

const orderHistory = [
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "Jane Smith", phone: "+1234567890", orders: 5, spend: "250.00", status: "Inactive" },
  { id: "CUST001", name: "Emily Davis", phone: "+1234567890", orders: 30, spend: "4,600.00", status: "VIP" },
  { id: "CUST001", name: "Jane Smith", phone: "+1234567890", orders: 5, spend: "250.00", status: "Inactive" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "Emily Davis", phone: "+1234567890", orders: 30, spend: "4,600.00", status: "VIP" },
];

export default function CustomerDetailsPage() {
  const params = useParams();
  const customerId = params.id;

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
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
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Customer Details Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Details</h2>

          {/* Profile + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                  <Image src="/man.png" alt={customer.name} width={80} height={80} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{customer.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Customer Info</p>
                  <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900 dark:text-white mt-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{customer.address}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Social Media</p>
                  <div className="flex items-center gap-4">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition">
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition">
                      <Instagram className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                      <Linkedin className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Activity</p>
                  <p className="text-sm text-gray-900 dark:text-white">Registration: {customer.registration}</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-2">Last purchase: {customer.lastPurchase}</p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Order overview</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg py-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.totalOrders}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total order</p>
                    </div>
                    <div className="bg-[#EAF8E7] rounded-lg py-3">
                      <p className="text-2xl font-bold text-[#4EA674]">{customer.completedOrders}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg py-3">
                      <p className="text-2xl font-bold text-[#F43443]">{customer.canceledOrders}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Canceled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History Table */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAF8E7]">
                    <tr className="text-left text-[#4EA674] font-medium">
                      <th className="px-6 py-4 rounded-l-xl">Customer Id</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Order Count</th>
                      <th className="px-6 py-4">Total Spend</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {orderHistory.map((cust, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{cust.id}</td>
                        <td className="px-6 py-5 text-gray-900 dark:text-white">{cust.name}</td>
                        <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{cust.phone}</td>
                        <td className="px-6 py-5 text-gray-900 dark:text-white">{cust.orders}</td>
                        <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">{cust.spend}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                            cust.status === "Active" ? "bg-[#EAF8E7] text-[#4EA674]" :
                            cust.status === "VIP" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              cust.status === "Active" ? "bg-[#4EA674]" :
                              cust.status === "VIP" ? "bg-yellow-700" :
                              "bg-red-700"
                            }`} />
                            {cust.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <button className="text-gray-500 hover:text-[#4EA674] transition">
                              <MessageSquare className="w-5 h-5" />
                            </button>
                            <button className="text-gray-500 hover:text-[#F43443] transition">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-8">
                <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  ← Previous
                </button>

                <div className="flex items-center gap-2">
                  <button className="px-4 py-2.5 bg-[#C1E6BA] text-[#4EA674] rounded-lg text-sm font-medium">1</button>
                  <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">2</button>
                  <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">3</button>
                  <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">4</button>
                  <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">5</button>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">...</span>
                  <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">24</button>
                </div>

                <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}