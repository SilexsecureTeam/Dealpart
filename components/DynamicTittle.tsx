'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const titleMap: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/order-management': 'Order Management',
  '/admin/customers': 'Customers',
  '/admin/coupons': 'Coupon Code',
  '/admin/categories': 'Categories',
  '/admin/transaction': 'Transaction',
  '/admin/brands': 'Brand',
  '/admin/product/add': 'Add Products',
  '/admin/product/media': 'Product Media',
  '/admin/product': 'Product List',
  '/admin/product/reviews': 'Product Reviews',
  '/admin/admin-role': 'Admin Role',
  '/admin/authority': 'Control Authority',
 
  default: 'Admin Panel'
}

export default function DynamicTitle() {
  const pathname = usePathname()

  useEffect(() => {
    // Clean up pathname (remove trailing slash, etc.)
    const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

    // Find matching title or use fallback
    const pageTitle = titleMap[cleanPath] || titleMap.default

    // Set browser tab title (add your brand prefix)
    document.title = `${pageTitle} | Dealport Admin`
  }, [pathname]) // Re-run on every route change

  return null // This component renders nothing visually
}