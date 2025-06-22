"use client"

import { useState } from "react"
import axios from "axios"
import "./SaleForm.css"

function SaleForm({ onSaveComplete }) {
  const [nombre, setNombre] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [precio, setPrecio] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await axios.post("https://mmtkdj1aj0.execute-api.us-east-1.amazonaws.com/lab/postsales", {
        nombre,
        cantidad: Number(cantidad),
        precio: Number(precio),
      })
      showToast("Venta registrada exitosamente")
      if (typeof onSaveComplete === "function") {
        onSaveComplete(null, "create")
      }
      setNombre("")
      setCantidad(1)
      setPrecio(0)
    } catch (error) {
      console.error("Error:", error)
      showToast("Error al registrar la venta", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sale-form-container">
      <div className="sale-form-header">
        <div className="sale-form-icon">
          <svg>
            <path d="M12 5v14m7-7H5" />
          </svg>
        </div>
        <h2 className="sale-form-title">Nueva Venta</h2>
        <p className="sale-form-subtitle">Registra una nueva transacción en el sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="sale-form">
        <div className="form-group">
          <label className="form-label">Producto</label>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            disabled={isSubmitting}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            placeholder="Unidades vendidas"
            value={cantidad}
            min={1}
            onChange={(e) => setCantidad(Number(e.target.value))}
            required
            disabled={isSubmitting}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Precio Unitario</label>
          <input
            type="number"
            placeholder="Precio por unidad"
            value={precio}
            min={0}
            step="0.01"
            onChange={(e) => setPrecio(Number(e.target.value))}
            required
            disabled={isSubmitting}
            className="form-input"
          />
        </div>

        <div className="button-group">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? (
              <>
                <svg className="btn-icon spinning">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg className="btn-icon">
                  <path d="M12 5v14m7-7H5" />
                </svg>
                Registrar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SaleForm
