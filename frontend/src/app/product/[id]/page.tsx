"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import FeaturesSection from '../../../components/FeaturesSection';
import BasketIcon from '../../../components/BasketIcon';
import Breadcrumbs from '../../../components/Breadcrumbs';
import FeedbackModal from '../../../components/FeedbackModal';
import { useCart } from '../../../contexts/CartContext';
import Link from 'next/link';
import styles from './ProductPage.module.css';
import Image from "next/image";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  weight: string;
  storage: string;
  nutritionalInfo: string;
  allergens: string[];
  allergensText: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  available: boolean;
}

// Mock data - в реальном приложении это будет загружаться из API
const products: Product[] = [
  {
    id: '1',
    name: 'Creamy sweet croissants, 12 pcs',
    description: 'Indulge in a delightful box of 12 croissants from PAUL, featuring a tempting mix of flavors. Each croissant is freshly baked to perfection, making them ideal for any occasion. Whether you\'re hosting a brunch or enjoying a quiet afternoon, these treats are sure to impress!',
    price: 80,
    image: '/images/menuitem1.png',
    category: 'Sweet French pastries',
    available: true,
    weight: '460 g',
    storage: 'Store at 1°C - 5°C',
    nutritionalInfo: 'Calories: 320 per 100g, Fat: 18g, Carbohydrates: 35g, Protein: 6g, Sugar: 12g',
    allergens: ['Milk', 'Eggs', 'Gluten'],
    allergensText: 'Our products may contain allergens such as peanuts, tree nuts, soy, milk, eggs, and wheat. We strive to reduce cross-contamination risks, but cannot ensure safety for those with allergies.'
  },
  {
    id: '2',
    name: 'Stuffed croissants, perfect bites, 20 pcs',
    description: 'A perfect selection of 20 stuffed croissants with various savory fillings. Ideal for catering events and gatherings.',
    price: 40,
    image: '/images/menuitem2.png',
    category: 'Savory filled pastries and quiche',
    available: true,
    weight: '600 g',
    storage: 'Store at 1°C - 5°C',
    nutritionalInfo: 'Calories: 280 per 100g, Fat: 15g, Carbohydrates: 28g, Protein: 8g, Sugar: 3g',
    allergens: ['Milk', 'Gluten'],
    allergensText: 'Our products may contain allergens such as peanuts, tree nuts, soy, milk, eggs, and wheat. We strive to reduce cross-contamination risks, but cannot ensure safety for those with allergies.'
  },
  {
    id: '3',
    name: 'Mini eclairs, savory delights, 6 pcs',
    description: 'Delicate mini eclairs with savory fillings, perfect for elegant appetizers.',
    price: 20,
    image: '/images/menuitem3.png',
    category: 'Savory filled pastries and quiche',
    available: true,
    weight: '200 g',
    storage: 'Store at 1°C - 5°C',
    nutritionalInfo: 'Calories: 350 per 100g, Fat: 22g, Carbohydrates: 30g, Protein: 7g, Sugar: 8g',
    allergens: ['Milk', 'Eggs', 'Gluten'],
    allergensText: 'Our products may contain allergens such as peanuts, tree nuts, soy, milk, eggs, and wheat. We strive to reduce cross-contamination risks, but cannot ensure safety for those with allergies.'
  },
  {
    id: '4',
    name: 'Fruit tarts, sweet treats, 25 pcs',
    description: 'Beautiful assortment of fruit tarts with fresh seasonal fruits and delicate pastry.',
    price: 50,
    image: '/images/menuitem4.png',
    category: 'Desserts and cakes',
    available: true,
    weight: '750 g',
    storage: 'Store at 1°C - 5°C',
    nutritionalInfo: 'Calories: 290 per 100g, Fat: 12g, Carbohydrates: 42g, Protein: 4g, Sugar: 25g',
    allergens: ['Milk', 'Eggs', 'Gluten'],
    allergensText: 'Our products may contain allergens such as peanuts, tree nuts, soy, milk, eggs, and wheat. We strive to reduce cross-contamination risks, but cannot ensure safety for those with allergies.'
  }
];

const relatedProducts: RelatedProduct[] = [
  {
    id: '2',
    name: 'Stuffed croissants, perfect bites, 20 pcs',
    price: 40,
    image: '/images/menuitem2.png',
    description: 'A perfect selection of 20 stuffed croissants with various savory fillings.',
    category: 'Savory filled pastries and quiche',
    available: true
  },
  {
    id: '3',
    name: 'Mini eclairs, savory delights, 6 pcs',
    price: 20,
    image: '/images/menuitem3.png',
    description: 'Delicate mini eclairs with savory fillings, perfect for elegant appetizers.',
    category: 'Savory filled pastries and quiche',
    available: true
  },
  {
    id: '4',
    name: 'Fruit tarts, sweet treats, 25 pcs',
    price: 50,
    image: '/images/menuitem4.png',
    description: 'Beautiful assortment of fruit tarts with fresh seasonal fruits.',
    category: 'Desserts and cakes',
    available: true
  },
  {
    id: '1',
    name: 'Creamy sweet croissants, 12 pcs',
    price: 80,
    image: '/images/menuitem1.png',
    description: 'Indulge in a delightful box of 12 croissants from PAUL.',
    category: 'Sweet French pastries',
    available: true
  }
];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('allergens'); // По умолчанию открыта секция аллергенов
  const [showAddedNotification, setShowAddedNotification] = useState(false);

  const productId = params.id as string;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <Link href="/catering">Back to Menu</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Проверяем, есть ли уже товар в корзине
    const currentQuantity = getItemQuantity(product.id);
    
    if (currentQuantity > 0) {
      // Если товар уже есть в корзине, увеличиваем количество
      updateQuantity(product.id, currentQuantity + quantity);
    } else {
      // Если товара нет в корзине, добавляем его
      addItem({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.image ? [product.image] : [],
        category: product.category,
        available: product.available,
        isSet: false
      });
      
      // Если количество больше 1, увеличиваем до нужного количества
      if (quantity > 1) {
        updateQuantity(product.id, quantity);
      }
    }
    
    // Показываем уведомление
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 3000);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className={styles.productPage}>
      <Header />
      
      {/* Notification */}
      {showAddedNotification && (
        <div className={styles.notification}>
          <div className={styles.notificationContent}>
            <span>✓ Product added to cart!</span>
          </div>
        </div>
      )}
      
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <div className={styles.container}>
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Catering Menu', href: '/catering' },
              { label: product.name, isActive: true }
            ]}
          />
        </div>
      </div>

      {/* Main Product Section */}
      <div className={styles.mainSection}>
        <div className={styles.container}>
          <div className={styles.productContent}>
            {/* Left Column - Product Image */}
            <div className={styles.imageColumn}>
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image || '/images/placeholder-food.svg'}
                  alt={product.name}
                  className={styles.productImage}
                  width={500}
                  height={500}
                />
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className={styles.detailsColumn}>
              <div className={styles.productDetails}>
                {/* Product Info Section */}
                <div className={styles.productInfo}>
                  <h1 className={styles.productName}>{product.name}</h1>
                  <div className={styles.price}>₼{product.price}</div>
                  <div className={styles.weightStorage}>
                    {product.weight}, {product.storage}
                  </div>
                  <p className={styles.description}>{product.description}</p>
                </div>

                {/* Product Actions Section */}
                <div className={styles.productActions}>
                  {/* Quantity Selector */}
                  <div className={styles.quantitySelector}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={styles.quantityBtn}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className={styles.quantityBtn}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={handleAddToCart}
                    className={styles.addToCartBtn}
                  >
                    Add to cart
                  </button>

                  {/* Accordion Sections */}
                  <div className={styles.accordion}>
                    <div className={styles.accordionItem}>
                      <button 
                        className={styles.accordionHeader}
                        onClick={() => toggleAccordion('nutritional')}
                      >
                        <span>Nutritional information</span>
                        <span className={styles.accordionIcon}>
                          {activeAccordion === 'nutritional' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>
                      {activeAccordion === 'nutritional' && (
                        <div className={styles.accordionContent}>
                          <p>{product.nutritionalInfo}</p>
                        </div>
                      )}
                    </div>

                    <div className={styles.accordionItem}>
                      <button 
                        className={styles.accordionHeader}
                        onClick={() => toggleAccordion('allergens')}
                      >
                        <span>Allergens</span>
                        <span className={styles.accordionIcon}>
                          {activeAccordion === 'allergens' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>
                      {activeAccordion === 'allergens' && (
                        <div className={styles.accordionContent}>
                          <div className={styles.allergensList}>
                            {product.allergens.map((allergen, index) => (
                              <span key={index} className={styles.allergenTag}>
                                {allergen}
                              </span>
                            ))}
                          </div>
                          <p className={styles.allergensText}>{product.allergensText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className={styles.relatedSection}>
        <div className={styles.container}>
          <h2 className={styles.relatedTitle}>Related products</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) => (
              <div 
                key={item.id} 
                className={styles.relatedCard}
                onClick={() => router.push(`/product/${item.id}`)}
              >
                <div className={styles.relatedImageWrapper}>
                  <Image
                    src={item.image || '/images/placeholder-food.svg'}
                    alt={item.name}
                    className={styles.relatedImage}
                    width={300}
                    height={300}
                  />
                  <button 
                    className={styles.relatedCartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        images: item.image ? [item.image] : [],
                        category: item.category,
                        available: item.available,
                        isSet: false
                      });
                      setShowAddedNotification(true);
                      setTimeout(() => setShowAddedNotification(false), 3000);
                    }}
                  >
                    <BasketIcon size={16} />
                  </button>
                </div>
                <h3 className={styles.relatedName}>{item.name}</h3>
                <div className={styles.relatedPrice}>₼{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FeaturesSection />
      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}
