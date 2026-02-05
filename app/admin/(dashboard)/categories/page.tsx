'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Search,
  Bell,
  MoreVertical,
  Edit2,
  Trash2,
  Sun,
  Moon,
  SlidersHorizontal,
  PlusSquare,
  MoreHorizontal,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";

const BASE_URL = "https://admin.bezalelsolar.com";
const CATEGORY_LIST_URL = `${BASE_URL}/api/categories`;
const CATEGORY_CREATE_URL = `${BASE_URL}/api/categories`;
const PRODUCT_CREATE_URL = `${BASE_URL}/api/products`;
const PRODUCT_LIST_URL = `${BASE_URL}/api/products`;

export default function CategoriesPage() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [msg, setMsg] = useState<any>(null);

  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [openCreateProduct, setOpenCreateProduct] = useState(false);

  const [catName, setCatName] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catFieldError, setCatFieldError] = useState<string | null>(null);

  const [prodSubmitting, setProdSubmitting] = useState(false);
  const [prodFieldError, setProdFieldError] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState<string>("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodImage, setProdImage] = useState<File | null>(null);

  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const discoverRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const authHeaders = (contentType = false) => {
    const token = getToken();
    const h: Record<string, string> = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    if (contentType) h["Content-Type"] = "application/json";
    return h;
  };

  const showMessage = (type: "success" | "error" | "warning", text: string, duration = 5000) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), duration);
  };

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await fetch(CATEGORY_LIST_URL, { headers: authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data ?? json?.categories ?? [];
      setCategories(list.length ? list : [
        "PV Solar Panels",
        "Batteries",
        "Solar Water Pumps",
        "Solar Packages",
        "Inverters",
        "Charge Controllers",
        "Stabilizers",
        "Accessories",
      ].map((n, i) => ({ id: i + 1, name: n })));
    } catch {
      setCategories([
        "PV Solar Panels",
        "Batteries",
        "Solar Water Pumps",
        "Solar Packages",
        "Inverters",
        "Charge Controllers",
        "Stabilizers",
        "Accessories",
      ].map((n, i) => ({ id: i + 1, name: n })));
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(PRODUCT_LIST_URL, { headers: authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      setProducts(Array.isArray(json) ? json : json?.data ?? json?.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const el = discoverRef.current;
    if (!el) return;
    const update = () => setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [categories]);

  const scrollRight = () => discoverRef.current?.scrollBy({ left: 420, behavior: "smooth" });

  const submitCreateCategory = async () => {
    setCatFieldError(null);
    const name = catName.trim();
    if (!name) return setCatFieldError("Category name is required");

    setCatSubmitting(true);
    try {
      const res = await fetch(CATEGORY_CREATE_URL, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || errData?.errors?.name?.[0] || "Failed to create category");
      }
      showMessage("success", "Category created successfully");
      setCatName("");
      setOpenCreateCategory(false);
      fetchCategories();
    } catch (err: any) {
      setCatFieldError(err.message);
      showMessage("error", err.message);
    } finally {
      setCatSubmitting(false);
    }
  };

  const submitCreateProduct = async () => {
    setProdFieldError(null);

    const name = prodName.trim();
    if (!name) return setProdFieldError("Product name is required");
    if (!prodCategoryId) return setProdFieldError("Select a category");
    if (!prodPrice.trim()) return setProdFieldError("Price is required");

    const priceNum = Number(prodPrice);
    if (isNaN(priceNum) || priceNum <= 0) return setProdFieldError("Price must be a positive number");

    setProdSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("category_id", prodCategoryId);
      form.append("price", priceNum.toString());
      form.append("description", prodDescription.trim());
      if (prodImage) form.append("image", prodImage);

      const res = await fetch(PRODUCT_CREATE_URL, {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData?.errors?.name?.[0] ||
          errData?.errors?.price?.[0] ||
          errData?.errors?.category_id?.[0] ||
          errData?.message ||
          "Failed to create product"
        );
      }

      showMessage("success", "Product created successfully");
      setOpenCreateProduct(false);
      setProdName("");
      setProdCategoryId("");
      setProdPrice("");
      setProdDescription("");
      setProdImage(null);
      fetchProducts();
    } catch (err: any) {
      setProdFieldError(err.message);
      showMessage("error", err.message);
    } finally {
      setProdSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to delete product");
      }

      showMessage("success", "Product deleted successfully");
      fetchProducts();
    } catch (err: any) {
      showMessage("error", err.message || "Could not delete product");
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name || product.title || "");
    setEditPrice(product.price?.toString() || "");
    setEditDescription(product.description || "");
    setEditError(null);
    setOpenEditProduct(true);
  };

  const submitEditProduct = async () => {
    if (!editingProduct?.id) return;
    setEditError(null);

    const name = editName.trim();
    if (!name) return setEditError("Product name is required");

    const priceNum = Number(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) return setEditError("Price must be a positive number");

    setEditSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({
          name,
          price: priceNum,
          description: editDescription.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData?.errors?.name?.[0] ||
          errData?.errors?.price?.[0] ||
          errData?.message ||
          "Failed to update product"
        );
      }

      showMessage("success", "Product updated successfully");
      setOpenEditProduct(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      setEditError(err.message);
      showMessage("error", err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) =>
      (p.name || p.title || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const normalizedProducts = useMemo(
    () =>
      filteredProducts.map((p, idx) => ({
        id: p.id ?? idx + 1,
        name: p.name || p.title || "—",
        createdDate: p.created_at
          ? new Date(p.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "—",
        orders: Number(p.orders ?? p.order_count ?? 0),
        image: p.image ?? p.thumbnail ?? "/solarpanel.png",
      })),
    [filteredProducts]
  );

  const totalPages = Math.max(1, Math.ceil(normalizedProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return normalizedProducts.slice(start, start + itemsPerPage);
  }, [normalizedProducts, page]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-80 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Sun
                className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                  theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                }`}
              />
              <Moon
                className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
                  theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                }`}
              />
            </button>
          )}
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 hidden sm:block">
            <Image src="/man.png" alt="Admin" width={36} height={36} className="object-cover" />
          </div>
        </div>
      </header>

      {showSearch && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discover</h2>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setOpenCreateProduct(true)}
              className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors"
            >
              + Add Product
            </button>
            <button className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              More Action
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
              msg.type === "success"
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                : msg.type === "error"
                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                : "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="relative mb-10 sm:mb-12">
          <div ref={discoverRef} className="overflow-x-auto scroll-smooth pb-2 -mx-1 px-1">
            <div className="inline-grid grid-rows-2 grid-flow-col gap-3 sm:gap-4 auto-cols-[min(42vw,160px)] xs:auto-cols-[min(38vw,170px)] sm:auto-cols-[min(32vw,190px)] md:auto-cols-[200px]">
              <button
                onClick={() => setOpenCreateCategory(true)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-dashed border-[#4EA674] min-w-[140px]"
              >
                <div className="w-12 h-12 rounded-lg bg-[#EAF8E7] dark:bg-[#2A4A2F] flex items-center justify-center flex-shrink-0">
                  <PlusSquare className="w-6 h-6 text-[#4EA674]" />
                </div>
                <span className="text-sm font-semibold text-[#4EA674] text-left">Create Category</span>
              </button>

              {categories.map((cat: any, i: number) => {
                const label = cat.name || cat.title || `Category ${i + 1}`;
                const imgSrc = cat.image || cat.icon || cat.thumbnail;

                return (
                  <button
                    key={cat.id || i}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 min-w-[140px]"
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc.startsWith("http") ? imgSrc : `${BASE_URL}/${imgSrc}`}
                        alt={label}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => ((e.target as HTMLImageElement).src = "/solarpanel.png")}
                      />
                    ) : (
                      <Image
                        src="/solarpanel.png"
                        alt={label}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight text-left line-clamp-2">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md flex items-center justify-center transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-400 hover:bg-[#EAF8E7] dark:hover:bg-gray-800"
                }`}
              >
                All ({normalizedProducts.length})
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-full hover:bg-[#EAF8E7] dark:hover:bg-gray-800 transition">
                Featured
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-full hover:bg-[#EAF8E7] dark:hover:bg-gray-800 transition">
                On Sale
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-full hover:bg-[#EAF8E7] dark:hover:bg-gray-800 transition">
                Out of Stock
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your product"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/20"
                />
              </div>

              <div className="flex items-center justify-end sm:justify-center gap-2">
                <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setOpenCreateProduct(true)}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <PlusSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] sm:min-w-[580px] text-sm">
              <thead className="bg-[#EAF8E7] dark:bg-[#2A4A2F]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-4 py-4 rounded-l-xl whitespace-nowrap">No.</th>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4 hidden sm:table-cell">Created Date</th>
                  <th className="px-4 py-4 hidden md:table-cell">Order</th>
                  <th className="px-4 py-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loadingProducts ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                      Loading products…
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                      {searchQuery ? "No products match your search" : "No products yet. Click “Add Product”."}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product: any, i: number) => {
                    const rowNumber = (page - 1) * itemsPerPage + i + 1;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{rowNumber}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {product.image?.startsWith("http") || product.image?.startsWith("/") ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => ((e.target as HTMLImageElement).src = "/solarpanel.png")}
                              />
                            ) : (
                              <Image
                                src="/solarpanel.png"
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover"
                              />
                            )}
                            <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                          {product.createdDate}
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white hidden md:table-cell">
                          {product.orders}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-gray-500 hover:text-[#4EA674] transition p-1"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => product.id && handleDeleteProduct(product.id, product.name)}
                              className="text-gray-500 hover:text-red-500 transition p-1"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-start"
            >
              ← Previous
            </button>

            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium min-w-9 ${
                  page === 1 ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                1
              </button>

              {page > 4 && <span className="px-2 py-2 text-gray-500">...</span>}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((num) => num > 1 && num < totalPages && Math.abs(num - page) <= 2)
                .map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium min-w-9 ${
                      page === num ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}

              {page < totalPages - 3 && totalPages > 6 && <span className="px-2 py-2 text-gray-500">...</span>}

              {totalPages > 1 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium min-w-9 ${
                    page === totalPages ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-end"
            >
              Next →
            </button>
          </div>
        </div>
      </main>

      {openCreateCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => !catSubmitting && setOpenCreateCategory(false)} />
          <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Category</h3>
              <button onClick={() => !catSubmitting && setOpenCreateCategory(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Inverters"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              disabled={catSubmitting}
            />
            {catFieldError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{catFieldError}</p>}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setOpenCreateCategory(false)}
                disabled={catSubmitting}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCreateCategory}
                disabled={catSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
              >
                {catSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openCreateProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => !prodSubmitting && setOpenCreateProduct(false)} />
          <div className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Product</h3>
              <button onClick={() => !prodSubmitting && setOpenCreateProduct(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <input
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. 300W Monocrystalline Panel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  disabled={prodSubmitting}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 appearance-none"
                    disabled={prodSubmitting || loadingCats}
                  >
                    <option value="">Select category</option>
                    {categories.map((c: any, idx: number) => (
                      <option key={c.id ?? idx} value={String(c.id ?? idx + 1)}>
                        {c.name || `Category ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                  <input
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="e.g. 250000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    disabled={prodSubmitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Short product description…"
                  className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-y"
                  disabled={prodSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProdImage(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#EAF8E7] file:text-[#4EA674] hover:file:bg-[#C1E6BA] cursor-pointer"
                  disabled={prodSubmitting}
                />
              </div>
              {prodFieldError && <p className="text-sm text-red-600 dark:text-red-400">{prodFieldError}</p>}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpenCreateProduct(false)}
                  disabled={prodSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCreateProduct}
                  disabled={prodSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2 min-w-[140px]"
                >
                  {prodSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openEditProduct && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => !editSubmitting && setOpenEditProduct(false)} />
          <div className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Product</h3>
              <button onClick={() => !editSubmitting && setOpenEditProduct(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  disabled={editSubmitting}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    disabled={editSubmitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-y"
                  disabled={editSubmitting}
                />
              </div>
              {editError && <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpenEditProduct(false)}
                  disabled={editSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEditProduct}
                  disabled={editSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2 min-w-[140px]"
                >
                  {editSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}