"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Order {
  _id: string;
  userId?: { name?: string; email?: string; phone?: string } | null;
  cartItems: {
    productId: string;
    name: string;
    image?: string;
    quantity: number;
    price: number;
    attributes?: { attribute: string; value: string }[];
  }[];
  totalPrice: number;
  shippingInfo: any;
  status: string;
  createdAt: string;
  orderNumber?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusOptions = [
  { value: '', label: 'Toutes les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payée' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    phone: '',
    client: '',
    dateFrom: '',
    dateTo: '',
  });
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ status: '', phone: '', client: '', dateFrom: '', dateTo: '' });
  };

  const applyFilters = () => {
    let result = [...orders];
    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }
    if (filters.phone) {
      result = result.filter(order =>
        (order.shippingInfo?.phone || '').toLowerCase().includes(filters.phone.toLowerCase())
      );
    }
    if (filters.client) {
      result = result.filter(order =>
        (order.userId?.name || '').toLowerCase().includes(filters.client.toLowerCase())
      );
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      result = result.filter(order => new Date(order.createdAt) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      result = result.filter(order => new Date(order.createdAt) <= to);
    }
    setFilteredOrders(result);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    const prevStatus = selectedOrder.status;
    try {
      const res = await fetch(`/api/orders?orderId=${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du statut');
      }
      const data = await res.json();
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setOrders(orders => orders.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
      toast.success('Statut mis à jour avec succès');
    } catch (error: any) {
      setSelectedOrder({ ...selectedOrder, status: prevStatus });
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 dark:bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Commandes</h1>
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-blue-50 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17V13.414a1 1 0 00-.293-.707L3 6.707A1 1 0 013 6V4z" /></svg>
          Filtres
        </button>
      </div>
      {/* Filters Modal/Panel */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-2 p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setFiltersOpen(false)}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold focus:outline-none"
              aria-label="Fermer"
            >
              &times;
            </button>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtres de recherche</h2>
                <button
                  onClick={resetFilters}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Réinitialiser
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Statut</label>
                  <select
                    value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={filters.phone}
                    onChange={e => handleFilterChange('phone', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rechercher par téléphone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nom du client</label>
                  <input
                    type="text"
                    value={filters.client}
                    onChange={e => handleFilterChange('client', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rechercher par nom du client"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={e => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={e => handleFilterChange('dateTo', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition mt-2"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">Aucune commande trouvée pour ces filtres.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order, idx) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">{order.orderNumber || order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{order.userId?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{order.shippingInfo?.phone || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{order.totalPrice.toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[order.status] || 'bg-gray-200 text-gray-800'}`}>{statusLabels[order.status] || order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{new Date(order.createdAt).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        onClick={() => setSelectedOrder(order)}
                      >Détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal for order details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen py-4 backdrop-blur-sm bg-black/40" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl mx-2 p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold focus:outline-none"
              aria-label="Fermer"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Détails de la Commande</h2>
            <div className="mb-4">
              <div className="flex flex-wrap gap-4 mb-2">
                <div><span className="font-semibold">N°:</span> <span className="font-mono">{selectedOrder.orderNumber || selectedOrder._id}</span></div>
                <div>
                  <span className="font-semibold">Statut:</span>{' '}
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    className={`px-2 py-1 rounded text-xs font-bold border ml-2 ${statusColors[selectedOrder.status] || 'bg-gray-200 text-gray-800'}`}
                  >
                    {statusOptions.filter(opt => opt.value).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div><span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex flex-wrap gap-4 mb-2">
                <div><span className="font-semibold">Client:</span> {selectedOrder.userId?.name || '-'}</div>
                <div><span className="font-semibold">Email:</span> {selectedOrder.userId?.email || '-'}</div>
                <div><span className="font-semibold">Téléphone:</span> {selectedOrder.shippingInfo?.phone || '-'}</div>
              </div>
              <div className="flex flex-wrap gap-4 mb-2">
                <div><span className="font-semibold">Adresse:</span> {selectedOrder.shippingInfo?.address || '-'}, {selectedOrder.shippingInfo?.city || ''} {selectedOrder.shippingInfo?.postalCode || ''} {selectedOrder.shippingInfo?.country || ''}</div>
              </div>
            </div>
            {/* Shipping Info Section */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Informations de livraison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><span className="font-semibold">Nom:</span> {selectedOrder.shippingInfo?.lastName || '-'}</div>
                <div><span className="font-semibold">Prénom:</span> {selectedOrder.shippingInfo?.firstName || '-'}</div>
                <div><span className="font-semibold">Téléphone:</span> {selectedOrder.shippingInfo?.phone || '-'}</div>
                <div><span className="font-semibold">Email:</span> {selectedOrder.shippingInfo?.email || '-'}</div>
                <div className="md:col-span-2"><span className="font-semibold">Adresse:</span> {selectedOrder.shippingInfo?.address || '-'}</div>
                <div><span className="font-semibold">Ville:</span> {selectedOrder.shippingInfo?.city || '-'}</div>
                <div><span className="font-semibold">Code Postal:</span> {selectedOrder.shippingInfo?.postalCode || '-'}</div>
                <div><span className="font-semibold">Pays:</span> {selectedOrder.shippingInfo?.country || '-'}</div>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Produits</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-2 py-1 text-left">Produit</th>
                      <th className="px-2 py-1 text-left">Qté</th>
                      <th className="px-2 py-1 text-left">Prix</th>
                      <th className="px-2 py-1 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.cartItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 flex items-center gap-2">
                          {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />}
                          <span>{item.name}</span>
                        </td>
                        <td className="px-2 py-1">{item.quantity}</td>
                        <td className="px-2 py-1">{item.price.toFixed(2)} €</td>
                        <td className="px-2 py-1">{(item.price * item.quantity).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end items-center gap-4 mt-6">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">Total: {selectedOrder.totalPrice.toFixed(2)} €</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 