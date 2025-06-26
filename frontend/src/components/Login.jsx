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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);
      if (response.status === 200) {
        const data = await response.json();
        login(data.user);
        navigate("/dashboard");  // Redirigir a dashboard
      } else {
        setError("Credenciales incorrectas");
      }
    } catch {
      setError("Error en la conexión");
    }
  };

  return (
  <form className="login-form" onSubmit={handleSubmit}>
    <input
      type="email"
      placeholder="Correo"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Contraseña"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button type="submit">Ingresar</button>
    {error && <p>{error}</p>}
  </form>
);
};

export default Login;
