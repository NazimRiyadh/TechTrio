import React, { useState, useEffect } from "react";
import { FiTrash2, FiChevronDown, FiChevronUp, FiShoppingCart, FiMapPin, FiCreditCard, FiCalendar, FiUser, FiPhone, FiCopy } from "react-icons/fi";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AdminPages.css";

const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/api/v1/order/admin/getall");
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/api/v1/order/admin/update/${id}`, { status });
      showToast(`Order status updated to ${status}!`);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this order record?")) return;
    try {
      await API.delete(`/api/v1/order/admin/delete/${id}`);
      showToast("Order deleted successfully");
      fetchOrders();
    } catch (err) {
      showToast("Failed to delete order", "error");
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text, type = "ID") => {
    navigator.clipboard.writeText(text);
    showToast(`${type} copied to clipboard!`);
  };

  // Get order count per status
  const getStatusCount = (status) => {
    if (status === "All") return orders.length;
    return orders.filter((o) => o.order_status === status).length;
  };

  // Filter orders by active tab
  const filteredOrders = activeTab === "All" 
    ? orders 
    : orders.filter((o) => o.order_status === activeTab);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Processing":
        return "status-processing";
      case "Shipped":
        return "status-shipped";
      case "Delivered":
        return "status-delivered";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      {/* Tabs Filter Header */}
      <section className="order-tabs-bar card">
        <div className="order-tabs">
          {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => {
            const count = getStatusCount(tab);
            return (
              <button 
                key={tab} 
                className={`order-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="tab-label">{tab}</span>
                <span className="tab-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Orders Table & Detail Expansion */}
      <section className="card admin-table-card">
        {filteredOrders.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="table-responsive admin-orders-desktop">
              <table className="admin-table orders-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items Ordered</th>
                    <th>Order Date</th>
                    <th>Total Charged</th>
                    <th>Fulfillment Status</th>
                    <th className="text-center">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const isExpanded = expandedOrders[o.id];
                    const formattedDate = new Date(o.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    });

                    return (
                      <React.Fragment key={o.id}>
                        {/* High Level Order Row */}
                        <tr 
                          className={`order-row-main ${isExpanded ? "row-expanded-active" : ""}`}
                          onClick={() => toggleExpand(o.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td onClick={(e) => e.stopPropagation()} className="expand-trigger-td">
                            <button className="expand-toggle-btn" onClick={() => toggleExpand(o.id)}>
                              {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                            </button>
                          </td>
                          <td className="body-emphasis order-id-col" onClick={(e) => e.stopPropagation()}>
                            <div className="flex-center gap-xs">
                              <span className="order-short-id" title={o.id}>#{o.id?.slice(0, 8)}</span>
                              <button className="copy-btn-mini" onClick={() => copyToClipboard(o.id, "Order ID")} title="Copy full ID">
                                <FiCopy size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="body-emphasis">
                            <div className="customer-info-cell">
                              <span className="customer-name">{o.shipping_info?.full_name || "Guest Customer"}</span>
                              <span className="customer-phone">{o.shipping_info?.phone || "No phone"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-order-items-summary flex-col gap-xxs" style={{ maxWidth: "250px" }} onClick={(e) => e.stopPropagation()}>
                              {o.order_items?.map((item, idx) => (
                                <div key={idx} className="flex-between caption-md text-graphite" style={{ borderBottom: idx < o.order_items.length - 1 ? "1px dashed var(--color-hairline)" : "none", paddingBottom: 2, marginBottom: 2 }}>
                                  <span className="truncate" style={{ fontWeight: 600, color: "var(--color-ink)", marginRight: 8 }} title={item.title}>
                                    {item.title}
                                  </span>
                                  <span style={{ flexShrink: 0, fontSize: "11px", background: "var(--color-cloud)", padding: "1px 5px", borderRadius: "var(--rounded-sm)", fontWeight: 700 }}>
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-xs text-graphite caption-md">
                              <FiCalendar size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                              <span>{formattedDate}</span>
                            </div>
                          </td>
                          <td className="body-emphasis price-col">
                            ৳{Number(o.total_price).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className={`status-select-wrapper ${getStatusStyle(o.order_status)}`}>
                              <select 
                                className="admin-status-dropdown" 
                                value={o.order_status} 
                                onChange={(e) => updateStatus(o.id, e.target.value)}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="btn btn-outline-ink btn-sm action-icon-btn delete" 
                              onClick={() => deleteOrder(o.id)}
                              title="Delete Record"
                            >
                              <FiTrash2 size={14} /> Delete
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Order Detail Panel */}
                        {isExpanded && (
                          <tr className="order-expanded-details-row">
                            <td colSpan="8">
                              <div className="order-expanded-panel flex">
                                
                                {/* Left Panel: Items Ordered */}
                                <div className="expanded-items-panel">
                                  <h3 className="panel-title"><FiShoppingCart /> Ordered Items</h3>
                                  <div className="expanded-items-list">
                                    {o.order_items?.map((item, idx) => (
                                      <div key={idx} className="expanded-item-card flex">
                                        <div className="item-img-box">
                                          {item.image ? (
                                            <img src={item.image} alt={item.title} />
                                          ) : (
                                            <div className="fallback-img"><FiShoppingCart size={16} /></div>
                                          )}
                                        </div>
                                        <div className="item-meta flex-col">
                                          <span className="item-title truncate" title={item.title}>{item.title}</span>
                                          <span className="item-sku">SKU ID: {item.product_id?.slice(0, 8)}...</span>
                                          <span className="item-pricing caption-md text-graphite">
                                            ৳{Number(item.price).toLocaleString("en-BD")} × {item.quantity}
                                          </span>
                                        </div>
                                        <div className="item-subtotal body-emphasis">
                                          ৳{(Number(item.price) * item.quantity).toLocaleString("en-BD")}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right Panel: Delivery & Billing Profile */}
                                <div className="expanded-profile-panel flex-col">
                                  
                                  {/* Shipping Block */}
                                  <div className="shipping-block">
                                    <h3 className="panel-title"><FiMapPin /> Delivery Address</h3>
                                    <div className="address-card">
                                      <div className="address-line recipient"><FiUser size={14} /> {o.shipping_info?.full_name}</div>
                                      <div className="address-line phone"><FiPhone size={14} /> {o.shipping_info?.phone}</div>
                                      <div className="address-details text-graphite caption-md">
                                        <p>{o.shipping_info?.address}</p>
                                        <p>{o.shipping_info?.city}, {o.shipping_info?.state} - {o.shipping_info?.pincode}</p>
                                        <p>{o.shipping_info?.country}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Billing Block */}
                                  <div className="billing-block">
                                    <h3 className="panel-title"><FiCreditCard /> Order Summary & Receipt</h3>
                                    <div className="billing-receipt">
                                      <div className="receipt-row caption-md text-graphite">
                                        <span>Items Subtotal:</span>
                                        <span>৳{(Number(o.total_price) - Number(o.tax_price || 0) - Number(o.shipping_price || 0)).toLocaleString("en-BD")}</span>
                                      </div>
                                      <div className="receipt-row caption-md text-graphite">
                                        <span>Estimated Tax (18%):</span>
                                        <span>৳{Number(o.tax_price || 0).toLocaleString("en-BD")}</span>
                                      </div>
                                      <div className="receipt-row caption-md text-graphite">
                                        <span>Shipping Charge:</span>
                                        <span>৳{Number(o.shipping_price || 0).toLocaleString("en-BD")}</span>
                                      </div>
                                      <div className="receipt-row receipt-total body-emphasis">
                                        <span>Total Charged:</span>
                                        <span>৳{Number(o.total_price).toLocaleString("en-BD")}</span>
                                      </div>
                                      <div className="payment-status-strip">
                                        <span className="pay-status-label">Payment Status:</span>
                                        {o.paid_at ? (
                                          <span className="badge pay-badge paid">Paid ({new Date(o.paid_at).toLocaleDateString()})</span>
                                        ) : (
                                          <span className="badge pay-badge unpaid">Unpaid / Processing</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="admin-orders-mobile" style={{ padding: "8px 16px" }}>
              {filteredOrders.map((o) => {
                const isExpanded = expandedOrders[o.id];
                const formattedDate = new Date(o.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                });

                return (
                  <div key={o.id} className={`mobile-order-card card ${isExpanded ? "expanded" : ""}`} style={{ padding: 16, marginBottom: 16, border: "1px solid var(--color-hairline)" }}>
                    {/* Card Header Summary */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--color-hairline)", paddingBottom: 12, marginBottom: 12 }}>
                      <div>
                        <div className="flex gap-xs" style={{ alignItems: "center" }}>
                          <span className="order-short-id" style={{ fontSize: "14px" }}>#{o.id?.slice(0, 8)}</span>
                          <button className="copy-btn-mini" onClick={() => copyToClipboard(o.id, "Order ID")} title="Copy full ID" style={{ width: 24, height: 24 }}>
                            <FiCopy size={10} />
                          </button>
                        </div>
                        <span className="caption-sm text-graphite" style={{ display: "block", marginTop: 4 }}>{formattedDate}</span>
                      </div>
                      <button className="expand-toggle-btn" onClick={() => toggleExpand(o.id)} style={{ alignSelf: "center" }}>
                        {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                      </button>
                    </div>

                    {/* Customer Info & Total */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "14px", display: "block", color: "var(--color-ink)" }}>{o.shipping_info?.full_name || "Guest Customer"}</span>
                        <span style={{ fontSize: "12px", color: "var(--color-graphite)" }}>{o.shipping_info?.phone || "No phone"}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--color-primary)", display: "block" }}>
                          ৳{Number(o.total_price).toLocaleString("en-BD")}
                        </span>
                      </div>
                    </div>

                    {/* Quick Status and Operations Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", borderTop: "1px solid var(--color-hairline)", paddingTop: 12 }}>
                      <div className={`status-select-wrapper ${getStatusStyle(o.order_status)}`}>
                        <select 
                          className="admin-status-dropdown" 
                          value={o.order_status} 
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      <button 
                        className="btn btn-outline-ink btn-sm action-icon-btn delete" 
                        onClick={() => deleteOrder(o.id)}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>

                    {/* Expanded Items & Summary Block */}
                    {isExpanded && (
                      <div style={{ borderTop: "1px solid var(--color-hairline)", marginTop: 16, paddingTop: 16 }}>
                        {/* Items */}
                        <h4 className="panel-title" style={{ fontSize: "12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><FiShoppingCart /> Ordered Items</h4>
                        <div className="expanded-items-list" style={{ gap: 8, marginBottom: 16 }}>
                          {o.order_items?.map((item, idx) => (
                            <div key={idx} className="expanded-item-card flex" style={{ padding: 8, display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="item-img-box" style={{ width: 36, height: 36, flexShrink: 0 }}>
                                {item.image ? (
                                  <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                ) : (
                                  <div className="fallback-img"><FiShoppingCart size={14} /></div>
                                )}
                              </div>
                              <div className="item-meta flex-col" style={{ minWidth: 0, flex: 1 }}>
                                <span className="item-title truncate" style={{ fontSize: "12px", display: "block", color: "var(--color-ink)" }} title={item.title}>{item.title}</span>
                                <span className="item-pricing caption-md text-graphite" style={{ fontSize: "11px", display: "block", marginTop: 2 }}>
                                  ৳{Number(item.price).toLocaleString("en-BD")} × {item.quantity}
                                </span>
                              </div>
                              <div className="item-subtotal body-emphasis" style={{ fontSize: "12.5px", fontWeight: 700, flexShrink: 0 }}>
                                ৳{(Number(item.price) * item.quantity).toLocaleString("en-BD")}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Address */}
                        <h4 className="panel-title" style={{ fontSize: "12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><FiMapPin /> Delivery Address</h4>
                        <div className="address-card" style={{ padding: 12, marginBottom: 16, border: "1px solid var(--color-hairline)", borderRadius: "var(--rounded-lg)" }}>
                          <div className="address-details text-graphite caption-md" style={{ marginTop: 0, paddingTop: 0, borderTop: "none", fontSize: "12px" }}>
                            <p style={{ fontWeight: 600, color: "var(--color-ink)", marginBottom: 4 }}>{o.shipping_info?.full_name}</p>
                            <p>{o.shipping_info?.address}</p>
                            <p>{o.shipping_info?.city}, {o.shipping_info?.state} - {o.shipping_info?.pincode}</p>
                            <p>{o.shipping_info?.country}</p>
                            <p style={{ marginTop: 4 }}>Phone: {o.shipping_info?.phone}</p>
                          </div>
                        </div>

                        {/* Billing Receipt */}
                        <h4 className="panel-title" style={{ fontSize: "12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><FiCreditCard /> Order Summary</h4>
                        <div className="billing-receipt" style={{ padding: 12, border: "1px solid var(--color-hairline)", borderRadius: "var(--rounded-lg)" }}>
                          <div className="receipt-row caption-md text-graphite" style={{ fontSize: "12px", padding: "4px 0", display: "flex", justifyContent: "space-between" }}>
                            <span>Subtotal:</span>
                            <span>৳{(Number(o.total_price) - Number(o.tax_price || 0) - Number(o.shipping_price || 0)).toLocaleString("en-BD")}</span>
                          </div>
                          <div className="receipt-row caption-md text-graphite" style={{ fontSize: "12px", padding: "4px 0", display: "flex", justifyContent: "space-between" }}>
                            <span>Tax:</span>
                            <span>৳{Number(o.tax_price || 0).toLocaleString("en-BD")}</span>
                          </div>
                          <div className="receipt-row caption-md text-graphite" style={{ fontSize: "12px", padding: "4px 0", display: "flex", justifyContent: "space-between" }}>
                            <span>Shipping:</span>
                            <span>৳{Number(o.shipping_price || 0).toLocaleString("en-BD")}</span>
                          </div>
                          <div className="receipt-row receipt-total body-emphasis" style={{ fontSize: "13.5px", paddingTop: 8, marginTop: 4, display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-hairline)", fontWeight: 700 }}>
                            <span>Total:</span>
                            <span>৳{Number(o.total_price).toLocaleString("en-BD")}</span>
                          </div>
                          <div className="payment-status-strip" style={{ marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-hairline)", alignItems: "center" }}>
                            <span className="pay-status-label" style={{ fontSize: "11px", color: "var(--color-graphite)" }}>Payment Status:</span>
                            {o.paid_at ? (
                              <span className="badge pay-badge paid" style={{ fontSize: "10px", padding: "2px 6px" }}>Paid</span>
                            ) : (
                              <span className="badge pay-badge unpaid" style={{ fontSize: "10px", padding: "2px 6px" }}>Unpaid</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="table-empty-state">
            <FiShoppingCart size={48} className="empty-icon" />
            <h3>No orders found</h3>
            <p className="caption-md text-graphite">Orders matching the "{activeTab}" status category will be populated here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOrders;
