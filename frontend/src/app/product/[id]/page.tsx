"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import FeedbackModal from '../../../components/FeedbackModal';
import FeaturesSection from '../../../components/FeaturesSection';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useCart } from '../../../contexts/CartContext';
import { useNotification } from '../../../contexts/NotificationContext';
import styles from './ProductPage.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  ingredients?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Sample products data - in real app this would come from API
  const products: Product[] = [
    {
      id: '1',
      name: 'Croissant',
      description: 'Fresh baked croissant with buttery layers, perfect for breakfast or as a light snack. Made with premium butter and traditional French techniques.',
      price: 3.50,
      image: '/images/menuitem1.png',
      category: 'Pastries',
      available: true,
      ingredients: ['Flour', 'Butter', 'Yeast', 'Salt', 'Sugar'],
      nutritionInfo: {
        calories: 231,
        protein: 4.2,
        carbs: 25.8,
        fat: 12.1
      }
    },
    {
      id: '2',
      name: 'Pain au Chocolat',
      description: 'Chocolate filled pastry with flaky layers, a perfect combination of buttery pastry and rich chocolate.',
      price: 4.00,
      image: '/images/menuitem2.png',
      category: 'Pastries',
      available: true,
      ingredients: ['Flour', 'Butter', 'Chocolate', 'Yeast', 'Salt', 'Sugar'],
      nutritionInfo: {
        calories: 280,
        protein: 5.1,
        carbs: 28.5,
        fat: 16.2
      }
    },
    {
      id: '3',
      name: 'Baguette',
      description: 'Traditional French bread with crispy crust and soft interior, perfect for sandwiches or as a side.',
      price: 2.50,
      image: '/images/menuitem3.png',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 265,
        protein: 8.8,
        carbs: 52.0,
        fat: 1.2
      }
    },
    {
      id: '4',
      name: 'Sandwich',
      description: 'Fresh sandwich with premium ingredients, perfect for lunch or a quick meal.',
      price: 5.50,
      image: '/images/menuitem4.png',
      category: 'Lunch',
      available: true,
      ingredients: ['Bread', 'Lettuce', 'Tomato', 'Cheese', 'Meat', 'Mayo'],
      nutritionInfo: {
        calories: 420,
        protein: 18.5,
        carbs: 35.2,
        fat: 22.1
      }
    },
    {
      id: '5',
      name: 'Quiche Lorraine',
      description: 'Classic French quiche with bacon and cheese, a savory pie perfect for brunch or lunch.',
      price: 6.00,
      image: '/images/menuitem1.png',
      category: 'Lunch',
      available: true,
      ingredients: ['Pastry', 'Eggs', 'Bacon', 'Cheese', 'Cream', 'Onions'],
      nutritionInfo: {
        calories: 380,
        protein: 15.2,
        carbs: 18.5,
        fat: 28.8
      }
    },
    {
      id: '6',
      name: 'Caesar Salad',
      description: 'Fresh salad with romaine lettuce and caesar dressing, topped with parmesan and croutons.',
      price: 7.50,
      image: '/images/menuitem2.png',
      category: 'Lunch',
      available: true,
      ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing', 'Lemon'],
      nutritionInfo: {
        calories: 320,
        protein: 12.5,
        carbs: 15.8,
        fat: 24.2
      }
    },
    {
      id: '7',
      name: 'Cappuccino',
      description: 'Rich espresso with steamed milk foam, the perfect coffee drink for any time of day.',
      price: 2.00,
      image: '/images/menuitem3.png',
      category: 'Beverages',
      available: true,
      ingredients: ['Espresso', 'Steamed Milk', 'Milk Foam'],
      nutritionInfo: {
        calories: 80,
        protein: 4.2,
        carbs: 6.8,
        fat: 3.5
      }
    },
    {
      id: '8',
      name: 'Earl Grey Tea',
      description: 'Classic black tea with bergamot flavor, a sophisticated and aromatic tea experience.',
      price: 1.50,
      image: '/images/menuitem4.png',
      category: 'Beverages',
      available: true,
      ingredients: ['Black Tea', 'Bergamot Oil'],
      nutritionInfo: {
        calories: 2,
        protein: 0.1,
        carbs: 0.5,
        fat: 0.0
      }
    },
    {
      id: '9',
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with ganache frosting, a decadent dessert perfect for special occasions.',
      price: 4.50,
      image: '/images/menuitem1.png',
      category: 'Desserts',
      available: true,
      ingredients: ['Flour', 'Cocoa', 'Sugar', 'Butter', 'Eggs', 'Chocolate'],
      nutritionInfo: {
        calories: 450,
        protein: 6.8,
        carbs: 58.2,
        fat: 22.5
      }
    },
    {
      id: '10',
      name: 'Macaron Assortment',
      description: 'Colorful French macarons in various flavors, a delicate and elegant treat.',
      price: 1.50,
      image: '/images/menuitem2.png',
      category: 'Desserts',
      available: true,
      ingredients: ['Almond Flour', 'Sugar', 'Egg Whites', 'Food Coloring', 'Filling'],
      nutritionInfo: {
        calories: 95,
        protein: 2.1,
        carbs: 12.8,
        fat: 4.2
      }
    }
  ];

  useEffect(() => {
    const productId = params.id as string;
    const foundProduct = products.find(p => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Product not found, redirect to 404 or home
      router.push('/');
    }
    
    setLoading(false);
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          available: product.available,
          isSet: false
        });
      }
      showNotification(`${product.name} added to cart (${quantity} item${quantity > 1 ? 's' : ''})`);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className={styles.productPage}>
        <Header />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.productPage}>
        <Header />
        <div className={styles.notFoundState}>
          <h2>Product not found</h2>
          <button onClick={() => router.push('/')} className={styles.backButton}>
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productPage}>
      <Header />
      
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbsContainer}>
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: product.category, href: `/${product.category.toLowerCase()}` },
              { label: product.name, isActive: true }
            ]}
          />
        </div>
      </div>

      {/* Product Content */}
      <div className={styles.productContent}>
        <div className={styles.productContainer}>
          {/* Product Images */}
          <div className={styles.productImages}>
            <div className={styles.mainImage}>
              <Image
                src={product.image || '/images/placeholder-food.svg'}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h1 className={styles.productName}>{product.name}</h1>
              <div className={styles.productCategory}>{product.category}</div>
            </div>

            <div className={styles.productPrice}>₼{product.price.toFixed(2)}</div>

            <div className={styles.productDescription}>
              {product.description}
            </div>

            {/* Quantity Selector */}
            <div className={styles.quantitySection}>
              <label className={styles.quantityLabel}>Quantity:</label>
              <div className={styles.quantityControls}>
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className={styles.quantityButton}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className={styles.quantityButton}
                  disabled={quantity >= 10}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={styles.addToCartButton}
              disabled={!product.available}
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>

            {/* Product Details */}
            {product.ingredients && (
              <div className={styles.productDetails}>
                <h3 className={styles.detailsTitle}>Ingredients</h3>
                <ul className={styles.ingredientsList}>
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index} className={styles.ingredientItem}>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.nutritionInfo && (
              <div className={styles.productDetails}>
                <h3 className={styles.detailsTitle}>Nutrition Information</h3>
                <div className={styles.nutritionGrid}>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>Calories</span>
                    <span className={styles.nutritionValue}>{product.nutritionInfo.calories}</span>
                  </div>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>Protein</span>
                    <span className={styles.nutritionValue}>{product.nutritionInfo.protein}g</span>
                  </div>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>Carbs</span>
                    <span className={styles.nutritionValue}>{product.nutritionInfo.carbs}g</span>
                  </div>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>Fat</span>
                    <span className={styles.nutritionValue}>{product.nutritionInfo.fat}g</span>
                  </div>
                </div>
              </div>
            )}
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