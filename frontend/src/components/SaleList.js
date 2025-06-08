"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import "./SaleList.css"

function SaleList({ onEditSale, refreshTrigger, onUpdateSale, onDeleteSale }) {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [refreshTrigger])

  const fetchSales = async () => {
    try {
      setIsRefreshing(true)
      const res = await axios.get("https://mmtkdj1aj0.execute-api.us-east-1.amazonaws.com/lab/sales")
      console.log("Respuesta API:", res.data)
      const salesData = JSON.parse(res.data.body)

      const salesWithIds = salesData.map((sale, index) => ({
        ...sale,
        id: sale.id || `sale-${index}-${Date.now()}-${Math.random()}`,
      }))

      setSales(salesWithIds)
    } catch (error) {
      console.error("Error cargando ventas", error)
      showToast("Error al cargar las ventas", "error")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <div class="toast-content">
        <svg class="toast-icon">
          ${
            type === "success"
              ? '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
              : '<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
          }
        </svg>
        <span class="toast-message">${message}</span>
      </div>
    `
    document.body.appendChild(toast)

    setTimeout(() => toast.classList.add("show"), 100)
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  const showConfirmDialog = (message, onConfirm) => {
    const overlay = document.createElement("div")
    overlay.className = "modal-overlay"

    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <svg class="modal-icon">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="modal-title">Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <p class="modal-message">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-cancel-btn">Cancelar</button>
          <button class="modal-btn modal-delete-btn">Eliminar</button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    const cancelBtn = overlay.querySelector(".modal-cancel-btn")
    const deleteBtn = overlay.querySelector(".modal-delete-btn")

    cancelBtn.onclick = () => document.body.removeChild(overlay)
    deleteBtn.onclick = () => {
      onConfirm()
      document.body.removeChild(overlay)
    }
    overlay.onclick = (e) => {
      if (e.target === overlay) document.body.removeChild(overlay)
    }
  }

  const handleDelete = (sale) => {
    showConfirmDialog(`¿Confirma la eliminación de "${sale.nombre}"?`, () => {
      setSales((prevSales) => prevSales.filter((s) => s.id !== sale.id))
      showToast("Venta eliminada exitosamente")
      onDeleteSale(sale)
    })
  }

  const handleEdit = (sale) => {
    onEditSale(sale)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const updateSaleLocally = (updatedSale) => {
    setSales((prevSales) => prevSales.map((sale) => (sale.id === updatedSale.id ? updatedSale : sale)))
  }

  useEffect(() => {
    if (onUpdateSale) {
      onUpdateSale(updateSaleLocally)
    }
  }, [onUpdateSale])

  const totalSales = sales.reduce((sum, sale) => sum + sale.precio * sale.cantidad, 0)
  const totalItems = sales.reduce((sum, sale) => sum + sale.cantidad, 0)

  return (
    <div className="sale-list-container">
      <div className="sale-list-header">
        <div className="header-content">
          <div className="header-info">
            <div className="header-icon">
              <svg>
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="header-title">Panel de Ventas</h2>
            <p className="header-subtitle">Gestión integral de transacciones comerciales</p>
          </div>
          <div className="header-actions">
            {sales.length > 0 && (
              <div className="stats-container">
                <div className="stat-badge">
                  {sales.length} registro{sales.length !== 1 ? "s" : ""}
                </div>
                <div className="stat-badge">
                  {totalItems} unidad{totalItems !== 1 ? "es" : ""}
                </div>
                <div className="stat-badge">${totalSales.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</div>
              </div>
            )}
            <button onClick={fetchSales} disabled={isRefreshing} className="refresh-btn">
              <svg className={`refresh-icon ${isRefreshing ? "spinning" : ""}`}>
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="sale-list-content">
        {isLoading ? (
          <div className="loading-container">
            <svg className="loading-icon">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Cargando datos...</span>
          </div>
        ) : sales.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="empty-title">Sin registros de ventas</h3>
            <p className="empty-subtitle">Los datos aparecerán aquí una vez que registres tu primera transacción</p>
          </div>
        ) : (
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th className="table-header text-left">Producto</th>
                  <th className="table-header text-right">Cantidad</th>
                  <th className="table-header text-right">Precio Unit.</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="table-row">
                    <td className="table-cell">
                      <div className="product-name">
                        <svg className="product-icon">
                          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {sale.nombre}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="quantity-badge">{sale.cantidad}</span>
                    </td>
                    <td className="table-cell price-cell">
                      ${typeof sale.precio === "number" ? sale.precio.toFixed(2) : "N/A"}
                    </td>
                    <td className="table-cell total-cell">
                      ${typeof sale.precio === "number" ? (sale.precio * sale.cantidad).toFixed(2) : "N/A"}
                    </td>
                    <td className="table-cell actions-cell">
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(sale)} className="action-btn edit-btn">
                          <svg>
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Editar
                        </button>
                        <button onClick={() => handleDelete(sale)} className="action-btn delete-btn">
                          <svg>
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SaleList
