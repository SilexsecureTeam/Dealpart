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

/** =============================
 *  CONFIG — change only if needed
 *  ============================= */
const BASE_URL = "https://admin.bezalelsolar.com";
const CATEGORY_LIST_URL = `${BASE_URL}/api/categories`;
const CATEGORY_CREATE_URL = `${BASE_URL}/api/categories`;

// If your product endpoint differs, change ONLY this:
const PRODUCT_CREATE_URL = `${BASE_URL}/api/products`;
// Optional (page still works if this fails):
const PRODUCT_LIST_URL = `${BASE_URL}/api/products`;

/** =============================
 *  Types (kept flexible)
 *  ============================= */
type ApiCategory = {
  id?: number;
  name?: string | null;
  title?: string | null;
  image?: string | null;
  icon?: string | null;
  thumbnail?: string | null;
};

type ApiProduct = {
  id?: number;
  name?: string | null;
  title?: string | null;
  created_at?: string | null;
  createdDate?: string | null;
  orders?: number | null;
  order_count?: number | null;
  image?: string | null;
  thumbnail?: string | null;
};

type Msg = { type: "success" | "error"; text: string } | null;

const fallbackCategories = [
  "PV Solar Panels",
  "Batteries",
  "Solar Water Pumps",
  "Solar Packages",
  "Inverters",
  "Charge Controllers",
  "Stabilizers",
  "Accessories",
];

export default function CategoriesPage() {
  /** =============================
   *  UI state
   *  ============================= */
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const itemsPerPage = 10;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /** =============================
   *  Data state
   *  ============================= */
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  /** =============================
   *  Modals
   *  ============================= */
  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [openCreateProduct, setOpenCreateProduct] = useState(false);

  // Create category form
  const [catName, setCatName] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catFieldError, setCatFieldError] = useState<string | null>(null);

  // Create product form
  const [prodSubmitting, setProdSubmitting] = useState(false);
  const [prodFieldError, setProdFieldError] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState<string>("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodImage, setProdImage] = useState<File | null>(null);

  /** =============================
   *  Discover strip + arrow
   *  ============================= */
  const discoverRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /** =============================
   *  Helpers
   *  ============================= */
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token"); // change key if yours differs
  };

  const headers = () => {
    const token = getToken();
    const h: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  const jsonHeaders = () => ({
    ...headers(),
    "Content-Type": "application/json",
  });

  const unwrapList = (json: any): any[] => {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    if (Array.isArray(json?.categories)) return json.categories;
    if (Array.isArray(json?.products)) return json.products;
    return [];
  };

  const pickName = (x: any) => (x?.name ?? x?.title ?? "").trim();

  const asAbsolute = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, "")}`;
  };

  const pickCategoryImage = (c: ApiCategory) => {
    const img = c.image ?? c.icon ?? c.thumbnail ?? null;
    return asAbsolute(img) ?? null; // we will fallback in JSX
  };

  const pickProductImage = (p: ApiProduct) => {
    const img = p.image ?? p.thumbnail ?? null;
    return asAbsolute(img) ?? null;
  };

  const formatDate = (raw?: string | null) => {
    if (!raw) return "—";
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return raw;
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    window.setTimeout(() => setMsg(null), 4500);
  };

  /** =============================
   *  Fetch data
   *  ============================= */
  const fetchCategories = async () => {
    try {
      setLoadingCats(true);
      const res = await fetch(CATEGORY_LIST_URL, { headers: headers(), cache: "no-store" });
      const text = await res.text();
      const json = (() => { try { return JSON.parse(text); } catch { return text; } })();

      if (!res.ok) {
        showMessage("error", json?.message ?? "Failed to load categories");
        setCategories([]);
        return;
      }

      const list = unwrapList(json) as ApiCategory[];
      setCategories(list.length ? list : fallbackCategories.map((name, i) => ({ id: i + 1, name })));
    } catch {
      // fallback keeps UI alive
      setCategories(fallbackCategories.map((name, i) => ({ id: i + 1, name })));
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchProducts = async () => {
    // Not required for your goal; page still works if this fails.
    try {
      setLoadingProducts(true);
      const res = await fetch(PRODUCT_LIST_URL, { headers: headers(), cache: "no-store" });
      const text = await res.text();
      const json = (() => { try { return JSON.parse(text); } catch { return text; } })();
      if (!res.ok) {
        setProducts([]); // keep empty if endpoint unavailable
        return;
      }
      setProducts(unwrapList(json) as ApiProduct[]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** =============================
   *  Discover arrow logic
   *  ============================= */
  const updateScrollState = () => {
    const el = discoverRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    const el = discoverRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories]);

  const scrollRight = () => {
    const el = discoverRef.current;
    if (!el) return;
    el.scrollBy({ left: 420, behavior: "smooth" });
  };

  /** =============================
   *  Create Category
   *  ============================= */
  const submitCreateCategory = async () => {
    setCatFieldError(null);

    const name = catName.trim();
    if (!name) {
      setCatFieldError("Category name is required.");
      return;
    }

    try {
      setCatSubmitting(true);

      const res = await fetch(CATEGORY_CREATE_URL, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ name }),
      });

      const text = await res.text();
      const json = (() => { try { return JSON.parse(text); } catch { return text; } })();

      if (!res.ok) {
        // Handle typical validation structure
        const errName = json?.errors?.name?.[0];
        setCatFieldError(errName ?? json?.message ?? "Failed to create category.");
        showMessage("error", errName ?? json?.message ?? "Failed to create category.");
        return;
      }

      showMessage("success", "Category created successfully.");
      setCatName("");
      setOpenCreateCategory(false);

      // Refresh list
      await fetchCategories();
    } catch {
      showMessage("error", "Network error while creating category.");
    } finally {
      setCatSubmitting(false);
    }
  };

  /** =============================
   *  Create Product
   *  ============================= */
  const submitCreateProduct = async () => {
    setProdFieldError(null);

    const name = prodName.trim();
    if (!name) return setProdFieldError("Product name is required.");
    if (!prodCategoryId) return setProdFieldError("Select a category.");
    if (!prodPrice.trim()) return setProdFieldError("Price is required.");

    // price should be numeric
    const priceNum = Number(prodPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return setProdFieldError("Price must be a valid number.");
    }

    try {
      setProdSubmitting(true);

      // Many APIs accept multipart for image uploads. If your API only accepts JSON, remove FormData.
      const form = new FormData();
      form.append("name", name);
      form.append("category_id", prodCategoryId);
      form.append("price", String(priceNum));
      form.append("description", prodDescription.trim());
      if (prodImage) form.append("image", prodImage);

      const token = getToken();
      const res = await fetch(PRODUCT_CREATE_URL, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
        body: form,
      });

      const text = await res.text();
      const json = (() => { try { return JSON.parse(text); } catch { return text; } })();

      if (!res.ok) {
        // Try to surface validation
        const anyErr =
          json?.message ??
          json?.errors?.name?.[0] ??
          json?.errors?.category_id?.[0] ??
          json?.errors?.price?.[0] ??
          "Failed to create product.";
        setProdFieldError(anyErr);
        showMessage("error", anyErr);
        return;
      }

      showMessage("success", "Product created successfully.");
      setOpenCreateProduct(false);

      // Reset
      setProdName("");
      setProdCategoryId("");
      setProdPrice("");
      setProdDescription("");
      setProdImage(null);

      // Refresh products list (optional)
      await fetchProducts();
    } catch {
      showMessage("error", "Network error while creating product.");
    } finally {
      setProdSubmitting(false);
    }
  };

  /** =============================
   *  Pagination + normalized products
   *  ============================= */
  const normalizedProducts = useMemo(() => {
    return (products ?? []).map((p, idx) => ({
      id: p.id ?? idx + 1,
      name: pickName(p) || "—",
      createdDate: formatDate(p.created_at ?? p.createdDate ?? null),
      orders: Number(p.orders ?? p.order_count ?? 0),
      image: pickProductImage(p) ?? "/solarpanel.png",
    }));
  }, [products]);

  const totalPages = Math.max(1, Math.ceil(normalizedProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return normalizedProducts.slice(start, start + itemsPerPage);
  }, [normalizedProducts, page]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  /** =============================
   *  UI
   *  ============================= */
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {!mounted ? (
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
          ) : (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
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

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        </div>
      </header>

      {/* Mobile search */}
      {showSearch && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
        {/* Title + Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discover</h2>

          <div className="flex items-center gap-3">
            {/* ✅ Add Product opens modal */}
            <button
              onClick={() => setOpenCreateProduct(true)}
              className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors"
            >
              + Add Product
            </button>

            <button className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              More Action
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message banner */}
        {msg && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
              msg.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Discover Category Strip + arrow (Figma-like) */}
        <div className="relative mb-12">
          <div ref={discoverRef} className="overflow-x-auto scroll-smooth pr-16">
            <div className="grid grid-rows-2 grid-flow-col gap-4 auto-cols-[200px]">
              {/* ✅ “Create Category” card/button (matches the need without breaking layout) */}
              <button
                onClick={() => setOpenCreateCategory(true)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-dashed border-[#4EA674] w-[200px]"
                title="Create Category"
              >
                <div className="w-12 h-12 rounded-lg bg-[#EAF8E7] flex items-center justify-center flex-shrink-0">
                  <PlusSquare className="w-6 h-6 text-[#4EA674]" />
                </div>
                <span className="text-sm font-semibold text-[#4EA674] text-left">
                  Create Category
                </span>
              </button>

              {categories.map((cat: any, i: number) => {
                const label = pickName(cat) || `Category ${i + 1}`;
                const imgSrc = pickCategoryImage(cat);

                return (
                  <button
                    key={cat?.id ?? i}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 w-[200px]"
                    title={label}
                  >
                    {/* ✅ Use <img> for API images to avoid next/image host config issues */}
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={label}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/solarpanel.png";
                        }}
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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition flex items-center justify-center"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          )}
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-[#C1E6BA] text-[#4EA674]" : "text-[#7C7C7C] hover:bg-[#EAF8E7]"
                }`}
              >
                All Product ({normalizedProducts.length})
              </button>
              <button className="px-4 py-2.5 text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#EAF8E7] transition">
                Featured Products
              </button>
              <button className="px-4 py-2.5 text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#EAF8E7] transition">
                On Sale
              </button>
              <button className="px-4 py-2.5 text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#EAF8E7] transition">
                Out of Stock
              </button>
            </div>

            {/* Right side: Search + icons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your product"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/20"
                />
              </div>

              <div className="flex items-center justify-end sm:justify-center gap-2 sm:gap-3">
                <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* ✅ plus icon should create product (like admin UIs) */}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-[#EAF8E7]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-6 py-4 rounded-l-xl">No.</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 rounded-r-xl">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loadingProducts ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-gray-600 dark:text-gray-300">
                      Loading products…
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-gray-600 dark:text-gray-300">
                      No products yet. Click “Add Product”.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product: any, i: number) => {
                    const rowNumber = (page - 1) * itemsPerPage + i + 1;

                    return (
                      <tr key={product.id ?? i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">{rowNumber}</td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {/* table image can stay next/image because it’s local fallback; but use img if remote */}
                            {typeof product.image === "string" && product.image.startsWith("http") ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/solarpanel.png";
                                }}
                              />
                            ) : (
                              <Image
                                src={product.image ?? "/solarpanel.png"}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <span className="text-gray-900 dark:text-white">{product.name}</span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{product.createdDate}</td>
                        <td className="px-6 py-5 text-gray-900 dark:text-white">{product.orders}</td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <button className="text-gray-500 hover:text-[#4EA674] transition">
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button className="text-gray-500 hover:text-[#F43443] transition">
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  page === 1 ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                1
              </button>

              {page > 4 && <span className="text-gray-500 dark:text-gray-400 text-sm">...</span>}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((num) => num > 1 && num < totalPages && Math.abs(num - page) <= 2)
                .map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      page === num ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}

              {page < totalPages - 3 && totalPages > 6 && <span className="text-gray-500 dark:text-gray-400 text-sm">...</span>}

              {totalPages > 1 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
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
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      </main>

      {/* =============================
          CREATE CATEGORY MODAL
         ============================= */}
      {openCreateCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !catSubmitting && setOpenCreateCategory(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Category</h3>
              <button
                onClick={() => !catSubmitting && setOpenCreateCategory(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Name
            </label>
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Inverters"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              disabled={catSubmitting}
            />

            {catFieldError && (
              <p className="mt-2 text-sm text-red-600">{catFieldError}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setOpenCreateCategory(false)}
                disabled={catSubmitting}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={submitCreateCategory}
                disabled={catSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center gap-2"
              >
                {catSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================
          CREATE PRODUCT MODAL
         ============================= */}
      {openCreateProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !prodSubmitting && setOpenCreateProduct(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Product</h3>
              <button
                onClick={() => !prodSubmitting && setOpenCreateProduct(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. 300W Monocrystalline Panel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  disabled={prodSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    disabled={prodSubmitting || loadingCats}
                  >
                    <option value="">Select category</option>
                    {categories.map((c, idx) => {
                      const id = c.id ?? idx + 1;
                      const name = pickName(c) || `Category ${idx + 1}`;
                      return (
                        <option key={id} value={String(id)}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Short product description…"
                  className="w-full min-h-[90px] px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  disabled={prodSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProdImage(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-700 dark:text-gray-200"
                  disabled={prodSubmitting}
                />
              </div>

              {prodFieldError && (
                <p className="text-sm text-red-600">{prodFieldError}</p>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setOpenCreateProduct(false)}
                  disabled={prodSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={submitCreateProduct}
                  disabled={prodSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center gap-2"
                >
                  {prodSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Product
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                If this fails, your backend might use a different endpoint/field names. Change only <b>PRODUCT_CREATE_URL</b> at the top.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
