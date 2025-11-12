import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, MenuCategory } from '@/types/common';
import { fetchMenuCategories, handleApiError } from '@/utils/apiHelpers';
import { XIcon } from '@/components/Icons';

interface MenuItemFormProps {
  initialData?: MenuItem; // Для редактирования
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  error: string | null;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ initialData, onSubmit, loading, error }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'AZN');
  const [menuCategory, setMenuCategory] = useState<number | string>(initialData?.menu_category_id || '');
  const [isAvailable, setIsAvailable] = useState(initialData?.is_available || true);
  const [isActive, setIsActive] = useState(initialData?.is_active || true);
  const [currentImages, setCurrentImages] = useState<string[]>(initialData?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchMenuCategories();
        if (result.success && result.data && Array.isArray(result.data)) {
          setCategories(result.data);
        } else {
          console.error("Failed to load categories:", handleApiError(result as any));
          setCategories([]); // Устанавливаем пустой массив в случае ошибки
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]); // Устанавливаем пустой массив в случае исключения
      }
    };
    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleRemoveCurrentImage = (imageToRemove: string) => {
    setCurrentImages(prev => prev.filter(img => img !== imageToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Сброс предыдущих ошибок

    const errors: Record<string, string[]> = {};
    if (!name.trim()) errors.name = ['Название обязательно.'];
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) < 0) errors.price = ['Цена должна быть положительным числом.'];
    if (!currency.trim()) errors.currency = ['Валюта обязательна.'];
    if (!menuCategory) errors.menu_category_id = ['Категория обязательна.'];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('currency', currency);
    formData.append('menu_category_id', String(menuCategory));
    formData.append('is_available', String(isAvailable ? 1 : 0));
    formData.append('is_active', String(isActive ? 1 : 0));

    currentImages.forEach(image => formData.append('images[]', image)); // Отправляем существующие изображения
    newImages.forEach(file => formData.append('images[]', file)); // Добавляем новые файлы

    // Если редактируем и удаляем изображения
    if (initialData && initialData.images) {
      const removedImages = initialData.images.filter(img => !currentImages.includes(img));
      removedImages.forEach(img => formData.append('removed_images[]', img));
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="dashboard-form">
      {error && <div className="dashboard-error-message">{error}</div>}
      
      <div className="dashboard-form-group">
        <label htmlFor="name" className="dashboard-form-label">Название:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`dashboard-form-input ${formErrors.name ? 'is-invalid' : ''}`}
        />
        {formErrors.name && <div className="dashboard-invalid-feedback">{formErrors.name[0]}</div>}
      </div>

      <div className="dashboard-form-group">
        <label htmlFor="description" className="dashboard-form-label">Описание:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="dashboard-form-textarea"
          rows={4}
        ></textarea>
      </div>

      <div className="dashboard-form-group">
        <label htmlFor="price" className="dashboard-form-label">Цена:</label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`dashboard-form-input ${formErrors.price ? 'is-invalid' : ''}`}
          step="0.01"
          min="0"
        />
        {formErrors.price && <div className="dashboard-invalid-feedback">{formErrors.price[0]}</div>}
      </div>

      <div className="dashboard-form-group">
        <label htmlFor="currency" className="dashboard-form-label">Валюта:</label>
        <input
          type="text"
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className={`dashboard-form-input ${formErrors.currency ? 'is-invalid' : ''}`}
        />
        {formErrors.currency && <div className="dashboard-invalid-feedback">{formErrors.currency[0]}</div>}
      </div>

      <div className="dashboard-form-group">
        <label htmlFor="menuCategory" className="dashboard-form-label">Категория:</label>
        <select
          id="menuCategory"
          value={menuCategory}
          onChange={(e) => setMenuCategory(parseInt(e.target.value))}
          className={`dashboard-form-select ${formErrors.menu_category_id ? 'is-invalid' : ''}`}
        >
          <option value="">Выберите категорию</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {formErrors.menu_category_id && <div className="dashboard-invalid-feedback">{formErrors.menu_category_id[0]}</div>}
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-form-label">Изображения:</label>
        <div className="dashboard-image-upload-preview">
          {currentImages.map((image, index) => (
            <div key={index} className="dashboard-image-preview-item">
              <Image src={image} alt="Превью" width={100} height={100} style={{ objectFit: "cover" }} />
              <button type="button" onClick={() => handleRemoveCurrentImage(image)} className="dashboard-remove-image-btn">
                <XIcon size={16} />
              </button>
            </div>
          ))}
          {newImages.map((file, index) => (
            <div key={`new-${index}`} className="dashboard-image-preview-item">
              <Image src={URL.createObjectURL(file)} alt="Превью" width={100} height={100} style={{ objectFit: "cover" }} />
              <button type="button" onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))} className="dashboard-remove-image-btn">
                <XIcon size={16} />
              </button>
            </div>
          ))}
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="dashboard-form-input-file"
          />
        </div>
      </div>

      <div className="dashboard-form-group dashboard-checkbox-group">
        <input
          type="checkbox"
          id="isAvailable"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="dashboard-form-checkbox"
        />
        <label htmlFor="isAvailable" className="dashboard-form-label">Доступно для заказа</label>
      </div>

      <div className="dashboard-form-group dashboard-checkbox-group">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="dashboard-form-checkbox"
        />
        <label htmlFor="isActive" className="dashboard-form-label">Активно (отображается в меню)</label>
      </div>

      <div className="dashboard-form-actions">
        <button type="submit" disabled={loading} className="dashboard-primary-btn">
          {loading ? 'Сохранение...' : (initialData ? 'Обновить позицию' : 'Создать позицию')}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;
