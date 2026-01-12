'use client';
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Star, User,  Search, ShoppingCart, ChevronDown, MapPin } from "lucide-react";

export default function LandingPage() {
 return (
    <main className="min-h-screen bg-white">
      {/* TOP BAR - Flag + Language + Location on LEFT, Icons on RIGHT */}
     <div className="bg-white py-3">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4 md:gap-6">
          {/* Left: Logo + Flag + Language + Location */}
          <div className="flex items-center gap-5 md:gap-8 flex-wrap">
            {/* Logo */}
            <Link href="/">
              <Image src="/logo.png" alt="DEALP**RT" width={140} height={50} className="object-contain" />
            </Link>

            {/* Language Flag + EN */}
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#4EA674] transition">
              <Image src="/ng.png" alt="Nigeria" width={20} height={14} className="rounded" />
              EN
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Deliver to Your address */}
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#4EA674] transition">
              <MapPin className="w-4 h-4" />
              Deliver to Your address
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Icons + Cart + Small Search Bar - all on same line */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Small Search Bar */}
            <div className="hidden md:block relative w-64 lg:w-80">
              <input
                type="text"
                placeholder="What you're looking for"
                className="w-full px-4 py-2.5 pl-10 pr-4 rounded-full bg-[#EAF8E7] text-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>

            {/* Icons */}
            <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full transition">
              <User className="w-6 h-6 text-gray-700" />
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Heart className="w-6 h-6 text-gray-700" />
            </button>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="font-bold text-sm text-gray-700">₦0.00</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar for Mobile - below top bar, full width */}
      <div className="md:hidden bg-white py-3 border-t">
        <div className="container mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="What you're looking for"
              className="w-full px-5 py-3 pl-12 rounded-full bg-[#EAF8E7] text-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 transition"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Secondary Nav - Home, About Us, Contact Us + others */}
      <nav className="bg-white py-3 ">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-6 text-sm font-medium text-gray-700">
            {/* Left side */}
            <div className="flex flex-wrap gap-6">
              <Link href="/admin/dashboard" className="hover:text-[#4EA674] transition">Shop</Link>
              <Link href="#" className="hover:text-[#4EA674] transition">Promotions</Link>
              <Link href="/checkout" className="hover:text-[#4EA674] transition">Checkout</Link>
              <Link href="/brands" className="hover:text-[#4EA674] transition">Brands</Link>
            </div>

            {/* Right side */}
            <div className="flex flex-wrap gap-6">
               <Link href="/" className="text-[#4EA674] border-b-2 border-[#4EA674] pb-0.5 transition">Home</Link>
              <Link href="/about" className="hover:text-[#4EA674] transition">About Us</Link>
              <Link href="/contact" className="hover:text-[#4EA674] transition">Contact Us</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Category Bar */}
      <div className="bg-white py-3 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap justify-center md:justify-start gap-5 md:gap-8 text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wide">
            <Link href="#" className="hover:text-[#4EA674] transition">PV SOLAR PANELS</Link>
            <Link href="#" className="hover:text-[#4EA674] transition">INVERTERS</Link>
            <Link href="#" className="hover:text-[#4EA674] transition">BATTERIES</Link>
            <Link href="#" className="hover:text-[#4EA674] transition">CHARGE CONTROLLERS</Link>
            <Link href="#" className="hover:text-[#4EA674] transition">SOLAR WATER PUMPS</Link>
            <Link href="#" className="hover:text-[#4EA674] transition">SOLAR PACKAGES</Link>
            <Link href="#" className="hover:text-[#4EA674] transition">ACCESSORIES</Link>
            <Link href="#" className="text-[#4EA674] hover:underline transition flex items-center gap-1">
              See more
              <ChevronRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen w-full">
        <Image src="/homebg.png" alt="Energy Independence" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#02333700] via-transparent to-transparent" />
        <div className="relative z-10 container-max h-screen flex flex-col justify-center items-center text-center px-6">
          <button
            onClick={() => console.log("Prev")}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg hover:bg-white group transition"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-secondary group-hover:text-primary" />
          </button>
          <button
            onClick={() => console.log("Next")}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg hover:bg-white group transition"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-secondary group-hover:text-primary" />
          </button>

          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-tight">
            Energy Independence Starts Here
          </h1>
          <p className="text-lg md:text-2xl lg:text-3xl text-white mb-10 font-medium max-w-4xl">
            Spring Sale: Free Shipping on orders over ₦500,000.
          </p>
          <button className="bg-accent-light hover:bg-accent text-secondary font-bold px-10 py-5 rounded-full text-lg shadow-ambient transition">
            Shop Now
          </button>
        </div>
      </section>

    <section className="py-16 md:py-20 bg-white">
  <div className="container mx-auto px-4 md:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Large Left Card - PV Solar Panels */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[500px] lg:h-[680px]">
        {/* Image as background */}
        <Image
          src="/offer.jpg"  // ← use a wide solar field image here
          alt="PV Solar Panels"
          fill
          className="object-cover group-hover:scale-105 transition duration-700"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#02333780] to-transparent" />
        {/* Text at bottom-left */}
        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg">
            PV Solar Panels
          </h3>
          <p className="text-lg md:text-xl mb-6 max-w-md drop-shadow-md">
            This is a brief Category description
          </p>
          <button className="px-8 md:px-10 py-4 md:py-5 bg-[#4EA674] text-white font-bold rounded-full hover:bg-[#3D8B59] transition shadow-lg">
            Shop Now
          </button>
        </div>
      </div>

      {/* Right Side - Smaller Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {["Inverters", "Charge Controllers", "Batteries"].map((cat) => (
          <div key={cat} className="relative rounded-3xl overflow-hidden shadow-xl group h-64 md:h-80 lg:h-96">
            {/* Image as background */}
            <Image
              src="/offer.jpg"  // ← same or different image
              alt={cat}
              fill
              className="object-cover group-hover:scale-105 transition duration-700"
            />

            {/* Gradient overlay */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#02333780] via-transparent to-transparent" />
            {/* Text at bottom-left */}
            <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
              <h4 className="text-2xl md:text-3xl font-black mb-2 drop-shadow-lg">
                {cat}
              </h4>
              <p className="text-base md:text-lg mb-6 drop-shadow-md">
                This is a brief Category description
              </p>
              <button className="px-6 md:px-8 py-3 md:py-4 bg-[#4EA674] text-white font-bold rounded-full hover:bg-[#3D8B59] transition shadow-md">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* ==================== TOP OFFERS SECTION ==================== */}
      <section className="section-py bg-white">
        <div className="container-max">
          <h2 className="text-3xl md:text-4xl font-black text-left mb-16 text-secondary">
            The Best Offers
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              "Apex $50W Monocrystalline Panel",
              "Polycrystalline Panel",
              "Lithium Battery 100Ah",
              "Hybrid Inverter 5kW",
            ].map((name) => (
              <div key={name} className="card group">
                <div className="relative rounded-2xl overflow-hidden h-64">
                  <Image src="/offer.jpg" alt={name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-card hover:shadow-ambient transition">
                    <Heart className="w-5 h-5 text-secondary" />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-3 text-secondary line-clamp-2">{name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-success font-bold mb-4">In stock</p>
                  <p className="text-2xl font-black text-primary mb-6">₦999.00</p>
                  <div className="mt-auto flex gap-3">
              <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-3 rounded-full font-bold hover:bg-[#4EA674] hover:text-white transition text-sm md:text-base">
                View Details
              </button>
              <button className="flex-1 bg-[#4EA674] text-white py-3 rounded-full font-bold hover:bg-[#3D8B59] transition text-sm md:text-base">
                Add to cart
              </button>
            </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* ==================== EXPLORE CATEGORIES GRID ==================== */}
<section className="section-py bg-white relative">
  <div className="container-max">
    {/* Title left-aligned */}
    <h2 className="text-3xl md:text-4xl font-black text-left mb-10 md:mb-12 text-secondary">
      Explore Categories
    </h2>

    {/* Grid + Subtle Arrow on right side */}
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
        {[
          "PV Solar Panels",
          "Inverters",
          "Batteries",
          "Charge Controllers",
          "Stabilizers",
          "Accessories",
        ].map((cat) => (
          <div key={cat} className="group cursor-pointer">
            <div className="relative h-48 md:h-56 rounded-xl overflow-hidden shadow-card group-hover:shadow-ambient transition">
              <Image
                src="/solarpanel.png"
                alt={cat}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <p className="absolute bottom-6 left-6 text-white font-bold text-base md:text-lg">
                {cat}
              </p>
            </div>
          </div>
        ))}
      </div>

     {/* Subtle arrow - right side, links to /categories */}
<Link
  href="/categories"
  className="absolute top-1/2 -translate-y-1/2 right-0 md:right-[-20px] lg:right-[-30px] z-20 w-10 h-10 md:w-12 md:h-12 bg-white/40 backdrop-blur-sm text-gray-600 rounded-full flex items-center justify-center hover:bg-white/70 hover:text-gray-900 transition transform hover:scale-110 shadow-sm"
>
  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
</Link>
    </div>
  </div>
</section>

{/* ================================================ */}
{/* === New Arrival - 4 Product Cards === */}
{/* ================================================ */}

<section className="py-16 md:py-20 bg-white">
  <div className="container mx-auto px-4 md:px-6 lg:px-8">
  <div className="flex items-center justify-between mb-8 md:mb-12">
   <h2 className="text-3xl md:text-4xl font-black text-left mb-10 md:mb-12 text-secondary">
      New Arrivals
    </h2>

    {/* View All Button - on the right */}
    <button className="px-6 py-2.5 bg-white text-[#4EA674] border border-[#4EA674] rounded-full font-medium hover:bg-[#4EA674] hover:text-white transition">
      View All →
    </button>
  </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {/* First Card - Gradient Background */}
      <div className="bg-gradient-to-br from-[#EAF8E7] to-[#21C45D] rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col h-full">

        {/* Content at TOP */}
        <div className="p-6 md:p-8 flex flex-col flex-grow">
          <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3 line-clamp-2">
            Apex $50W Monocrystallalle Panel
          </h3>

          <p className="text-sm md:text-base text-gray-700 mb-6 line-clamp-3">
            This is a brief product description
          </p>

          {/* Image at BOTTOM */}
          <div className="relative mt-auto h-48 md:h-56">
            <Image
              src="/solarpanel.png"
              alt="Apex $50W Monocrystallalle Panel"
            fill
            className="object-contain p-6"
          />
        </div>

          {/* Button */}
          <button className="mt-auto bg-white text-[#4EA674] py-3 rounded-full font-bold hover:bg-[#3D8B59] transition">
            Shop Now
          </button>
        </div>
      </div>

      {/* Other 3 Cards - White Background */}
      {[
        {
          title: "Lithium LiFePO4 Battery 12 / 100Ah",
          desc: "Upgrade your energy storage with...",
          price: "₦119.99",
          image: "/offer.jpg",
        },
        {
          title: "Solar Motion Sensor Light (24z)",
          desc: "Upgrade your energy storage with...",
          price: "₦119.99",
          image: "/offer.jpg",
        },
        {
          title: "MPPT Charge Controller 60A",
          desc: "Upgrade your energy storage with...",
          price: "₦119.99",
          image: "/offer.jpg",
        },
      ].map((product, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col h-full"
        >
          {/* Hot Badge + Heart */}
          <div className="flex items-center justify-between p-4 md:p-5">
            <div className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase">
              Hot
            </div>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Image at BOTTOM */}
          <div className="relative mt-auto h-48 md:h-56">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-6"
            />
          </div>

          {/* Content at TOP */}
          <div className="p-6 md:p-8 flex flex-col flex-grow">
            <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3 line-clamp-2">
              {product.title}
            </h3>

            <p className="text-sm md:text-base text-gray-600 mb-6 line-clamp-3">
              {product.desc}
            </p>

            {/* Rating + Stock */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, s) => (
                  <Star
                    key={s}
                    className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-green-600">In stock</span>
            </div>

            {/* Price */}
            <p className="text-2xl md:text-3xl font-black text-[#4EA674] mb-6">
              {product.price}
            </p>

            {/* Buttons */}
            <div className="mt-auto flex gap-3">
              <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-3 rounded-full font-bold hover:bg-[#4EA674] hover:text-white transition text-sm md:text-base">
                View Details
              </button>
              <button className="flex-1 bg-[#4EA674] text-white py-3 rounded-full font-bold hover:bg-[#3D8B59] transition text-sm md:text-base">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
{/* ================================================ */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-[#EAF8E7] to-[#21C45D]">
  <div className="container mx-auto px-4 relative">
    {/* Container for image + text overlay */}
    <div className="relative">
      {/* Large Solar Panel Image - now smaller */}
      <div className="flex justify-start">
        <div className="relative w-full max-w-3xl lg:max-w-4xl"> {/* ← reduced max width */}
          <Image
            src="/solarpanel.png"
            alt="Rilsopower Stabilizers Solar Panel"
            width={500}          // ← smaller base width
            height={500}          // ← adjusted aspect ratio
            className="object-contain drop-shadow-2xl mx-auto"
            priority
          />
        </div>
      </div>

      {/* Text positioned TOP-RIGHT */}
      <div className="absolute top-6 right-8 md:top-12 md:right-12 lg:top-16 lg:right-16 z-10 max-w-sm lg:max-w-lg text-right">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 md:mb-4 drop-shadow-lg">
          Rilsopower Stabilizers
        </h2>
        <p className="text-lg md:text-xl text-gray-700 font-medium mb-6 md:mb-8">
          Hurry and get the best of automatic voltage regulators
        </p>
        <button className="px-8 md:px-12 py-4 md:py-5 bg-[#023337] text-[#21C45D] font-bold text-lg md:text-xl rounded-full hover:bg-[#3D8B59] transition shadow-lg transform hover:scale-105">
          Shop Now
        </button>
      </div>
    </div>

 {/* 6 Small Product Cards - EXACT MATCH to Frame 4441 */}
    <div
      className="absolute flex flex-row items-center gap-[22px]"
      style={{
        width: '1355.65px',
        height: '120px',
        left: 'calc(50% - 1355.65px / 2 - 19.18px)',
        top: '450px',
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex items-center w-[210px] h-full p-3 gap-3 flex-shrink-0"
        >
          {/* Image on LEFT */}
          <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src="/solarpanel.png"
              alt="AE Dunamis"
              fill
              className=" p-2"
            />
          </div>

          {/* Text & Info on RIGHT */}
          <div className="flex-1 text-left flex flex-col justify-center">
            <h4 className="font-bold text-xs text-gray-900 mb-1 line-clamp-2">
              AE Dunamis
            </h4>

            {/* Rating */}
            <div className="flex items-center gap-0.5 mb-1">
              {[...Array(5)].map((_, s) => (
                <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <p className="text-[10px] text-green-600 font-bold mb-1">In stock</p>

            <p className="text-sm font-black text-[#4EA674]">
              ₦40.99
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      
      
{/* ===  INVERTER BATTERIES PROMO + 3 BATTERY CARDS === */}
{/* ================================================ */}

<div className="container mx-auto px-4 py-16 lg:py-24">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
    {/* LEFT - Large Inverter Batteries Banner */}
    <div className="relative rounded-3xl overflow-hidden h-[500px] lg:h-[680px] bg-gradient-to-br from-[#0A2F1A] to-[#0D3B22] shadow-2xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#023337] to-[#000000]" />

      {/* Main Image - tilted solar panel with stand */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-4/5 max-w-xl -rotate-6 transform-gpu">
          <Image
            src="/solarpanel.png"  // ← your PNG with transparent bg + stand
            alt="Inverter Batteries Solar Panel"
            width={900}
            height={700}
            priority
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Text content - bottom left */}
      <div className="absolute bottom-8 left-8 md:left-12 right-8 text-left z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
          Inverter Batteries
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-medium max-w-2xl">
          Power When You Need It Most: Inverter Batteries for Your Solar System
        </p>
      </div>
    </div>

    {/* RIGHT - AFRICICELL Hot Card */}
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
      {/* Top image */}
      <div className="relative h-32 md:h-40">
        <Image
          src="/offer.jpg"  // ← replace with your actual product image
          alt="AFRICICELL 10KWH HY Wall Mounted"
          fill
          className="object-cover"
        />

        {/* Hot badge */}
        <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
          Hot
        </div>

        {/* Heart */}
        <button className="absolute top-6 right-6 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition">
          <Heart className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          AFRICICELL (10KWH)HY Wall Mounted
        </h3>
        <p className="text-lg text-gray-700 mb-4">LITHIUM BATTERY</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="ml-2 text-green-600 font-bold">In stock</span>
        </div>

        {/* Price */}
        <p className="text-4xl md:text-5xl font-black text-[#4EA674] mb-8">
          ₦1,700,000.00
        </p>

        {/* Buttons */}
        <div className="mt-auto flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-[#4EA674] text-white py-4 rounded-full font-bold hover:bg-[#3D8B59] transition text-lg">
            Add to cart
          </button>
          <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-4 rounded-full font-bold hover:bg-[#4EA674] hover:text-white transition text-lg">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>

{/* BOTTOM - 3 Full-width Battery Type Cards */}
<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
  {/* Dry Cell */}
  <div className="relative rounded-3xl overflow-hidden h-96 group shadow-2xl bg-red-600">
    {/* Solid red background */}
    <div className="absolute inset-0 bg-red-600" />

    {/* Image on RIGHT */}
    <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-16">
      <div className="relative w-3/5 md:w-1/2 h-full">
        <Image
          src="/solarpanel.png" 
          alt="Dry Cell Batteries"
          fill
          className="object-contain object-right group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>

    {/* Text + Button on LEFT */}
    <div className="relative z-10 h-full flex items-center pl-10 md:pl-16">
      <div className="text-left max-w-[50%]">
        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
          Dry Cell
        </h3>
        <p className="text-xl md:text-2xl text-white/90 font-medium mb-8">
          Dry Cell Batteries
        </p>
        <button className="px-10 py-5 bg-white text-red-700 font-bold rounded-full hover:bg-gray-100 transition text-lg">
          View Details
        </button>
      </div>
    </div>
  </div>

  {/* Gel */}
  <div className="relative rounded-3xl overflow-hidden h-96 group shadow-2xl bg-yellow-500">
    <div className="absolute inset-0 bg-yellow-500" />

    <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-16">
      <div className="relative w-3/5 md:w-1/2 h-full">
        <Image
          src="/solarpanel.png"
          alt="Gel Batteries"
          fill
          className="object-contain object-right group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>

    <div className="relative z-10 h-full flex items-center pl-10 md:pl-16">
      <div className="text-left max-w-[55%]">
        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
          Gel
        </h3>
        <p className="text-xl md:text-2xl text-white/90 font-medium mb-8">
          Gel Batteries
        </p>
        <button className="px-10 py-5 bg-white text-yellow-700 font-bold rounded-full hover:bg-gray-100 transition text-lg">
          View Details
        </button>
      </div>
    </div>
  </div>

  {/* Tubular */}
  <div className="relative rounded-3xl overflow-hidden h-96 group shadow-2xl bg-green-800">
    <div className="absolute inset-0 bg-green-800" />

    <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-16">
      <div className="relative w-3/5 md:w-1/2 h-full">
        <Image
          src="/solarpanel.png"
          alt="Tubular Batteries"
          fill
          className="object-contain object-right group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>

    <div className="relative z-10 h-full flex items-center pl-10 md:pl-16">
      <div className="text-left max-w-[55%]">
        <h3 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
          Tubular
        </h3>
        <p className="text-xl md:text-2xl text-white/90 font-medium mb-8">
          Tubular Batteries
        </p>
        <button className="px-10 py-5 bg-white text-green-800 font-bold rounded-full hover:bg-gray-100 transition text-lg">
          View Details
        </button>
      </div>
    </div>
  </div>
</div>
</div>
      {/* ==================== FOOTER ==================== */}
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
    </main>
  );
}