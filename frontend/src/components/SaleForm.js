"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./SaleForm.css"

function SaleForm({ editingSale, onSaveComplete, onCancelEdit }) {
  const [nombre, setNombre] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [precio, setPrecio] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingSale) {
      setNombre(editingSale.nombre)
      setCantidad(editingSale.cantidad)
      setPrecio(editingSale.precio)
    } else {
      setNombre("")
      setCantidad(1)
      setPrecio(0)
    }
  }, [editingSale])

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
      if (editingSale) {
        const updatedSale = {
          ...editingSale,
          nombre,
          cantidad: Number(cantidad),
          precio: Number(precio),
        }
        onSaveComplete(updatedSale, "update")
        showToast("Venta actualizada exitosamente")
      } else {
        await axios.post("https://mmtkdj1aj0.execute-api.us-east-1.amazonaws.com/lab/postsales", {
          nombre,
          cantidad: Number(cantidad),
          precio: Number(precio),
        })
        showToast("Venta registrada exitosamente")
        onSaveComplete(null, "create")
      }

      setNombre("")
      setCantidad(1)
      setPrecio(0)
    } catch (error) {
      console.error("Error:", error)
      showToast("Error al procesar la venta", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setNombre("")
    setCantidad(1)
    setPrecio(0)
    onCancelEdit()
  }

  const isEditing = !!editingSale

  return (
    <div className={`sale-form-container ${isEditing ? "editing" : ""}`}>
      <div className={`sale-form-header ${isEditing ? "editing" : ""}`}>
        <div className="sale-form-icon">
          <svg>
            {isEditing ? (
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            ) : (
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            )}
          </svg>
        </div>
        <h2 className="sale-form-title">{isEditing ? "Editar Venta" : "Nueva Venta"}</h2>
        <p className="sale-form-subtitle">
          {isEditing
            ? "Actualiza los detalles de la venta seleccionada"
            : "Registra una nueva transacción en el sistema"}
        </p>
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
            className={`form-input ${isEditing ? "editing" : ""}`}
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
            className={`form-input ${isEditing ? "editing" : ""}`}
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
            className={`form-input ${isEditing ? "editing" : ""}`}
          />
        </div>

        <div className="button-group">
          {isEditing && (
            <button type="button" onClick={handleCancel} disabled={isSubmitting} className="btn btn-cancel">
              <svg className="btn-icon">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className={`btn btn-primary ${isEditing ? "editing" : ""}`}>
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
                  {isEditing ? (
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8" />
                  ) : (
                    <path d="M12 5v14m7-7H5" />
                  )}
                </svg>
                {isEditing ? "Actualizar" : "Registrar"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SaleForm
