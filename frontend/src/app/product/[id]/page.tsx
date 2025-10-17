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
    // Cakes
    {
      id: '1',
      name: 'Stuffed croissants, perfect bites',
      description: '20 pcs - Fresh baked croissants with various fillings, perfect for breakfast or as a light snack.',
      price: 40,
      image: '/images/cake5.jpg',
      category: 'Cakes',
      available: true,
      ingredients: ['Flour', 'Butter', 'Yeast', 'Salt', 'Sugar', 'Various Fillings'],
      nutritionInfo: {
        calories: 280,
        protein: 6.2,
        carbs: 32.5,
        fat: 14.8
      }
    },
    {
      id: '2',
      name: 'Mini eclairs, savory delights',
      description: '6 pcs - Delicate mini eclairs with savory fillings, perfect for appetizers.',
      price: 20,
      image: '/images/cake6.jpg',
      category: 'Cakes',
      available: true,
      ingredients: ['Flour', 'Butter', 'Eggs', 'Cream', 'Salt'],
      nutritionInfo: {
        calories: 320,
        protein: 8.1,
        carbs: 28.5,
        fat: 18.2
      }
    },
    {
      id: '3',
      name: 'Fruit tarts, sweet treats',
      description: '25 pcs - Fresh fruit tarts with seasonal fruits and cream filling.',
      price: 50,
      image: '/images/pies.jpg',
      category: 'Cakes',
      available: true,
      ingredients: ['Flour', 'Butter', 'Sugar', 'Fresh Fruits', 'Cream'],
      nutritionInfo: {
        calories: 265,
        protein: 4.8,
        carbs: 35.0,
        fat: 12.1
      }
    },
    {
      id: '4',
      name: 'Creamy sweet croissants',
      description: '12 pcs - Sweet croissants with creamy fillings and glazes.',
      price: 80,
      image: '/images/pies2.png',
      category: 'Cakes',
      available: true,
      ingredients: ['Flour', 'Butter', 'Yeast', 'Sugar', 'Cream', 'Glaze'],
      nutritionInfo: {
        calories: 350,
        protein: 5.2,
        carbs: 42.8,
        fat: 16.5
      }
    },
    {
      id: '5',
      name: 'Chocolate cake with macarons',
      description: '1 whole cake - Rich chocolate cake decorated with colorful macarons.',
      price: 45,
      image: '/images/cake5.jpg',
      category: 'Cakes',
      available: true,
      ingredients: ['Flour', 'Cocoa', 'Sugar', 'Butter', 'Eggs', 'Chocolate', 'Macarons'],
      nutritionInfo: {
        calories: 450,
        protein: 6.8,
        carbs: 58.2,
        fat: 22.5
      }
    },
    {
      id: '6',
      name: 'Cheesecake with berries',
      description: '1 whole cake - Creamy cheesecake topped with fresh berries.',
      price: 35,
      image: '/images/cake6.jpg',
      category: 'Cakes',
      available: true,
      ingredients: ['Cream Cheese', 'Sugar', 'Eggs', 'Graham Crackers', 'Fresh Berries'],
      nutritionInfo: {
        calories: 380,
        protein: 8.5,
        carbs: 42.1,
        fat: 20.8
      }
    },
    {
      id: '7',
      name: 'Layered raspberry cake',
      description: '1 whole cake - Multi-layered cake with raspberry filling and cream.',
      price: 42,
      image: '/images/pies.jpg',
      category: 'Cakes',
      available: true,
      ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs', 'Raspberries', 'Cream'],
      nutritionInfo: {
        calories: 420,
        protein: 7.2,
        carbs: 52.8,
        fat: 18.5
      }
    },
    {
      id: '8',
      name: 'Vanilla bean cheesecake',
      description: '1 whole cake - Classic vanilla bean cheesecake with graham cracker crust.',
      price: 38,
      image: '/images/pies2.png',
      category: 'Cakes',
      available: true,
      ingredients: ['Cream Cheese', 'Vanilla Beans', 'Sugar', 'Eggs', 'Graham Crackers'],
      nutritionInfo: {
        calories: 365,
        protein: 8.1,
        carbs: 38.5,
        fat: 19.2
      }
    },
    {
      id: '9',
      name: 'Red velvet cake',
      description: '1 whole cake - Classic red velvet cake with cream cheese frosting.',
      price: 40,
      image: '/images/cake5.jpg',
      category: 'Cakes',
      available: true,
      ingredients: ['Flour', 'Cocoa', 'Red Food Coloring', 'Butter', 'Sugar', 'Cream Cheese'],
      nutritionInfo: {
        calories: 410,
        protein: 6.5,
        carbs: 48.2,
        fat: 21.8
      }
    },
    // Bread
    {
      id: 'b1',
      name: 'Baguette Tradition',
      description: 'Classic French baguette with crispy crust and soft interior, perfect for sandwiches or as a side.',
      price: 2.50,
      image: '/images/Savoury.jpg',
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
      id: 'b2',
      name: 'Pain de Campagne',
      description: 'Country-style sourdough bread with rustic flavor and texture.',
      price: 3.50,
      image: '/images/Savoury (2).jpg',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Sourdough Starter', 'Salt'],
      nutritionInfo: {
        calories: 280,
        protein: 9.2,
        carbs: 55.0,
        fat: 1.5
      }
    },
    {
      id: 'b3',
      name: 'Brioche',
      description: 'Rich, buttery bread with a tender crumb, perfect for breakfast or dessert.',
      price: 4.00,
      image: '/images/cake3.png',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Butter', 'Eggs', 'Sugar', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 350,
        protein: 8.5,
        carbs: 45.0,
        fat: 15.2
      }
    },
    {
      id: 'b4',
      name: 'Pain aux Noix',
      description: 'Walnut bread with crunchy nuts throughout, a perfect accompaniment to cheese.',
      price: 4.50,
      image: '/images/Savoury.jpg',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Walnuts', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 320,
        protein: 10.5,
        carbs: 48.0,
        fat: 8.5
      }
    },
    {
      id: 'b5',
      name: 'Focaccia',
      description: 'Italian herb bread with olive oil and aromatic herbs.',
      price: 3.00,
      image: '/images/Savoury.jpg',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Olive Oil', 'Herbs', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 290,
        protein: 8.0,
        carbs: 50.0,
        fat: 6.5
      }
    },
    {
      id: 'b6',
      name: 'Pain aux Olives',
      description: 'Olive bread with Mediterranean flavors and tender texture.',
      price: 4.00,
      image: '/images/Savoury (2).jpg',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Olives', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 310,
        protein: 9.0,
        carbs: 52.0,
        fat: 7.2
      }
    },
    {
      id: 'b7',
      name: 'Challah',
      description: 'Traditional Jewish bread with a soft, slightly sweet flavor.',
      price: 3.50,
      image: '/images/Savoury (3).jpg',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Eggs', 'Sugar', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 300,
        protein: 9.5,
        carbs: 48.0,
        fat: 6.8
      }
    },
    {
      id: 'b8',
      name: 'Pain de Mie',
      description: 'Soft sandwich bread perfect for toasting and sandwiches.',
      price: 2.50,
      image: '/images/Savoury.jpg',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Milk', 'Butter', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 280,
        protein: 8.5,
        carbs: 50.0,
        fat: 4.5
      }
    },
    {
      id: 'b9',
      name: 'Pain aux Céréales',
      description: 'Multi-grain bread with various seeds and grains for added nutrition.',
      price: 4.00,
      image: '/images/Savoury (2).jpg',
      category: 'Bread',
      available: true,
      ingredients: ['Flour', 'Water', 'Mixed Grains', 'Seeds', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 320,
        protein: 11.0,
        carbs: 55.0,
        fat: 5.5
      }
    },
    // Patisserie
    {
      id: 'p1',
      name: 'Éclair au Chocolat',
      description: 'Classic chocolate éclair with rich chocolate filling and glaze.',
      price: 4.50,
      image: '/images/Patisserie3.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Eggs', 'Chocolate', 'Cream'],
      nutritionInfo: {
        calories: 320,
        protein: 6.5,
        carbs: 35.0,
        fat: 18.5
      }
    },
    {
      id: 'p2',
      name: 'Éclair à la Vanille',
      description: 'Vanilla cream éclair with smooth vanilla filling.',
      price: 4.50,
      image: '/images/Patisserie2.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Eggs', 'Vanilla', 'Cream'],
      nutritionInfo: {
        calories: 310,
        protein: 6.2,
        carbs: 34.0,
        fat: 17.8
      }
    },
    {
      id: 'p3',
      name: 'Profiteroles',
      description: 'Cream puffs with chocolate sauce, a classic French dessert.',
      price: 6.00,
      image: '/images/Patisserie2.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Eggs', 'Cream', 'Chocolate Sauce'],
      nutritionInfo: {
        calories: 380,
        protein: 7.5,
        carbs: 42.0,
        fat: 20.5
      }
    },
    {
      id: 'p4',
      name: 'Mille-feuille',
      description: 'Napoleon pastry with layers of puff pastry and cream.',
      price: 5.50,
      image: '/images/Patisserie4.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Puff Pastry', 'Cream', 'Sugar', 'Vanilla'],
      nutritionInfo: {
        calories: 420,
        protein: 6.8,
        carbs: 45.0,
        fat: 24.2
      }
    },
    {
      id: 'p5',
      name: 'Tarte Tatin',
      description: 'Upside-down apple tart with caramelized apples.',
      price: 7.00,
      image: '/images/Patisserie3.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Apples', 'Sugar', 'Butter', 'Flour', 'Cinnamon'],
      nutritionInfo: {
        calories: 350,
        protein: 4.5,
        carbs: 48.0,
        fat: 16.8
      }
    },
    {
      id: 'p6',
      name: 'Tarte aux Fruits',
      description: 'Fresh fruit tart with seasonal fruits and pastry cream.',
      price: 6.50,
      image: '/images/Patisserie2.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Fresh Fruits', 'Pastry Cream', 'Sugar'],
      nutritionInfo: {
        calories: 320,
        protein: 5.2,
        carbs: 42.0,
        fat: 14.5
      }
    },
    {
      id: 'p7',
      name: 'Lemon Tart',
      description: 'Tangy lemon curd tart with buttery pastry shell.',
      price: 5.50,
      image: '/images/Patisserie2.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Lemons', 'Sugar', 'Eggs'],
      nutritionInfo: {
        calories: 340,
        protein: 5.8,
        carbs: 45.0,
        fat: 16.2
      }
    },
    {
      id: 'p8',
      name: 'Chocolate Tart',
      description: 'Rich chocolate ganache tart with dark chocolate filling.',
      price: 6.00,
      image: '/images/Patisserie4.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Dark Chocolate', 'Cream', 'Sugar'],
      nutritionInfo: {
        calories: 450,
        protein: 6.5,
        carbs: 48.0,
        fat: 28.5
      }
    },
    {
      id: 'p9',
      name: 'Paris-Brest',
      description: 'Ring-shaped pastry filled with praline cream.',
      price: 6.50,
      image: '/images/Patisserie3.jpg',
      category: 'Patisserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Eggs', 'Praline', 'Cream'],
      nutritionInfo: {
        calories: 480,
        protein: 8.2,
        carbs: 42.0,
        fat: 32.5
      }
    },
    // Viennoiserie
    {
      id: 'v1',
      name: 'Classic Croissant',
      description: 'Buttery French croissant with flaky layers, perfect for breakfast.',
      price: 3.50,
      image: '/images/Viennoiserie2.png',
      category: 'Viennoiserie',
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
      id: 'v2',
      name: 'Chocolate Croissant',
      description: 'Croissant with rich chocolate filling, a perfect sweet treat.',
      price: 4.50,
      image: '/images/Viennoiserie2.png',
      category: 'Viennoiserie',
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
      id: 'v3',
      name: 'Almond Croissant',
      description: 'Croissant with almond cream filling and sliced almonds on top.',
      price: 5.00,
      image: '/images/Viennoiserie1.png',
      category: 'Viennoiserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Almonds', 'Almond Cream', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 320,
        protein: 6.8,
        carbs: 32.0,
        fat: 18.5
      }
    },
    {
      id: 'v4',
      name: 'Pain au Chocolat',
      description: 'Chocolate-filled pastry with buttery layers.',
      price: 4.00,
      image: '/images/Viennoiserie4.png',
      category: 'Viennoiserie',
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
      id: 'v5',
      name: 'Danish Pastry',
      description: 'Sweet layered pastry with various fillings and glazes.',
      price: 4.50,
      image: '/images/Viennoiserie3.png',
      category: 'Viennoiserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Sugar', 'Yeast', 'Salt', 'Various Fillings'],
      nutritionInfo: {
        calories: 350,
        protein: 5.5,
        carbs: 38.0,
        fat: 19.2
      }
    },
    {
      id: 'v6',
      name: 'Brioche',
      description: 'Rich, buttery bread with a tender crumb, perfect for breakfast.',
      price: 4.00,
      image: '/images/Viennoiserie1.png',
      category: 'Viennoiserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Eggs', 'Sugar', 'Yeast', 'Salt'],
      nutritionInfo: {
        calories: 350,
        protein: 8.5,
        carbs: 45.0,
        fat: 15.2
      }
    },
    {
      id: 'v7',
      name: 'Pain aux Raisins',
      description: 'Sweet pastry with raisins and custard filling.',
      price: 4.25,
      image: '/images/Viennoiserie2.png',
      category: 'Viennoiserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Raisins', 'Custard', 'Yeast', 'Sugar'],
      nutritionInfo: {
        calories: 320,
        protein: 6.2,
        carbs: 42.0,
        fat: 14.8
      }
    },
    {
      id: 'v8',
      name: 'Chausson aux Pommes',
      description: 'Apple turnover with flaky pastry and spiced apple filling.',
      price: 4.75,
      image: '/images/Viennoiserie3.png',
      category: 'Viennoiserie',
      available: true,
      ingredients: ['Flour', 'Butter', 'Apples', 'Sugar', 'Cinnamon', 'Yeast'],
      nutritionInfo: {
        calories: 380,
        protein: 5.8,
        carbs: 48.0,
        fat: 18.5
      }
    },
    {
      id: 'v9',
      name: 'Palmier',
      description: 'Puff pastry cookies shaped like palm leaves, crispy and sweet.',
      price: 3.25,
      image: '/images/Viennoiserie4.png',
      category: 'Viennoiserie',
      available: true,
      ingredients: ['Puff Pastry', 'Sugar', 'Butter'],
      nutritionInfo: {
        calories: 280,
        protein: 3.5,
        carbs: 32.0,
        fat: 15.8
      }
    },
    // Savoury
    {
      id: 's1',
      name: 'Quiche Lorraine',
      description: 'Classic French quiche with bacon and cheese, perfect for brunch.',
      price: 8.50,
      image: '/images/Savoury3.jpg',
      category: 'Savoury',
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
      id: 's2',
      name: 'Spinach & Feta Quiche',
      description: 'Fresh spinach with creamy feta cheese in a flaky pastry.',
      price: 8.50,
      image: '/images/Savoury2.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Pastry', 'Eggs', 'Spinach', 'Feta Cheese', 'Cream', 'Onions'],
      nutritionInfo: {
        calories: 350,
        protein: 14.8,
        carbs: 16.2,
        fat: 25.5
      }
    },
    {
      id: 's3',
      name: 'Mushroom & Gruyère Quiche',
      description: 'Sautéed mushrooms with aged Gruyère cheese in rich pastry.',
      price: 9.00,
      image: '/images/Savoury2.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Pastry', 'Eggs', 'Mushrooms', 'Gruyère Cheese', 'Cream', 'Herbs'],
      nutritionInfo: {
        calories: 420,
        protein: 16.5,
        carbs: 20.0,
        fat: 32.2
      }
    },
    {
      id: 's4',
      name: 'Tomato & Basil Quiche',
      description: 'Sun-dried tomatoes with fresh basil in a light pastry.',
      price: 8.75,
      image: '/images/Savoury2.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Pastry', 'Eggs', 'Sun-dried Tomatoes', 'Basil', 'Cheese', 'Cream'],
      nutritionInfo: {
        calories: 340,
        protein: 13.5,
        carbs: 18.8,
        fat: 24.5
      }
    },
    {
      id: 's5',
      name: 'Ham & Cheese Croissant',
      description: 'Buttery croissant with premium ham and Swiss cheese.',
      price: 6.50,
      image: '/images/Savoury3.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Croissant', 'Ham', 'Swiss Cheese', 'Butter'],
      nutritionInfo: {
        calories: 420,
        protein: 18.5,
        carbs: 28.0,
        fat: 25.2
      }
    },
    {
      id: 's6',
      name: 'Chicken & Pesto Sandwich',
      description: 'Grilled chicken with fresh pesto and vegetables on artisan bread.',
      price: 7.50,
      image: '/images/Savoury2.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Artisan Bread', 'Grilled Chicken', 'Pesto', 'Lettuce', 'Tomato'],
      nutritionInfo: {
        calories: 480,
        protein: 22.5,
        carbs: 35.0,
        fat: 28.8
      }
    },
    {
      id: 's7',
      name: 'Mediterranean Wrap',
      description: 'Fresh vegetables, hummus, and feta in a soft tortilla wrap.',
      price: 6.75,
      image: '/images/Savoury3.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Tortilla', 'Hummus', 'Feta Cheese', 'Cucumber', 'Tomato', 'Olives'],
      nutritionInfo: {
        calories: 380,
        protein: 15.2,
        carbs: 42.0,
        fat: 18.5
      }
    },
    {
      id: 's8',
      name: 'Caprese Panini',
      description: 'Fresh mozzarella, tomatoes, and basil on grilled ciabatta.',
      price: 7.25,
      image: '/images/Savoury2.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Ciabatta', 'Fresh Mozzarella', 'Tomatoes', 'Basil', 'Olive Oil'],
      nutritionInfo: {
        calories: 420,
        protein: 16.8,
        carbs: 38.0,
        fat: 22.5
      }
    },
    {
      id: 's9',
      name: 'Vegetarian Focaccia',
      description: 'Herb focaccia with roasted vegetables and goat cheese.',
      price: 6.00,
      image: '/images/Savoury3.jpg',
      category: 'Savoury',
      available: true,
      ingredients: ['Focaccia', 'Roasted Vegetables', 'Goat Cheese', 'Herbs', 'Olive Oil'],
      nutritionInfo: {
        calories: 350,
        protein: 12.5,
        carbs: 45.0,
        fat: 15.8
      }
    },
    // Platters
    {
      id: 'pl1',
      name: 'Cheese & Charcuterie Platter',
      description: 'Selection of French cheeses and cured meats, perfect for sharing.',
      price: 45.00,
      image: '/images/Macarons3.png',
      category: 'Platters',
      available: true,
      ingredients: ['French Cheeses', 'Cured Meats', 'Crackers', 'Fruits', 'Nuts'],
      nutritionInfo: {
        calories: 280,
        protein: 18.5,
        carbs: 8.0,
        fat: 22.0
      }
    },
    {
      id: 'pl2',
      name: 'Mediterranean Platter',
      description: 'Olives, hummus, pita bread, and fresh vegetables.',
      price: 35.00,
      image: '/images/Macarons4.png',
      category: 'Platters',
      available: true,
      ingredients: ['Olives', 'Hummus', 'Pita Bread', 'Fresh Vegetables', 'Olive Oil'],
      nutritionInfo: {
        calories: 220,
        protein: 8.5,
        carbs: 25.0,
        fat: 12.5
      }
    },
    {
      id: 'pl3',
      name: 'French Breakfast Platter',
      description: 'Croissants, pastries, jams, and coffee for a perfect morning.',
      price: 25.00,
      image: '/images/Platters3.png',
      category: 'Platters',
      available: true,
      ingredients: ['Croissants', 'Pastries', 'Jams', 'Butter', 'Coffee'],
      nutritionInfo: {
        calories: 350,
        protein: 8.0,
        carbs: 45.0,
        fat: 16.5
      }
    },
    {
      id: 'pl4',
      name: 'Seafood Platter',
      description: 'Fresh seafood selection with dipping sauces.',
      price: 55.00,
      image: '/images/Macarons2.png',
      category: 'Platters',
      available: true,
      ingredients: ['Fresh Seafood', 'Lemon', 'Dipping Sauces', 'Herbs'],
      nutritionInfo: {
        calories: 180,
        protein: 25.0,
        carbs: 5.0,
        fat: 8.5
      }
    },
    {
      id: 'pl5',
      name: 'Vegetarian Delight',
      description: 'Fresh vegetables, dips, and artisanal breads.',
      price: 30.00,
      image: '/images/Macarons1.png',
      category: 'Platters',
      available: true,
      ingredients: ['Fresh Vegetables', 'Dips', 'Artisanal Breads', 'Herbs'],
      nutritionInfo: {
        calories: 200,
        protein: 6.5,
        carbs: 35.0,
        fat: 8.0
      }
    },
    {
      id: 'pl6',
      name: 'Dessert Platter',
      description: 'Selection of French pastries and desserts.',
      price: 40.00,
      image: '/images/Macarons4.png',
      category: 'Platters',
      available: true,
      ingredients: ['French Pastries', 'Desserts', 'Fruits', 'Sauces'],
      nutritionInfo: {
        calories: 320,
        protein: 5.5,
        carbs: 48.0,
        fat: 12.5
      }
    },
    {
      id: 'pl7',
      name: 'Wine & Cheese Pairing',
      description: 'Curated cheese selection with wine recommendations.',
      price: 65.00,
      image: '/images/Macarons4.png',
      category: 'Platters',
      available: true,
      ingredients: ['Curated Cheeses', 'Wine', 'Crackers', 'Fruits', 'Nuts'],
      nutritionInfo: {
        calories: 250,
        protein: 12.0,
        carbs: 8.0,
        fat: 18.5
      }
    },
    {
      id: 'pl8',
      name: 'Kids Platter',
      description: 'Child-friendly selection of snacks and treats.',
      price: 20.00,
      image: '/images/Platters4.png',
      category: 'Platters',
      available: true,
      ingredients: ['Child-friendly Snacks', 'Fruits', 'Cheese', 'Crackers'],
      nutritionInfo: {
        calories: 180,
        protein: 6.0,
        carbs: 25.0,
        fat: 8.5
      }
    },
    {
      id: 'pl9',
      name: 'Artisan Bread Platter',
      description: 'Selection of fresh-baked breads with spreads.',
      price: 28.00,
      image: '/images/Savoury.jpg',
      category: 'Platters',
      available: true,
      ingredients: ['Fresh-baked Breads', 'Butter', 'Jams', 'Olive Oil', 'Herbs'],
      nutritionInfo: {
        calories: 280,
        protein: 8.5,
        carbs: 45.0,
        fat: 8.0
      }
    },
    {
      id: 'pl10',
      name: 'Holiday Special Platter',
      description: 'Seasonal selection for special occasions.',
      price: 50.00,
      image: '/images/Platters2.png',
      category: 'Platters',
      available: true,
      ingredients: ['Seasonal Items', 'Special Cheeses', 'Holiday Treats', 'Fruits'],
      nutritionInfo: {
        calories: 300,
        protein: 10.0,
        carbs: 35.0,
        fat: 15.5
      }
    },
    {
      id: 'pl11',
      name: 'Light Bites Platter',
      description: 'Small portions perfect for sharing.',
      price: 22.00,
      image: '/images/Savoury (3).jpg',
      category: 'Platters',
      available: true,
      ingredients: ['Small Portions', 'Light Snacks', 'Fruits', 'Vegetables'],
      nutritionInfo: {
        calories: 150,
        protein: 5.5,
        carbs: 20.0,
        fat: 6.5
      }
    },
    {
      id: 'pl12',
      name: 'Premium Selection',
      description: 'Our finest ingredients in one platter.',
      price: 75.00,
      image: '/images/Platters4.png',
      category: 'Platters',
      available: true,
      ingredients: ['Premium Ingredients', 'Fine Cheeses', 'Artisanal Items', 'Luxury Treats'],
      nutritionInfo: {
        calories: 350,
        protein: 15.0,
        carbs: 20.0,
        fat: 25.0
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

            {/* Quantity Selector and Add to Cart */}
            <div className={styles.quantitySection}>
              <label className={styles.quantityLabel}>Quantity:</label>
              <div className={styles.quantityRow}>
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

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={styles.addToCartButton}
              disabled={!product.available}
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>
              </div>
            </div>

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

      {/* Related Products */}
      {product && (
        <div className={styles.relatedProductsSection}>
          <div className={styles.relatedProductsContainer}>
            <h2 className={styles.relatedProductsTitle}>Related Products</h2>
            <div className={styles.relatedProductsGrid}>
              {products
                .filter(p => p.category === product.category && p.id !== product.id)
                .slice(0, 4)
                .map(relatedProduct => (
                  <div
                    key={relatedProduct.id}
                    className={styles.relatedProductCard}
                    onClick={() => router.push(`/product/${relatedProduct.id}`)}
                  >
                    <div className={styles.relatedProductImage}>
                      <Image
                        src={relatedProduct.image || '/images/placeholder-food.svg'}
                        alt={relatedProduct.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className={styles.relatedProductInfo}>
                      <h3 className={styles.relatedProductName}>{relatedProduct.name}</h3>
                      <div className={styles.relatedProductPrice}>₼{relatedProduct.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <FeaturesSection />
      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}