"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "../contexts/CartContext"; // Import CartItem for mock data
import Image from "next/image";

export default function PopularSets() {
  const [sets, setSets] = useState<CartItem[]>([]); // Use CartItem for local state
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart(); // Corrected from addToCart
  const router = useRouter();

  useEffect(() => {
    async function fetchPopularSets() {
      try {
        // Mock data conforming to CartContext's CartItem
        const mockSets: CartItem[] = [
          { id: '101', name: 'Set "Classic"', description: 'A classic collection of our best dishes.', price: 49.99, image: '/images/set1.jpg', category: 'Sets', available: true, isSet: true, quantity: 1 },
          { id: '102', name: 'Set "Deluxe"', description: 'An exquisite selection for true gourmets.', price: 79.99, image: '/images/set2.jpg', category: 'Sets', available: true, isSet: true, quantity: 1 },
          { id: '103', name: 'Set "Fiesta"', description: 'A bright and festive set for any party.', price: 65.50, image: '/images/set3.jpg', category: 'Sets', available: true, isSet: true, quantity: 1 },
        ];
        setSets(mockSets);

      } catch (error) {
        console.error("Error fetching popular sets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPopularSets();
  }, []);

  const handleAddToCart = (set: CartItem) => {
    addItem(set);
    // You can add a toast notification here
  };
  
  if (loading) {
    return (
        <div className="text-center py-10">
            <p>Loading popular sets...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Популярные наборы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sets.map((set) => (
          <div
            key={set.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={() => router.push(`/product/${set.id}`)}
          >
            <div className="relative h-64 w-full">
              <Image
                src={set.image || '/images/placeholder.jpg'}
                alt={set.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{set.name}</h3>
              <p className="text-gray-700 mb-4 line-clamp-2">{set.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-bold">{set.price} ₼</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation when clicking the button
                    handleAddToCart(set);
                  }}
                  className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
