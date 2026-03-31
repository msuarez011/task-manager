/**
 * @file Auth.jsx
 * @description Componente de autenticación con diseño moderno 2026.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Eye, EyeOff } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin]         = useState(true)
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [name, setName]               = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [message, setMessage]         = useState('')
  const [showPass, setShowPass]       = useState(false)

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    if (!email || !password) return setError('Completa todos los campos.')
    if (!email.includes('@')) return setError('Ingresa un correo válido.')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (!isLogin && !name.trim()) return setError('Ingresa tu nombre.')
    if (!isLogin && password !== confirmPassword) return setError('Las contraseñas no coinciden.')

    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() } }
        })
        if (error) throw error
        setMessage('¡Cuenta creada! Ya puedes iniciar sesión.')
        setIsLogin(true)
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Invalid login')) setError('Correo o contraseña incorrectos.')
      else if (msg.includes('already registered')) setError('Este correo ya está registrado.')
      else if (msg.includes('not confirmed')) setError('Confirma tu correo antes de iniciar sesión.')
      else setError(msg || 'Error de autenticación.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setMessage('')
    setEmail('')
    setPassword('')
    setConfirm('')
    setName('')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080810;
          font-family: 'DM Sans', sans-serif;
          padding: 20px;
        }

        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .auth-bg::before {
          content: '';
          position: absolute;
          top: -30%;
          left: -20%;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          animation: drift1 12s ease-in-out infinite alternate;
        }

        .auth-bg::after {
          content: '';
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%);
          animation: drift2 15s ease-in-out infinite alternate;
        }

        @keyframes drift1 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(60px,40px) scale(1.1); }
        }

        @keyframes drift2 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-40px,-60px) scale(1.15); }
        }

        .auth-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 0;
          pointer-events: none;
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 44px 36px;
          backdrop-filter: blur(20px);
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .auth-logo-icon {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .auth-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .auth-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
          text-transform: none;
        }

        .auth-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 28px;
          font-weight: 300;
        }

        .auth-field {
          margin-bottom: 16px;
        }

        .auth-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .auth-input-wrap { position: relative; }

        .auth-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }

        .auth-input::placeholder { color: rgba(255,255,255,0.2); }

        .auth-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .auth-input.has-toggle { padding-right: 48px; }

        .auth-toggle-pass {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          font-size: 16px;
          transition: color 0.2s;
          padding: 4px;
        }

        .auth-toggle-pass:hover { color: rgba(255,255,255,0.7); }

        .password-strength {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }

        .strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s;
        }

        .strength-bar.weak   { background: #ef4444; }
        .strength-bar.medium { background: #f59e0b; }
        .strength-bar.strong { background: #10b981; }

        .strength-label {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 4px;
          text-align: right;
        }

        .auth-btn {
          width: 100%;
          padding: 14px;
          margin-top: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }

        .auth-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }
        .auth-btn:active { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .auth-switch {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: rgba(255,255,255,0.3);
        }

        .auth-switch-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
          margin-left: 4px;
        }

        .auth-switch-btn:hover { color: #a5b4fc; }

        .auth-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .auth-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          color: #86efac;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .auth-terms {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          text-align: center;
          margin-top: 16px;
          line-height: 1.5;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 11px;
          color: rgba(255,255,255,0.12);
        }

        @media (max-width: 480px) {
          .auth-card { padding: 36px 24px; }
          .auth-title { font-size: 22px; }
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-bg" />
        <div className="auth-grid" />

        <div className="auth-card">

          <div className="auth-logo">
            <div className="auth-logo-icon">📝</div>
            <span className="auth-logo-text">Task Manager</span>
          </div>

          <h1 className="auth-title">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Ingresa tus credenciales para continuar'
              : 'Únete y empieza a organizar tu día'}
          </p>

          {error   && <div className="auth-error">⚠️ {error}</div>}
          {message && <div className="auth-success">✅ {message}</div>}

          {!isLogin && (
            <div className="auth-field">
              <label className="auth-label">Nombre completo</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Tu nombre Completo"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Correo electrónico</label>
            <input
              className="auth-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input has-toggle"
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
              />
              <button
                className="auth-toggle-pass"
                onClick={() => setShowPass(!showPass)}
                type="button"
                aria-label="Mostrar contraseña"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && password.length > 0 && (
              <>
                <div className="password-strength">
                  <div className={`strength-bar ${password.length >= 1 ? (password.length < 6 ? 'weak' : password.length < 10 ? 'medium' : 'strong') : ''}`} />
                  <div className={`strength-bar ${password.length >= 6 ? (password.length < 10 ? 'medium' : 'strong') : ''}`} />
                  <div className={`strength-bar ${password.length >= 10 ? 'strong' : ''}`} />
                </div>
                <p className="strength-label">
                  {password.length < 6 ? 'Débil' : password.length < 10 ? 'Media' : 'Fuerte'}
                </p>
              </>
            )}
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label className="auth-label">Confirmar contraseña</label>
              <input
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => { setConfirm(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
              />
            </div>
          )}

          <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta gratis'}
          </button>

          {!isLogin && (
            <p className="auth-terms">
              Al registrarte aceptas usar esta app con fines personales.
            </p>
          )}

          {/* Link para cambiar modo — abajo del botón */}
          <div className="auth-switch">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button className="auth-switch-btn" onClick={switchMode}>
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </div>

          <p className="auth-footer">Task Manager v1.0</p>
        </div>
      </div>
    </>
  )
}