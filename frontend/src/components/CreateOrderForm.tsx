"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { CartItem } from "../types/unified";
import { useAuthGuard, canCreateOrders } from "../utils/authConstants";
import { Plus, Search, X, ShoppingCart } from 'lucide-react';
import { useOrderForm } from "../hooks/useOrderForm";
import styles from './CreateOrderForm.module.css';


export default function CreateOrderForm() {
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const router = useRouter();
    const {
        loading,
        clients,
        application,
        formData,
        menuItems,
        fromApplicationId,
        setFormData,
        addMenuItem,
        updateMenuItemQuantity,
        removeMenuItem,
        handleInputChange,
        handleRecurringChange,
        handleSubmit,
    } = useOrderForm();
    const [showPreview, setShowPreview] = useState(false);
    const [menuSearch, setMenuSearch] = useState('');
    const [showMenuModal, setShowMenuModal] = useState(false);

    const hasAccess = useAuthGuard(isAuthenticated, authLoading, user || { user_type: '', staff_role: '' }, canCreateOrders, router);

    const filteredMenuItems = useMemo(() => {
        if (!menuSearch) return menuItems;
        return menuItems.filter(item =>
            item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase())) ||
            (item.category && item.category.toLowerCase().includes(menuSearch.toLowerCase()))
        );
    }, [menuItems, menuSearch]);

    useEffect(() => {
        if (hasAccess) {
            // loadClients(); // Removed as per new_code
            // loadMenuItems(); // Removed as per new_code
        }
    }, [hasAccess]); // Removed loadClients, loadMenuItems as they are now in useOrderForm

    useEffect(() => {
        if (fromApplicationId && hasAccess && clients.length > 0) {
            // loadApplication(fromApplicationId); // Removed as per new_code
        }
    }, [fromApplicationId, hasAccess, clients.length]); // Removed loadApplication as it's now in useOrderForm

    if (authLoading || !hasAccess) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-10 bg-white rounded-lg">
                    <div className="text-lg text-gray-600">Loading Access...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingContent}>
                        <div className={styles.loadingSpinner}></div>
                        <p className={styles.loadingText}>Загрузка...</p>
                    </div>
                </div>
            )}

            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerInner}>
                            <div className={styles.headerLeft}>
                                <button
                                    onClick={() => router.back()}
                                    className={styles.backButton}
                                >
                                    ←
                                </button>
                                <h1 className={styles.title}>Создание заказа</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Application Info */}
                        {application && (
                            <div className={styles.applicationInfo}>
                                <h3 className={styles.applicationTitle}>Информация о заявке</h3>
                                <div className={styles.applicationContent}>
                                    <p><strong>Статус:</strong> {application?.status}</p>
                                    <p><strong>Клиент:</strong> {application?.first_name} {application?.last_name}</p>
                                    <p><strong>Email:</strong> {application?.email}</p>
                                    <p><strong>Телефон:</strong> {application?.phone}</p>
                                    {application?.event_address && <p><strong>Адрес:</strong> {application?.event_address}</p>}
                                    {application?.event_date && <p><strong>Дата:</strong> {new Date(application?.event_date || '').toLocaleDateString()}</p>}
                                    {application?.event_time && <p><strong>Время:</strong> {new Date(application?.event_time || '').toLocaleTimeString()}</p>}
                                    {application?.message && <p><strong>Сообщение:</strong> {application?.message}</p>}
                                    {application?.cart_items && application?.cart_items?.length && (application?.cart_items?.length ?? 0) > 0 && (
                                    <div>
                                            <p><strong>Запрошенные товары:</strong></p>
                                            <ul className="list-disc list-inside ml-4">
                                                {application?.cart_items?.map((item, index) => (
                                                    <li key={index}>{item.name} (x{item.quantity}) - {item.price} ₼</li>
                                                ))}
                                            </ul>
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Client Selection */}
                        <div className={styles.formSection}>
                            <label htmlFor="client" className={styles.label}>Клиент</label>
                            <select
                                id="client"
                                value={formData.selected_client_id || ''}
                                onChange={(e) => {
                                    const clientId = parseInt(e.target.value);
                                    const selectedClient = clients.find(c => c.id === clientId);
                                    setFormData(prev => ({
                                        ...prev,
                                        selected_client_id: clientId,
                                        client_type: selectedClient?.client_category || 'one_time'
                                    }));
                                }}
                                className={styles.select}
                                required
                            >
                                <option value="">Выберите клиента</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} ({client.client_category === 'corporate' ? 'Корпоративный' : 'Разовый'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Client Type Display */}
                        {formData.selected_client_id && (
                            <div className={styles.clientTypeDisplay}>
                                <div className="flex items-center">
                                    <div className={`${styles.clientTypeIndicator} ${formData.client_type === 'corporate' ? styles.corporate : styles.individual}`}></div>
                                    <span className={styles.clientTypeText}>
                                        {formData.client_type === 'corporate' ? 'Корпоративный клиент' : 'Разовый клиент'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Delivery Type */}
                        <div className={styles.formSection}>
                            <label className={styles.label}>Тип доставки</label>
                            <div className={styles.radioGroup}>
                                {[
                                    { value: 'delivery', label: 'Доставка' },
                                    { value: 'pickup', label: 'Самовывоз' },
                                    { value: 'buffet', label: 'Кейтеринг' }
                                ].map((type) => (
                                    <label key={type.value} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                            value={type.value}
                                            checked={formData.delivery_type === type.value}
                                            onChange={(e) => handleInputChange('delivery_type', e.target.value as 'delivery' | 'pickup' | 'buffet')}
                                            className={styles.radioInput}
                                        />
                                        <span className={styles.radioText}>{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Date and Time */}
                        {formData.delivery_type !== 'pickup' && (
                            <div className={styles.grid2}>
                                <div className={styles.formSection}>
                                    <label htmlFor="delivery_date" className={styles.label}>Дата</label>
                                    <input
                                        type="date"
                                        id="delivery_date"
                                        value={formData.delivery_date}
                                        onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formSection}>
                                    <label htmlFor="delivery_time" className={styles.label}>Время</label>
                                    <input
                                        type="time"
                                        id="delivery_time"
                                        value={formData.delivery_time}
                                        onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Delivery Address */}
                        {formData.delivery_type !== 'pickup' && (
                            <div className={styles.formSection}>
                                <label htmlFor="delivery_address" className={styles.label}>Адрес доставки</label>
                                <input
                                    type="text"
                                    id="delivery_address"
                                    value={formData.delivery_address}
                                    onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                                    className={styles.input}
                                    placeholder="Введите адрес доставки"
                                    required
                                />
                            </div>
                        )}

                        {/* Comment */}
                        <div className={styles.formSection}>
                            <label htmlFor="comment" className={styles.label}>Комментарий</label>
                            <textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                className={styles.textarea}
                                placeholder="Дополнительные заметки или инструкции"
                                rows={3}
                            />
                        </div>

                        {/* Скидки и стоимость доставки */}
                        <div className={styles.pricingSection}>
                            <h3 className={styles.pricingTitle}>Цены и скидки</h3>
                            
                            <div className={styles.grid3}>
                                {/* Стоимость доставки */}
                                <div className={styles.formSection}>
                                    <label htmlFor="delivery_cost" className={styles.label}>Стоимость доставки (₼)</label>
                                    <input
                                        type="number"
                                        id="delivery_cost"
                                        value={formData.delivery_cost}
                                        onChange={(e) => handleInputChange('delivery_cost', parseFloat(e.target.value) || 0)}
                                        className={styles.input}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Фиксированная скидка */}
                                <div className={styles.formSection}>
                                    <label htmlFor="discount_fixed" className={styles.label}>Скидка фиксир. (₼)</label>
                                    <input
                                        type="number"
                                        id="discount_fixed"
                                        value={formData.discount_fixed}
                                        onChange={(e) => handleInputChange('discount_fixed', parseFloat(e.target.value) || 0)}
                                        className={styles.input}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Процентная скидка */}
                                <div className={styles.formSection}>
                                    <label htmlFor="discount_percent" className={styles.label}>Скидка процент. (%)</label>
                                    <input
                                        type="number"
                                        id="discount_percent"
                                        value={formData.discount_percent}
                                        onChange={(e) => handleInputChange('discount_percent', parseFloat(e.target.value) || 0)}
                                        className={styles.input}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            {/* Товары заказа */}
                            <div className={styles.menuItemsSection}>
                                <div className={styles.menuItemsHeader}>
                                    <h3 className={styles.menuItemsTitle}>Товары заказа</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowMenuModal(true)}
                                        className={styles.addMenuButton}
                                    >
                                        <Plus className={styles.addMenuIcon} />
                                        Добавить из меню
                                    </button>
                                </div>

                                {formData.menu_items.length > 0 ? (
                                    <div className="space-y-2">
                                        {formData.menu_items.map((item) => (
                                            <div key={item.id} className={styles.menuItemCard}>
                                                <div className={styles.menuItemInfo}>
                                                    <h4 className={styles.menuItemName}>{item.name}</h4>
                                                    <p className={styles.menuItemDescription}>{item.description}</p>
                                                    <p className={styles.menuItemPrice}>{item.price} ₼</p>
                                                </div>
                                                <div className={styles.menuItemControls}>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateMenuItemQuantity(item.id, item.quantity - 1)}
                                                        className={styles.quantityButton}
                                                    >
                                                        −
                                                    </button>
                                                    <span className={styles.quantityInput}>{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateMenuItemQuantity(item.id, item.quantity + 1)}
                                                        className={styles.quantityButton}
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMenuItem(item.id)}
                                                        className={styles.removeButton}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <ShoppingCart className={styles.emptyIcon} />
                                        <p className={styles.emptyText}>Нет товаров в заказе</p>
                                        <p className={styles.emptySubtext}>Нажмите &quot;Добавить из меню&quot; для выбора товаров</p>
                                    </div>
                                )}
                            </div>

                            {/* Калькулятор итоговой стоимости */}
                            {formData.menu_items.length > 0 && (
                                <div className={styles.priceCalculator}>
                                    <div className={styles.priceRow}>
                                        <span>Сумма товаров:</span>
                                        <span>{formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} ₼</span>
                                    </div>
                                    {(formData.discount_fixed > 0 || formData.discount_percent > 0) && (
                                        <div className={`${styles.priceRow} ${styles.discount}`}>
                                            <span>Скидка:</span>
                                            <span>-{(formData.discount_fixed + (formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * formData.discount_percent / 100)).toFixed(2)} ₼</span>
                                        </div>
                                    )}
                                    {formData.delivery_cost > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>Доставка:</span>
                                            <span>{formData.delivery_cost.toFixed(2)} ₼</span>
                                        </div>
                                    )}
                                    <div className={`${styles.priceRow} ${styles.total}`}>
                                        <span>Итого:</span>
                                        <span className={styles.totalAmount}>
                                            {(() => {
                                                const subtotal = formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                                                const discount = formData.discount_fixed + (subtotal * formData.discount_percent / 100);
                                                return (Math.max(0, subtotal - discount) + formData.delivery_cost).toFixed(2);
                                            })()} ₼
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recurring Schedule */}
                        <div className={styles.recurringSection}>
                            <label className={styles.recurringCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={formData.recurring_schedule.enabled}
                                    onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                                    className={styles.recurringCheckboxInput}
                                />
                                <span className={styles.recurringCheckboxText}>
                                    Включить регулярные заказы
                                </span>
                            </label>

                            {formData.recurring_schedule.enabled && (
                                <div className={styles.recurringForm}>
                                    <div className={styles.recurringGrid}>
                                        <div>
                                            <label htmlFor="frequency" className={styles.recurringLabel}>Частота</label>
                                            <select
                                                id="frequency"
                                                value={formData.recurring_schedule.frequency}
                                                onChange={(e) => handleRecurringChange('frequency', e.target.value as 'weekly' | 'monthly')}
                                                className={styles.recurringSelect}
                                            >
                                                <option value="weekly">Еженедельно</option>
                                                <option value="monthly">Ежемесячно</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="recurring_time" className={styles.recurringLabel}>Время регулярной доставки</label>
                                            <input
                                                id="recurring_time"
                                                type="time"
                                                value={formData.recurring_schedule.delivery_time}
                                                onChange={(e) => handleRecurringChange('delivery_time', e.target.value)}
                                                className={styles.recurringInput}
                                            />
                                        </div>
                                    </div>

                                    {/* Выбор дней недели */}
                                    <div>
                                        <label className={styles.recurringLabel}>Дни недели</label>
                                        <div className={styles.daysGrid}>
                                            {[
                                                { value: 'monday', label: 'Пн' },
                                                { value: 'tuesday', label: 'Вт' },
                                                { value: 'wednesday', label: 'Ср' },
                                                { value: 'thursday', label: 'Чт' },
                                                { value: 'friday', label: 'Пт' },
                                                { value: 'saturday', label: 'Сб' },
                                                { value: 'sunday', label: 'Вс' }
                                            ].map((day) => (
                                                <label key={day.value} className={styles.dayLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.recurring_schedule.days.includes(day.value)}
                                                        onChange={(e) => {
                                                            const newDays = e.target.checked
                                                                ? [...formData.recurring_schedule.days, day.value]
                                                                : formData.recurring_schedule.days.filter(d => d !== day.value);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                recurring_schedule: {
                                                                    ...prev.recurring_schedule,
                                                                    days: newDays
                                                                }
                                                            }));
                                                        }}
                                                        className={styles.dayCheckbox}
                                                    />
                                                    <span className={styles.dayText}>{day.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="recurring_notes" className={styles.recurringLabel}>Заметки для регулярных заказов</label>
                                        <textarea
                                            id="recurring_notes"
                                            value={formData.recurring_schedule.notes}
                                            onChange={(e) => handleRecurringChange('notes', e.target.value)}
                                            className={styles.recurringTextarea}
                                            placeholder="Заметки для регулярных заказов"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Дополнительные поля */}
                        <div className={styles.additionalSection}>
                            <h3 className={styles.additionalTitle}>Дополнительные детали</h3>
                            
                            {/* Особые инструкции */}
                            <div className={styles.formSection}>
                                <label htmlFor="special_instructions" className={styles.label}>
                                    Особые инструкции
                                </label>
                                <textarea
                                    id="special_instructions"
                                    value={formData.special_instructions}
                                    onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                                    className={styles.textarea}
                                    placeholder="Любые особые инструкции для этого заказа..."
                                    rows={3}
                                />
                            </div>

                            {/* Ресурсы */}
                            <div className={styles.resourceGrid}>
                                {/* Необходимое оборудование */}
                                <div className={styles.resourceSection}>
                                    <label className={styles.resourceLabel}>
                                        Оборудование (кол-во)
                                    </label>
                                    <div className={styles.resourceControls}>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('equipment_required', Math.max(0, formData.equipment_required - 1))}
                                            className={styles.resourceButton}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={formData.equipment_required}
                                            onChange={(e) => handleInputChange('equipment_required', Math.max(0, parseInt(e.target.value) || 0))}
                                            className={styles.resourceInput}
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('equipment_required', formData.equipment_required + 1)}
                                            className={styles.resourceButton}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Назначенный персонал */}
                                <div className={styles.resourceSection}>
                                    <label className={styles.resourceLabel}>
                                        Персонал (кол-во)
                                    </label>
                                    <div className={styles.resourceControls}>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('staff_assigned', Math.max(0, formData.staff_assigned - 1))}
                                            className={styles.resourceButton}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={formData.staff_assigned}
                                            onChange={(e) => handleInputChange('staff_assigned', Math.max(0, parseInt(e.target.value) || 0))}
                                            className={styles.resourceInput}
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('staff_assigned', formData.staff_assigned + 1)}
                                            className={styles.resourceButton}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className={styles.backButton}
                            >
                                Назад
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? 'Создание...' : 'Создать заказ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Menu Modal */}
            {showMenuModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Выбор товаров из меню</h2>
                            <button
                                onClick={() => setShowMenuModal(false)}
                                className={styles.modalCloseButton}
                            >
                                <X className={styles.modalCloseIcon} />
                            </button>
                        </div>

                        {/* Поиск */}
                        <div className={styles.searchContainer}>
                            <div className="relative">
                                <Search className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Поиск по названию, описанию или категории..."
                                    value={menuSearch}
                                    onChange={(e) => setMenuSearch(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                        </div>

                        {/* Список товаров */}
                        <div className={styles.menuItemsGrid}>
                            <div className={styles.menuItemsGridInner}>
                                {filteredMenuItems.map((item) => (
                                    <div key={item.id} className={styles.menuItemCard}>
                                        <div className={styles.menuItemHeader}>
                                            <h3 className={styles.menuItemName}>{item.name}</h3>
                                            <span className={styles.menuItemPrice}>{item.price} ₼</span>
                                        </div>
                                        <p className={styles.menuItemDescription}>{item.description}</p>
                                        <div className={styles.menuItemFooter}>
                                            <span className={styles.menuItemCategory}>
                                                {item.category}
                                            </span>
                                            <button
                                                onClick={() => addMenuItem(item)}
                                                className={styles.menuItemAddButton}
                                            >
                                                <Plus className={styles.menuItemAddIcon} />
                                                Добавить
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filteredMenuItems.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p>Товары не найдены</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowMenuModal(false)}
                                className={styles.previewCancelButton}
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className={styles.previewModal}>
                    <div className={styles.previewModalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Предварительный просмотр заказа</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className={styles.modalCloseButton}
                            >
                                <X className={styles.modalCloseIcon} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Информация о клиенте */}
                            <div className={styles.previewSection}>
                                <h3 className={styles.previewSectionTitle}>Клиент</h3>
                                <div className={styles.previewSectionContent}>
                                    <p><strong>{clients.find(c => c.id === formData.selected_client_id)?.name || 'Не выбран'}</strong></p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.email || 'Не указан'}</p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.client_category === 'corporate' ? 'Корпоративный' : 'Разовый'}</p>
                                </div>
                            </div>

                            {/* Информация о доставке */}
                            <div className={styles.previewSection}>
                                <h3 className={styles.previewSectionTitle}>Доставка</h3>
                                <div className={styles.previewSectionContent}>
                                    <p>Тип: {formData.delivery_type}</p>
                                    {formData.delivery_date && <p>Дата: {formData.delivery_date}</p>}
                                    {formData.delivery_time && <p>Время: {formData.delivery_time}</p>}
                                    {formData.delivery_address && <p>Адрес: {formData.delivery_address}</p>}
                                </div>
                            </div>

                            {/* Товары */}
                            {formData.menu_items.length > 0 && (
                                <div className={styles.previewSection}>
                                    <h3 className={styles.previewSectionTitle}>Товары</h3>
                                    <div className="space-y-2">
                                        {formData.menu_items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>{(item.price * item.quantity).toFixed(2)} ₼</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Итоговая сумма */}
                            <div className={styles.previewTotalSection}>
                                <h3 className={styles.previewTotalTitle}>Итоговая сумма</h3>
                                <div className={styles.previewTotalContent}>
                                    <div className={styles.previewTotalRow}>
                                        <span>Товары:</span>
                                        <span>{formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} ₼</span>
                                    </div>
                                    {formData.delivery_cost > 0 && (
                                        <div className={styles.previewTotalRow}>
                                            <span>Доставка:</span>
                                            <span>{formData.delivery_cost.toFixed(2)} ₼</span>
                                        </div>
                                    )}
                                    <div className={`${styles.previewTotalRow} ${styles.total}`}>
                                        <span>Итого:</span>
                                        <span>
                                            {(() => {
                                                const subtotal = formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                                                const discount = formData.discount_fixed + (subtotal * formData.discount_percent / 100);
                                                return (Math.max(0, subtotal - discount) + formData.delivery_cost).toFixed(2);
                                            })()} ₼
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.previewButtons}>
                            <button
                                onClick={() => setShowPreview(false)}
                                className={styles.previewCancelButton}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={styles.previewConfirmButton}
                            >
                                Подтвердить заказ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}





