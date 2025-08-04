import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { loginUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css"; 

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);
      if (response.status === 200) {
        const data = await response.json();
        login(data.user);
        navigate("/dashboard");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch {
      setError("Error en la conexión");
    }
  };

  return (
    <div className="login-container">
      {/* Logo circular naranja */}
      <div className="logo-container">
        <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H17M9 19.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM20 19.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
          />
        </svg>
      </div>

      {/* Título principal */}
      <h1 className="main-title">VentasManager</h1>
      <p className="subtitle">Gestiona tu negocio de manera inteligente</p>

      {/* Formulario de login */}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Correo Electrónico</label>
          <div className="input-container">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="login-button">
          Ingresar
        </button>

        {error && (
          <div className="error-message">
            <span>⚠</span>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;