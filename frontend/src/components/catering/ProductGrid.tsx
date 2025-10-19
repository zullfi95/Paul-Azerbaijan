"use client";

import React from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import BasketIcon from '../BasketIcon';
import { CartItem } from '../../config/api';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  items: CartItem[];
  onAddToCart: (item: CartItem) => void;
}

export default function ProductGrid({ items, onAddToCart }: ProductGridProps) {
  const router = useRouter();

  return (
    <div className={styles.productGridSection}>
      {/* Product Grid */}
      <div className={styles.productGrid}>
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.productCard}
          >
            {/* Product Image */}
            <div 
              className={styles.productImageContainer}
              onClick={() => router.push(`/product/${item.id}`)}
            >
              <Image
                src={item.image || '/images/placeholder.png'}
                alt={item.name}
                layout="fill"
                className={styles.productImage}
              />
              
              {/* Add to Cart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
                className={styles.productAddToCartButton}
              >
                <BasketIcon 
                  size={18}
                  style={{
                    color: '#1A1A1A',
                    fill: '#1A1A1A'
                  }}
                />
              </button>
            </div>

            {/* Product Info */}
            <div className={styles.productInfo}>
              <h3 className={styles.productTitle}>
                {item.name}
              </h3>
              <p className={styles.productDescription}>
                {item.description}
              </p>
              
              <div className={styles.productPriceContainer}>
                <span className={styles.productPrice}>
                  {item.price} ₼
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className={styles.viewMoreContainer}>
        <button className={styles.viewMoreButton}>
          View More
        </button>
      </div>

      {/* Catering Description */}
      <div className={styles.cateringDescription}>
        <h2>Catering from PAUL</h2>
        <p>
          At PAUL, we take pride in offering exceptional catering services that bring the delightful flavors of our restaurant directly to your event. Whether it's a corporate gathering, wedding, or a casual get-together, our team is dedicated to providing a seamless experience tailored to your needs. Our menu features a variety of freshly prepared dishes, showcasing the best of French cuisine. With a focus on quality ingredients and presentation, we ensure that every bite is a memorable one. Let us help you create an unforgettable dining experience for your guests!
        </p>
      </div>
    </div>
  );
}
