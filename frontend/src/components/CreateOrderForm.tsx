"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { CartItem } from "../types/unified";
import { useAuthGuard, canCreateOrders } from "../utils/authConstants";
import { Plus, Search, X, ShoppingCart } from 'lucide-react';
import { useOrderForm } from "../hooks/useOrderForm";
import MenuSlidePanel from "./MenuSlidePanel";
import styles from './CreateOrderForm.module.css';
import { useTranslations } from 'next-intl';


export default function CreateOrderForm() {
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const router = useRouter();
    const t = useTranslations();
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
    const [showMenuModal, setShowMenuModal] = useState(false);

    const hasAccess = useAuthGuard(isAuthenticated, authLoading, user || { user_type: '', staff_role: '' }, canCreateOrders, router);

    // Отладочное логирование
    useEffect(() => {
        console.log('🔍 CreateOrderForm - menuItems:', menuItems.length);
        console.log('🔍 CreateOrderForm - loading:', loading);
        console.log('🔍 CreateOrderForm - user:', user);
    }, [menuItems, loading, user]);

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
                        <p className={styles.loadingText}>{t('common.loading')}</p>
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
                                <h1 className={styles.title}>{t('orders.createTitle')}</h1>
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
                                <h3 className={styles.applicationTitle}>{t('form.applicationInformation')}</h3>
                                <div className={styles.applicationContent}>
                                    <p><strong>{t('common.status')}:</strong> {application?.status}</p>
                                    <p><strong>{t('form.client')}:</strong> {application?.first_name} {application?.last_name}</p>
                                    <p><strong>{t('checkout.email')}:</strong> {application?.email}</p>
                                    <p><strong>{t('checkout.phone')}:</strong> {application?.phone}</p>
                                    {application?.event_address && <p><strong>{t('checkout.eventAddress')}:</strong> {application?.event_address}</p>}
                                    {application?.event_date && <p><strong>{t('common.date')}:</strong> {new Date(application?.event_date || '').toLocaleDateString()}</p>}
                                    {application?.event_time && <p><strong>{t('common.time')}:</strong> {new Date(application?.event_time || '').toLocaleTimeString()}</p>}
                                    {application?.message && <p><strong>{t('checkout.message')}:</strong> {application?.message}</p>}
                                    {application?.cart_items && application?.cart_items?.length && (application?.cart_items?.length ?? 0) > 0 && (
                                    <div>
                                            <p><strong>{t('form.requestedItems')}:</strong></p>
                                            <ul className="list-disc list-inside ml-4">
                                                {application?.cart_items?.map((item, index) => (
                                                    <li key={index}>{item.name} (x{item.quantity ?? 0}) - {item.price} ₼</li>
                                                ))}
                                            </ul>
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Client Selection */}
                        <div className={styles.formSection}>
                            <label htmlFor="client" className={styles.label}>{t('form.client')}</label>
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
                                <option value="">{t('form.selectClient')}</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} ({client.client_category === 'corporate' ? t('form.corporate') : t('form.onetime')})
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
                                        {formData.client_type === 'corporate' ? t('form.corporateClient') : t('form.onetimeClient')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Delivery Type */}
                        <div className={styles.formSection}>
                            <label className={styles.label}>{t('form.deliveryType')}</label>
                            <div className={styles.radioGroup}>
                                {[
                                    { value: 'delivery', label: t('checkout.delivery') },
                                    { value: 'pickup', label: t('checkout.pickup') },
                                    { value: 'buffet', label: t('checkout.buffet') }
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
                                    <label htmlFor="delivery_date" className={styles.label}>{t('form.deliveryDate')}</label>
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
                                    <label htmlFor="delivery_time" className={styles.label}>{t('form.deliveryTime')}</label>
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
                                <label htmlFor="delivery_address" className={styles.label}>{t('form.deliveryAddress')}</label>
                                <input
                                    type="text"
                                    id="delivery_address"
                                    value={formData.delivery_address}
                                    onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                                    className={styles.input}
                                    placeholder={t('form.deliveryAddressPlaceholder')}
                                    required
                                />
                            </div>
                        )}

                        {/* Comment */}
                        <div className={styles.formSection}>
                            <label htmlFor="comment" className={styles.label}>{t('form.comment')}</label>
                            <textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                className={styles.textarea}
                                placeholder={t('form.commentPlaceholder')}
                                rows={3}
                            />
                        </div>

                        {/* Скидки и стоимость доставки */}
                        <div className={styles.pricingSection}>
                            <h3 className={styles.pricingTitle}>{t('form.pricesAndDiscounts')}</h3>
                            
                            <div className={styles.grid3}>
                                {/* Стоимость доставки */}
                                <div className={styles.formSection}>
                                    <label htmlFor="delivery_cost" className={styles.label}>{t('form.deliveryCost')}</label>
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
                                    <label htmlFor="discount_fixed" className={styles.label}>{t('form.fixedDiscount')}</label>
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
                                    <label htmlFor="discount_percent" className={styles.label}>{t('form.percentDiscount')}</label>
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
                                    <div>
                                        <h3 className={styles.menuItemsTitle}>{t('form.orderItems')}</h3>
                                        {menuItems.length > 0 && (
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                {t('form.itemsAvailable', { count: menuItems.length })}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMenuModal(true)}
                                        className={styles.addMenuButton}
                                        disabled={loading || menuItems.length === 0}
                                    >
                                        <Plus className={styles.addMenuIcon} />
                                        {menuItems.length === 0 ? t('form.menuLoading') : t('form.addFromMenu')}
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
                                                        onClick={() => updateMenuItemQuantity(item.id, (item.quantity ?? 1) - 1)}
                                                        className={styles.quantityButton}
                                                    >
                                                        −
                                                    </button>
                                                    <span className={styles.quantityInput}>{item.quantity ?? 0}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateMenuItemQuantity(item.id, (item.quantity ?? 0) + 1)}
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
                                        <p className={styles.emptyText}>{t('form.noItems')}</p>
                                        <p className={styles.emptySubtext}>{t('form.addFromMenuHint')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Калькулятор итоговой стоимости */}
                            {formData.menu_items.length > 0 && (
                                <div className={styles.priceCalculator}>
                                    <div className={styles.priceRow}>
                                        <span>{t('form.itemsTotal')}</span>
                                        <span>{formData.menu_items.reduce((sum, item) => sum + ((item.quantity ?? 0) * item.price), 0).toFixed(2)} ₼</span>
                                    </div>
                                    {(formData.discount_fixed > 0 || formData.discount_percent > 0) && (
                                        <div className={`${styles.priceRow} ${styles.discount}`}>
                                            <span>{t('form.discount')}</span>
                                            <span>-{(formData.discount_fixed + (formData.menu_items.reduce((sum, item) => sum + ((item.quantity ?? 0) * item.price), 0) * formData.discount_percent / 100)).toFixed(2)} ₼</span>
                                        </div>
                                    )}
                                    {formData.delivery_cost > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>{t('form.deliveryCostLabel')}</span>
                                            <span>{formData.delivery_cost.toFixed(2)} ₼</span>
                                        </div>
                                    )}
                                    <div className={`${styles.priceRow} ${styles.total}`}>
                                        <span>{t('form.total')}</span>
                                        <span className={styles.totalAmount}>
                                            {(() => {
                                                const subtotal = formData.menu_items.reduce((sum, item) => sum + ((item.quantity ?? 0) * item.price), 0);
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
                                    {t('form.enableRecurring')}
                                </span>
                            </label>

                            {formData.recurring_schedule.enabled && (
                                <div className={styles.recurringForm}>
                                    <div className={styles.recurringGrid}>
                                        <div>
                                            <label htmlFor="frequency" className={styles.recurringLabel}>{t('form.recurringFrequency')}</label>
                                            <select
                                                id="frequency"
                                                value={formData.recurring_schedule.frequency}
                                                onChange={(e) => handleRecurringChange('frequency', e.target.value as 'weekly' | 'monthly')}
                                                className={styles.recurringSelect}
                                            >
                                                <option value="weekly">{t('form.weekly')}</option>
                                                <option value="monthly">{t('form.monthly')}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="recurring_time" className={styles.recurringLabel}>{t('form.recurringTime')}</label>
                                            <input
                                                id="recurring_time"
                                                type="time"
                                                value={formData.recurring_schedule.delivery_time}
                                                onChange={(e) => handleRecurringChange('delivery_time', e.target.value)}
                                                className={styles.recurringInput}
                                            />
                                        </div>
                                    </div>

                                    {/* Weekday Selection */}
                                    <div>
                                        <label className={styles.recurringLabel}>{t('form.weekdays')}</label>
                                        <div className={styles.daysGrid}>
                                            {[
                                                { value: 'monday', label: t('form.moShort') },
                                                { value: 'tuesday', label: t('form.tuShort') },
                                                { value: 'wednesday', label: t('form.weShort') },
                                                { value: 'thursday', label: t('form.thShort') },
                                                { value: 'friday', label: t('form.frShort') },
                                                { value: 'saturday', label: t('form.saShort') },
                                                { value: 'sunday', label: t('form.suShort') }
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
                                        <label htmlFor="recurring_notes" className={styles.recurringLabel}>{t('form.recurringNotes')}</label>
                                        <textarea
                                            id="recurring_notes"
                                            value={formData.recurring_schedule.notes}
                                            onChange={(e) => handleRecurringChange('notes', e.target.value)}
                                            className={styles.recurringTextarea}
                                            placeholder={t('form.recurringNotesPlaceholder')}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Fields */}
                        <div className={styles.additionalSection}>
                            <h3 className={styles.additionalTitle}>{t('form.additionalDetails')}</h3>
                            
                            {/* Special Instructions */}
                            <div className={styles.formSection}>
                                <label htmlFor="special_instructions" className={styles.label}>
                                    {t('form.specialInstructions')}
                                </label>
                                <textarea
                                    id="special_instructions"
                                    value={formData.special_instructions}
                                    onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                                    className={styles.textarea}
                                    placeholder={t('form.specialInstructionsPlaceholder')}
                                    rows={3}
                                />
                            </div>

                            {/* Resources */}
                            <div className={styles.resourceGrid}>
                                {/* Equipment */}
                                <div className={styles.resourceSection}>
                                    <label className={styles.resourceLabel}>
                                        {t('form.equipment')}
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

                                {/* Staff */}
                                <div className={styles.resourceSection}>
                                    <label className={styles.resourceLabel}>
                                        {t('form.staff')}
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
                                {t('common.back')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? t('form.creating') : t('form.createOrder')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Menu Slide Panel */}
            <MenuSlidePanel
                isOpen={showMenuModal}
                onClose={() => setShowMenuModal(false)}
                menuItems={menuItems}
                onAddItem={addMenuItem}
                loading={loading}
            />

            {/* Preview Modal */}
            {showPreview && (
                <div className={styles.previewModal}>
                    <div className={styles.previewModalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{t('form.previewOrder')}</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className={styles.modalCloseButton}
                            >
                                <X className={styles.modalCloseIcon} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Customer Information */}
                            <div className={styles.previewSection}>
                                <h3 className={styles.previewSectionTitle}>{t('form.client')}</h3>
                                <div className={styles.previewSectionContent}>
                                    <p><strong>{clients.find(c => c.id === formData.selected_client_id)?.name || t('form.notSelected')}</strong></p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.email || t('form.notSpecified')}</p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.client_category === 'corporate' ? t('form.corporate') : t('form.onetime')}</p>
                                </div>
                            </div>

                            {/* Delivery Information */}
                            <div className={styles.previewSection}>
                                <h3 className={styles.previewSectionTitle}>{t('form.deliveryType')}</h3>
                                <div className={styles.previewSectionContent}>
                                    <p>{t('common.status')}: {formData.delivery_type}</p>
                                    {formData.delivery_date && <p>{t('form.deliveryDate')}: {formData.delivery_date}</p>}
                                    {formData.delivery_time && <p>{t('form.deliveryTime')}: {formData.delivery_time}</p>}
                                    {formData.delivery_address && <p>{t('form.deliveryAddress')}: {formData.delivery_address}</p>}
                                </div>
                            </div>

                            {/* Items */}
                            {formData.menu_items.length > 0 && (
                                <div className={styles.previewSection}>
                                    <h3 className={styles.previewSectionTitle}>{t('form.orderItems')}</h3>
                                    <div className="space-y-2">
                                        {formData.menu_items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.name} x{item.quantity ?? 0}</span>
                                                <span>{(item.price * (item.quantity ?? 0)).toFixed(2)} ₼</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Total Summary */}
                            <div className={styles.previewTotalSection}>
                                <h3 className={styles.previewTotalTitle}>{t('checkout.orderSummary')}</h3>
                                <div className={styles.previewTotalContent}>
                                    <div className={styles.previewTotalRow}>
                                        <span>{t('form.itemsTotal')}</span>
                                        <span>{formData.menu_items.reduce((sum, item) => sum + ((item.quantity ?? 0) * item.price), 0).toFixed(2)} ₼</span>
                                    </div>
                                    {formData.delivery_cost > 0 && (
                                        <div className={styles.previewTotalRow}>
                                            <span>{t('form.deliveryCostLabel')}</span>
                                            <span>{formData.delivery_cost.toFixed(2)} ₼</span>
                                        </div>
                                    )}
                                    <div className={`${styles.previewTotalRow} ${styles.total}`}>
                                        <span>{t('form.total')}</span>
                                        <span>
                                            {(() => {
                                                const subtotal = formData.menu_items.reduce((sum, item) => sum + ((item.quantity ?? 0) * item.price), 0);
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
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={styles.previewConfirmButton}
                            >
                                {t('form.confirmOrder')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}





