"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Application, CartItem, Client } from "../config/api";
import { makeApiRequest } from "../utils/apiHelpers";
import { useAuthGuard, canCreateOrders } from "../utils/authConstants";

interface OrderFormData {
  selected_client_id: number | null;
  menu_items: CartItem[];
  comment: string;
  delivery_date: string;
  delivery_time: string;
  delivery_type: 'delivery' | 'pickup' | 'buffet';
  delivery_address: string;
  delivery_cost: number;
  discount_fixed: number;
  discount_percent: number;
  recurring_schedule: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly';
    days: string[];
    delivery_time: string;
    notes: string;
  };
}

export default function CreateOrderForm() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromApplicationId = searchParams.get('fromApplication');

    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [application, setApplication] = useState<Application | null>(null);
    const [formData, setFormData] = useState<OrderFormData>({
        selected_client_id: null,
        menu_items: [],
        comment: '',
        delivery_date: '',
        delivery_time: '',
        delivery_type: 'delivery',
        delivery_address: '',
        delivery_cost: 0,
        discount_fixed: 0,
        discount_percent: 0,
        recurring_schedule: {
            enabled: false,
            frequency: 'weekly',
            days: [],
            delivery_time: '',
            notes: ''
        }
    });

    const hasAccess = useAuthGuard(isAuthenticated, authLoading, user || { user_type: '', staff_role: '' }, canCreateOrders, router);

    const loadClients = useCallback(async () => {
        try {
            const result = await makeApiRequest<{data: Client[]}>('clients');
            if (result.success && result.data?.data) {
                setClients(result.data.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки клиентов:', error);
        }
    }, []);

    const loadApplication = useCallback(async (clientId: string) => {
        setLoading(true);
        try {
            const result = await makeApiRequest<Application>(`applications/${clientId}`);
            if (result.success && result.data) {
                const app = result.data;
                setApplication(app);
                // Pre-fill form with application data
                setFormData(prev => ({
                    ...prev,
                    selected_client_id: (app as any).client_id || null,
                    comment: (app as any).comment || '',
                    delivery_date: (app as any).delivery_date || '',
                    delivery_time: (app as any).delivery_time || '',
                    delivery_type: (app as any).delivery_type || 'delivery',
                    delivery_address: (app as any).delivery_address || ''
                }));
            }
        } catch (error) {
            console.error('Ошибка загрузки заявки:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (hasAccess) {
            loadClients();
        }
    }, [hasAccess, loadClients]);

    useEffect(() => {
        if (fromApplicationId && hasAccess) {
            loadApplication(fromApplicationId);
        }
    }, [fromApplicationId, hasAccess, loadApplication]);

    const handleInputChange = (field: keyof OrderFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRecurringChange = (field: keyof OrderFormData['recurring_schedule'], value: any) => {
        setFormData(prev => ({
            ...prev,
            recurring_schedule: {
                ...prev.recurring_schedule,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const result = await makeApiRequest('orders', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            
            if (result.success) {
                router.push('/dashboard/orders');
            } else {
                console.error('Ошибка создания заказа:', result.errors);
            }
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (authLoading || !hasAccess) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: '#F8FAFC'
            }}>
                <div style={{ 
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading Access...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    padding: '40px'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '30px',
                        color: '#1A1A1A',
                        fontFamily: 'Playfair Display, serif'
                    }}>
                        Create New Order
                    </h1>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Client Selection */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                marginBottom: '8px',
                                color: '#1A1A1A'
                            }}>
                                Client
                            </label>
                            <select
                                value={formData.selected_client_id || ''}
                                onChange={(e) => handleInputChange('selected_client_id', e.target.value ? Number(e.target.value) : null)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                                required
                            >
                                <option value="">Select a client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} ({client.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Delivery Type */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                marginBottom: '8px',
                                color: '#1A1A1A'
                            }}>
                                Delivery Type
                            </label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {['delivery', 'pickup', 'buffet'].map(type => (
                                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                            value={type}
                                            checked={formData.delivery_type === type}
                                            onChange={(e) => handleInputChange('delivery_type', e.target.value as any)}
                                        />
                                        <span style={{ textTransform: 'capitalize' }}>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Date */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                marginBottom: '8px',
                                color: '#1A1A1A'
                            }}>
                                Delivery Date
                            </label>
                            <input
                                type="date"
                                value={formData.delivery_date}
                                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>

                        {/* Delivery Time */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                marginBottom: '8px',
                                color: '#1A1A1A'
                            }}>
                                Delivery Time
                            </label>
                            <input
                                type="time"
                                value={formData.delivery_time}
                                onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>

                        {/* Delivery Address */}
                        {formData.delivery_type === 'delivery' && (
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    marginBottom: '8px',
                                    color: '#1A1A1A'
                                }}>
                                    Delivery Address
                                </label>
                                <textarea
                                    value={formData.delivery_address}
                                    onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        outline: 'none',
                                        minHeight: '80px',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Enter delivery address"
                                    required
                                />
                            </div>
                        )}

                        {/* Comment */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                marginBottom: '8px',
                                color: '#1A1A1A'
                            }}>
                                Comment
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                                placeholder="Additional notes or special instructions"
                            />
                        </div>

                        {/* Recurring Schedule */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.recurring_schedule.enabled}
                                    onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                                />
                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>
                                    Enable Recurring Schedule
                                </span>
                            </label>

                            {formData.recurring_schedule.enabled && (
                                <div style={{ 
                                    padding: '20px', 
                                    backgroundColor: '#F8FAFC', 
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            fontSize: '14px', 
                                            fontWeight: '600', 
                                            marginBottom: '8px',
                                            color: '#1A1A1A'
                                        }}>
                                            Frequency
                                        </label>
                                        <select
                                            value={formData.recurring_schedule.frequency}
                                            onChange={(e) => handleRecurringChange('frequency', e.target.value as any)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #E5E7EB',
                                                borderRadius: '6px',
                                                fontSize: '16px',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            fontSize: '14px', 
                                            fontWeight: '600', 
                                            marginBottom: '8px',
                                            color: '#1A1A1A'
                                        }}>
                                            Recurring Delivery Time
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.recurring_schedule.delivery_time}
                                            onChange={(e) => handleRecurringChange('delivery_time', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #E5E7EB',
                                                borderRadius: '6px',
                                                fontSize: '16px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            fontSize: '14px', 
                                            fontWeight: '600', 
                                            marginBottom: '8px',
                                            color: '#1A1A1A'
                                        }}>
                                            Recurring Notes
                                        </label>
                                        <textarea
                                            value={formData.recurring_schedule.notes}
                                            onChange={(e) => handleRecurringChange('notes', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #E5E7EB',
                                                borderRadius: '6px',
                                                fontSize: '16px',
                                                outline: 'none',
                                                minHeight: '60px',
                                                resize: 'vertical'
                                            }}
                                            placeholder="Notes for recurring orders"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/orders')}
                                style={{
                                    padding: '12px 24px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#D1D5DB';
                                    e.currentTarget.style.color = '#1A1A1A';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.color = '#6b7280';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: 'white',
                                    backgroundColor: loading ? '#9CA3AF' : '#1A1A1A',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = '#4A4A4A';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = '#1A1A1A';
                                    }
                                }}
                            >
                                {loading ? 'Creating...' : 'Create Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
