// src/components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#EAF8E7] pt-16 pb-12 border-t border-gray-200">
     <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
         {/* Main columns grid */}
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-12 mb-16">
           {/* Column 1: Categories */}
           <div>
             <h4 className="font-bold text-lg mb-6 text-gray-800">Categories</h4>
             <ul className="space-y-3 text-gray-600">
               <li><a href="/categories/pv-solar-panels" className="hover:text-[#4EA674] transition">PV Solar Panels</a></li>
               <li><a href="/categories/inverters" className="hover:text-[#4EA674] transition">Inverters</a></li>
               <li><a href="/categories/batteries" className="hover:text-[#4EA674] transition">Batteries</a></li>
               <li><a href="/categories/charge-controllers" className="hover:text-[#4EA674] transition">Charge Controllers</a></li>
               <li><a href="/categories/solar-water-pumps" className="hover:text-[#4EA674] transition">Solar Water Pumps</a></li>
               <li><a href="/categories" className="font-semibold hover:text-[#4EA674] transition">All Categories</a></li>
             </ul>
           </div>
     
           {/* Column 2: Useful Links */}
           <div>
             <h4 className="font-bold text-lg mb-6 text-gray-800">Useful Links</h4>
             <ul className="space-y-3 text-gray-600">
               <li><a href="/contact" className="hover:text-[#4EA674] transition">Contact Us</a></li>
               <li><a href="/delivery-return" className="hover:text-[#4EA674] transition">Delivery & Return</a></li>
               <li><a href="/cart" className="hover:text-[#4EA674] transition">Cart</a></li>
               <li><a href="/checkout" className="hover:text-[#4EA674] transition">Checkout</a></li>
               <li><a href="/terms-conditions" className="hover:text-[#4EA674] transition">Terms & Conditions</a></li>
             </ul>
           </div>
     
           {/* Column 3: Explore */}
           <div>
             <h4 className="font-bold text-lg mb-6 text-gray-800">Explore</h4>
             <ul className="space-y-3 text-gray-600">
               <li><a href="/brands" className="hover:text-[#4EA674] transition">Brands</a></li>
               <li><a href="/new-arrivals" className="hover:text-[#4EA674] transition">New Arrivals</a></li>
               <li><a href="/deals-promotions" className="hover:text-[#4EA674] transition">Deals & Promotions</a></li>
             </ul>
           </div>
     
           {/* Column 4: Legal */}
           <div>
             <h4 className="font-bold text-lg mb-6 text-gray-800">Legal</h4>
             <ul className="space-y-3 text-gray-600">
               <li><a href="/delivery-return" className="hover:text-[#4EA674] transition">Delivery & Return</a></li>
               <li><a href="/privacy-policy" className="hover:text-[#4EA674] transition">Privacy Policy</a></li>
               <li><a href="/return-refund" className="hover:text-[#4EA674] transition">Return & Refund Policy</a></li>
               <li><a href="/warranty-policy" className="hover:text-[#4EA674] transition">Warranty Policy</a></li>
             </ul>
           </div>
     
           {/* Column 5: Location + Phone */}
           <div>
             <h4 className="font-bold text-lg mb-4 text-gray-800">Location</h4>
             <p className="text-gray-600 leading-relaxed mb-6">
               No. 5, OP Fingesi street, Utako, AMAC,<br />
               Abuja, Nigeria.
             </p>
     
             <h4 className="font-bold text-lg mb-3 text-gray-800">Phone</h4>
             <p className="text-xl font-bold text-[#4EA674]">
               +234 0000 000 0000
             </p>
           </div>
         </div>
     
         {/* Bottom section: Logo + Newsletter + Social */}
         <div className="border-t border-gray-200 pt-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
             {/* Logo - left */}
             <div className="flex justify-center md:justify-start">
               <Image
                 src="/logo.png"
                 alt="DEALPORT"
                 width={180}
                 height={60}
                 className="object-contain"
               />
             </div>
     </div>  
             {/* Newsletter - center */}
             <div className="text-center">
       <p className="text-[#4EA674] font-bold text-lg mb-4">Newsletter Signup</p>
       
       <div className="inline-flex items-center bg-[#C1E6BA] rounded-full p-1.5 pl-6 pr-1.5 max-w-md mx-auto">
         <input
           type="email"
           placeholder="Enter your email address"
           className="bg-transparent text-white placeholder-[#333333] outline-none flex-1 min-w-[220px] px-2 py-2 text-sm"
         />
         <button
           type="submit"
           className="bg-white text-[#333333] font-medium px-6 py-2.5 rounded-full text-sm hover:bg-gray-100 transition ml-2"
         >
           Subscribe
         </button>
       </div>
     </div>
     {/* Social + Connect - right */}
     <div className="flex flex-col items-center md:items-end gap-3 md:gap-4">
       {/* Text label on top */}
       <p className="text-gray-700 font-semibold text-base md:text-lg">
         Connect with us
       </p>
       <div className="flex gap-5">
         <a href="#" target="_blank" rel="noopener noreferrer">
           <Image src="/facebook.png" alt="Facebook" width={36} height={36} className="hover:opacity-80 hover:scale-110 transition duration-300" />
         </a>
         <a href="#" target="_blank" rel="noopener noreferrer">
           <Image src="/instagram.png" alt="Instagram" width={36} height={36} className="hover:opacity-80 hover:scale-110 transition duration-300" />
         </a>
         <a href="#" target="_blank" rel="noopener noreferrer">
           <Image src="/twitter.png" alt="X" width={36} height={36} className="hover:opacity-80 hover:scale-110 transition duration-300" />
         </a>
         <a href="#" target="_blank" rel="noopener noreferrer">
           <Image src="/linkedin.png" alt="LinkedIn" width={36} height={36} className="hover:opacity-80 hover:scale-110 transition duration-300" />
         </a>
       </div>
     </div>
           </div>
     
         {/* Copyright */}
         <div className="text-center md:text-left mt-10 text-gray-500 text-sm">
           <p>© 2025 Dealport. All rights reserved.</p>
         </div>
       </div>
    </footer>
  );
}