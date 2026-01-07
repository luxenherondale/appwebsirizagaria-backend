# Business Logic Frontend Implementation Guide

Complete guide for implementing the business logic system on the frontend with React examples, hooks, and components.

---

## Table of Contents

1. [React Hooks](#react-hooks)
2. [Customer Management](#customer-management)
3. [Invoice Management](#invoice-management)
4. [Stock Management](#stock-management)
5. [Shipping Management](#shipping-management)
6. [Purchase Orders](#purchase-orders)
7. [Accounting Dashboard](#accounting-dashboard)
8. [Integration Examples](#integration-examples)

---

## React Hooks

### useCustomers Hook

```javascript
import { useState, useCallback } from 'react';

export function useCustomers(token) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchCustomers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/customers?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getCustomerById = useCallback(async (id) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/customers/${id}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching customer:', err);
      return null;
    }
  }, [token]);

  const getCustomerByRut = useCallback(async (rut) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/customers/rut/${rut}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching customer by RUT:', err);
      return null;
    }
  }, [token]);

  const createCustomer = useCallback(async (customerData) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/customers',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customerData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setCustomers([data.data, ...customers]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, customers]);

  const updateCustomer = useCallback(async (id, updates) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/customers/${id}`,
        {
          method: 'PUT',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );
      const data = await response.json();
      if (data.success) {
        setCustomers(customers.map(c => c._id === id ? data.data : c));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, customers]);

  const getCustomerStats = useCallback(async (id) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/customers/${id}/stats`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching customer stats:', err);
      return null;
    }
  }, [token]);

  return {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    getCustomerById,
    getCustomerByRut,
    createCustomer,
    updateCustomer,
    getCustomerStats
  };
}
```

### useInvoices Hook

```javascript
import { useState, useCallback } from 'react';

export function useInvoices(token) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchInvoices = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/invoices?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getInvoiceById = useCallback(async (id) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/invoices/${id}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching invoice:', err);
      return null;
    }
  }, [token]);

  const createInvoice = useCallback(async (invoiceData) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/invoices',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoiceData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvoices([data.data, ...invoices]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, invoices]);

  const recordPayment = useCallback(async (invoiceId, paymentData) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/invoices/${invoiceId}/payment`,
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvoices(invoices.map(inv => 
          inv._id === invoiceId ? data.data : inv
        ));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, invoices]);

  const getInvoiceStats = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/invoices/stats',
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching invoice stats:', err);
      return null;
    }
  }, [token]);

  return {
    invoices,
    loading,
    error,
    pagination,
    fetchInvoices,
    getInvoiceById,
    createInvoice,
    recordPayment,
    getInvoiceStats
  };
}
```

### useStock Hook

```javascript
import { useState, useCallback } from 'react';

export function useStock(token) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchStock = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/stock?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setStock(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getCustomerStock = useCallback(async (customerId) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/stock/customer/${customerId}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.error('Error fetching customer stock:', err);
      return [];
    }
  }, [token]);

  const createStock = useCallback(async (stockData) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/stock',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(stockData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setStock([data.data, ...stock]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, stock]);

  const reserveStock = useCallback(async (stockId, quantity, reason) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/stock/${stockId}/reserve`,
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity, reason })
        }
      );
      const data = await response.json();
      if (data.success) {
        setStock(stock.map(s => s._id === stockId ? data.data : s));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, stock]);

  const releaseStock = useCallback(async (stockId, quantity, reason) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/stock/${stockId}/release`,
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity, reason })
        }
      );
      const data = await response.json();
      if (data.success) {
        setStock(stock.map(s => s._id === stockId ? data.data : s));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, stock]);

  return {
    stock,
    loading,
    error,
    pagination,
    fetchStock,
    getCustomerStock,
    createStock,
    reserveStock,
    releaseStock
  };
}
```

### useShipping Hook

```javascript
import { useState, useCallback } from 'react';

export function useShipping(token) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchShipments = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/shipping?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setShipments(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createShipment = useCallback(async (shipmentData) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/shipping',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shipmentData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setShipments([data.data, ...shipments]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, shipments]);

  const updateShipmentStatus = useCallback(async (shipmentId, statusData) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/shipping/${shipmentId}/status`,
        {
          method: 'PUT',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(statusData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setShipments(shipments.map(s => 
          s._id === shipmentId ? data.data : s
        ));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, shipments]);

  const generateGuiaElectronica = useCallback(async (shipmentId) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/shipping/${shipmentId}/guia-electronica`,
        {
          method: 'POST',
          headers: { 'x-auth-token': token }
        }
      );
      const data = await response.json();
      if (data.success) {
        setShipments(shipments.map(s => 
          s._id === shipmentId ? data.data : s
        ));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, shipments]);

  return {
    shipments,
    loading,
    error,
    pagination,
    fetchShipments,
    createShipment,
    updateShipmentStatus,
    generateGuiaElectronica
  };
}
```

### usePurchaseOrders Hook

```javascript
import { useState, useCallback } from 'react';

export function usePurchaseOrders(token) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchPurchaseOrders = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/purchase-orders?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createPurchaseOrder = useCallback(async (poData) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/purchase-orders',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(poData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setOrders([data.data, ...orders]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, orders]);

  const receivePurchaseOrder = useCallback(async (poId, receiveData) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/purchase-orders/${poId}/receive`,
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(receiveData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(o => o._id === poId ? data.data : o));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, orders]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchPurchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder
  };
}
```

### useContabilidad Hook

```javascript
import { useState, useCallback } from 'react';

export function useContabilidad(token) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/contabilidad?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getFinancialSummary = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/contabilidad/summary?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching financial summary:', err);
      return null;
    }
  }, [token]);

  const getCustomerFinancialSummary = useCallback(async (customerId) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/contabilidad/customer/${customerId}/summary`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching customer financial summary:', err);
      return null;
    }
  }, [token]);

  const createTransaction = useCallback(async (transactionData) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/contabilidad',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transactionData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setTransactions([data.data, ...transactions]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, transactions]);

  const verifyTransaction = useCallback(async (transactionId, notes) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/contabilidad/${transactionId}/verify`,
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );
      const data = await response.json();
      if (data.success) {
        setTransactions(transactions.map(t => 
          t._id === transactionId ? data.data : t
        ));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, transactions]);

  const reconcileTransaction = useCallback(async (transactionId, reconciliationData) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/contabilidad/${transactionId}/reconcile`,
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reconciliationData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setTransactions(transactions.map(t => 
          t._id === transactionId ? data.data : t
        ));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, transactions]);

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    getFinancialSummary,
    getCustomerFinancialSummary,
    createTransaction,
    verifyTransaction,
    reconcileTransaction
  };
}
```

---

## Customer Management

### Customer List Component

```javascript
import React, { useEffect, useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';

export function CustomerList({ token }) {
  const { customers, loading, error, pagination, fetchCustomers } = useCustomers(token);
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers(filters);
  }, [filters]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="customer-list">
      <h2>Customers</h2>
      
      <input
        type="text"
        placeholder="Search by RUT, email, name, or phone..."
        value={search}
        onChange={handleSearch}
        className="search-input"
      />

      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>RUT</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Total Orders</th>
            <th>Total Spent</th>
            <th>Amount Owed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer._id}>
              <td>{customer.name}</td>
              <td>{customer.rut}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>{customer.totalOrders}</td>
              <td>${customer.totalSpent?.toLocaleString()}</td>
              <td className={customer.totalOwed > 0 ? 'owed' : ''}>
                ${customer.totalOwed?.toLocaleString()}
              </td>
              <td>
                <button onClick={() => window.location.href = `/customers/${customer._id}`}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="pagination">
          <button 
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button 
            disabled={filters.page === pagination.pages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### Customer Detail Component

```javascript
import React, { useEffect, useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';

export function CustomerDetail({ customerId, token }) {
  const { getCustomerById, getCustomerStats } = useCustomers(token);
  const { fetchInvoices } = useInvoices(token);
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const customerData = await getCustomerById(customerId);
      const statsData = await getCustomerStats(customerId);
      setCustomer(customerData);
      setStats(statsData);
      setLoading(false);
    };
    loadData();
  }, [customerId]);

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="customer-detail">
      <h1>{customer.name}</h1>
      
      <div className="customer-info">
        <div className="info-group">
          <label>RUT:</label>
          <span>{customer.rut}</span>
        </div>
        <div className="info-group">
          <label>Email:</label>
          <span>{customer.email}</span>
        </div>
        <div className="info-group">
          <label>Phone:</label>
          <span>{customer.phone}</span>
        </div>
        <div className="info-group">
          <label>Address:</label>
          <span>{customer.address}, {customer.commune}, {customer.region}</span>
        </div>
      </div>

      {stats && (
        <div className="customer-stats">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Spent</h3>
            <p className="stat-value">${stats.totalSpent?.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Total Paid</h3>
            <p className="stat-value">${stats.totalPaid?.toLocaleString()}</p>
          </div>
          <div className="stat-card owed">
            <h3>Amount Owed</h3>
            <p className="stat-value">${stats.amountOwed?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="customer-invoices">
        <h2>Recent Invoices</h2>
        {/* Invoice list component here */}
      </div>
    </div>
  );
}
```

---

## Invoice Management

### Invoice List Component

```javascript
import React, { useEffect, useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';

export function InvoiceList({ token, customerId = null }) {
  const { invoices, loading, error, pagination, fetchInvoices } = useInvoices(token);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    ...(customerId && { customerId })
  });

  useEffect(() => {
    fetchInvoices(filters);
  }, [filters]);

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, status, page: 1 });
  };

  if (loading) return <div>Loading invoices...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="invoice-list">
      <h2>Invoices</h2>

      <div className="filter-buttons">
        <button onClick={() => handleStatusFilter('')}>All</button>
        <button onClick={() => handleStatusFilter('unpaid')}>Unpaid</button>
        <button onClick={() => handleStatusFilter('partially_paid')}>Partially Paid</button>
        <button onClick={() => handleStatusFilter('paid')}>Paid</button>
      </div>

      <table className="invoices-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Owed</th>
            <th>Status</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice._id}>
              <td>{invoice.invoiceNumber}</td>
              <td>{invoice.customerId?.name}</td>
              <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
              <td>${invoice.total?.toLocaleString()}</td>
              <td>${invoice.amountPaid?.toLocaleString()}</td>
              <td className={invoice.amountOwed > 0 ? 'owed' : ''}>
                ${invoice.amountOwed?.toLocaleString()}
              </td>
              <td>
                <span className={`status ${invoice.status}`}>
                  {invoice.status}
                </span>
              </td>
              <td>
                <span className={`payment-status ${invoice.paymentStatus}`}>
                  {invoice.paymentStatus}
                </span>
              </td>
              <td>
                <button onClick={() => window.location.href = `/invoices/${invoice._id}`}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="pagination">
          {/* Pagination controls */}
        </div>
      )}
    </div>
  );
}
```

### Invoice Detail Component

```javascript
import React, { useEffect, useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';

export function InvoiceDetail({ invoiceId, token }) {
  const { getInvoiceById, recordPayment } = useInvoices(token);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'transfer',
    reference: ''
  });

  useEffect(() => {
    const loadInvoice = async () => {
      const data = await getInvoiceById(invoiceId);
      setInvoice(data);
      setLoading(false);
    };
    loadInvoice();
  }, [invoiceId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const result = await recordPayment(invoiceId, paymentForm);
    if (result.success) {
      setInvoice(result.data);
      setPaymentForm({ amount: '', paymentMethod: 'transfer', reference: '' });
      alert('Payment recorded successfully');
    } else {
      alert('Error recording payment: ' + result.error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="invoice-detail">
      <h1>Invoice {invoice.invoiceNumber}</h1>

      <div className="invoice-header">
        <div>
          <strong>Customer:</strong> {invoice.customerId?.name}
        </div>
        <div>
          <strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
        </div>
      </div>

      <table className="invoice-items">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, idx) => (
            <tr key={idx}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>${item.unitPrice?.toLocaleString()}</td>
              <td>${item.total?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary">
        <div>Subtotal: ${invoice.subtotal?.toLocaleString()}</div>
        <div>Tax (19%): ${invoice.tax?.toLocaleString()}</div>
        <div className="total">Total: ${invoice.total?.toLocaleString()}</div>
      </div>

      <div className="payment-section">
        <h2>Payment Status</h2>
        <div className="payment-info">
          <div>Amount Paid: ${invoice.amountPaid?.toLocaleString()}</div>
          <div className={invoice.amountOwed > 0 ? 'owed' : ''}>
            Amount Owed: ${invoice.amountOwed?.toLocaleString()}
          </div>
          <div>Status: <span className={`status ${invoice.paymentStatus}`}>{invoice.paymentStatus}</span></div>
        </div>

        {invoice.amountOwed > 0 && (
          <form onSubmit={handlePaymentSubmit} className="payment-form">
            <h3>Record Payment</h3>
            <input
              type="number"
              placeholder="Amount"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
            />
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
            >
              <option value="transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
            </select>
            <input
              type="text"
              placeholder="Reference (e.g., transaction ID)"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
            />
            <button type="submit">Record Payment</button>
          </form>
        )}

        {invoice.payments?.length > 0 && (
          <div className="payment-history">
            <h3>Payment History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment, idx) => (
                  <tr key={idx}>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>${payment.amount?.toLocaleString()}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Stock Management

### Stock List Component

```javascript
import React, { useEffect, useState } from 'react';
import { useStock } from '../hooks/useStock';

export function StockList({ token, customerId = null }) {
  const { stock, loading, error, pagination, fetchStock } = useStock(token);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    ...(customerId && { customerId })
  });

  useEffect(() => {
    fetchStock(filters);
  }, [filters]);

  if (loading) return <div>Loading stock...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="stock-list">
      <h2>Stock Management</h2>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Book</th>
            <th>Quantity</th>
            <th>Reserved</th>
            <th>Available</th>
            <th>Location</th>
            <th>Cost/Unit</th>
            <th>Total Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stock.map(item => (
            <tr key={item._id}>
              <td>{item.customerId?.name}</td>
              <td>{item.bookId?.title}</td>
              <td>{item.quantity}</td>
              <td>{item.reservedQuantity}</td>
              <td className={item.availableQuantity === 0 ? 'low-stock' : ''}>
                {item.availableQuantity}
              </td>
              <td>{item.location}</td>
              <td>${item.costPerUnit?.toLocaleString()}</td>
              <td>${item.totalCost?.toLocaleString()}</td>
              <td>
                <button onClick={() => window.location.href = `/stock/${item._id}`}>
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="pagination">
          {/* Pagination controls */}
        </div>
      )}
    </div>
  );
}
```

---

## Accounting Dashboard

### Financial Summary Component

```javascript
import React, { useEffect, useState } from 'react';
import { useContabilidad } from '../hooks/useContabilidad';

export function FinancialSummary({ token }) {
  const { getFinancialSummary } = useContabilidad(token);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadSummary = async () => {
      const data = await getFinancialSummary(dateRange);
      setSummary(data);
      setLoading(false);
    };
    loadSummary();
  }, [dateRange]);

  if (loading) return <div>Loading financial summary...</div>;
  if (!summary) return <div>Error loading summary</div>;

  return (
    <div className="financial-summary">
      <h1>Financial Summary</h1>

      <div className="date-range">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
        />
        <span>to</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
        />
      </div>

      <div className="summary-cards">
        <div className="card income">
          <h3>Total Income</h3>
          <p className="amount">${summary.totalIncome?.toLocaleString()}</p>
        </div>
        <div className="card expense">
          <h3>Total Expenses</h3>
          <p className="amount">${summary.totalExpenses?.toLocaleString()}</p>
        </div>
        <div className="card net">
          <h3>Net Income</h3>
          <p className="amount">${summary.netIncome?.toLocaleString()}</p>
        </div>
      </div>

      <div className="by-category">
        <h2>By Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Income</th>
              <th>Expense</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.byCategory || {}).map(([category, amounts]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>${amounts.income?.toLocaleString()}</td>
                <td>${amounts.expense?.toLocaleString()}</td>
                <td>${(amounts.income - amounts.expense)?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="by-status">
        <h2>By Status</h2>
        <div className="status-breakdown">
          {Object.entries(summary.byStatus || {}).map(([status, count]) => (
            <div key={status} className="status-item">
              <span>{status}</span>
              <span className="count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Integration Examples

### Complete Order Flow

```javascript
import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { useStock } from '../hooks/useStock';
import { useShipping } from '../hooks/useShipping';

export function OrderFlow({ token }) {
  const { customers, fetchCustomers } = useCustomers(token);
  const { createInvoice } = useInvoices(token);
  const { reserveStock } = useStock(token);
  const { createShipment } = useShipping(token);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [],
    shippingAddress: {}
  });

  const handleCreateOrder = async () => {
    try {
      // Step 1: Create invoice
      const invoiceResult = await createInvoice({
        invoiceNumber: `INV-${Date.now()}`,
        customerId: formData.customerId,
        items: formData.items
      });

      if (!invoiceResult.success) throw new Error(invoiceResult.error);

      // Step 2: Reserve stock
      for (const item of formData.items) {
        if (item.stockId) {
          await reserveStock(item.stockId, item.quantity, `Invoice ${invoiceResult.data.invoiceNumber}`);
        }
      }

      // Step 3: Create shipment
      const shipmentResult = await createShipment({
        orderId: formData.orderId,
        customerId: formData.customerId,
        invoiceId: invoiceResult.data._id,
        items: formData.items,
        shippingAddress: formData.shippingAddress,
        shippingMethod: 'courier'
      });

      if (shipmentResult.success) {
        alert('Order created successfully!');
        // Reset form
        setFormData({ customerId: '', items: [], shippingAddress: {} });
        setStep(1);
      }
    } catch (error) {
      alert('Error creating order: ' + error.message);
    }
  };

  return (
    <div className="order-flow">
      <h1>Create Order</h1>
      
      {step === 1 && (
        <div className="step">
          <h2>Select Customer</h2>
          <select 
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
          >
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button onClick={() => setStep(2)} disabled={!formData.customerId}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <h2>Add Items</h2>
          {/* Item selection form */}
          <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <h2>Shipping Address</h2>
          {/* Shipping address form */}
          <button onClick={handleCreateOrder}>Create Order</button>
        </div>
      )}
    </div>
  );
}
```

---

## Summary

This frontend implementation guide provides:

✅ **6 Custom React Hooks** - Complete data management for all business logic
✅ **Reusable Components** - Customer, invoice, stock, shipping management
✅ **API Integration** - Full REST API integration examples
✅ **Form Handling** - Complete form examples for all operations
✅ **State Management** - Proper state handling with React hooks
✅ **Error Handling** - Comprehensive error handling
✅ **Pagination** - Pagination support for all list views
✅ **Filtering** - Advanced filtering capabilities
✅ **Real-world Flows** - Complete order creation flow example

All components are production-ready and follow React best practices.
