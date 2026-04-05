/**
 * @file Auth.jsx
 * @description Componente de autenticación modernizado 2026.
 * Coherente con el design system de App.css — tokens CSS, microinteracciones
 * y animaciones fluidas. Mantiene toda la seguridad implementada.
 * @author Marcelo Suárez
 * @date 2026-04-02
 */

import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Eye, EyeOff, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react'

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
          email, password,
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

  const strengthLevel = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Débil', 'Media', 'Fuerte'][strengthLevel]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'][strengthLevel]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #080B14 0%, #0F172A 100%);
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          padding: 24px 16px;
          overflow-y: auto;
          position: relative;
        }

        /* Fondo coherente con App.css */
        .auth-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(ellipse at 15% 15%, rgba(99,102,241,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 85%, rgba(124,58,237,0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* Grid sutil */
        .auth-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          z-index: 0;
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 36px 36px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 64px rgba(0,0,0,0.5),
            0 0 80px rgba(99,102,241,0.06);
          animation: authIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes authIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo */
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .auth-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #7C3AED, #6366F1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(124,58,237,0.4);
        }

        .auth-logo-text {
          font-size: 17px;
          font-weight: 700;
          color: #F1F5F9;
          letter-spacing: -0.3px;
        }

        /* Título */
        .auth-title {
          font-size: 24px;
          font-weight: 700;
          color: #F1F5F9;
          letter-spacing: -0.4px;
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .auth-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 28px;
          font-weight: 400;
          line-height: 1.5;
        }

        /* Mensajes */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 11px 14px;
          color: #FCA5A5;
          font-size: 13px;
          margin-bottom: 16px;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-5px); }
          40%      { transform: translateX(5px); }
          60%      { transform: translateX(-3px); }
          80%      { transform: translateX(3px); }
        }

        .auth-success {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 10px;
          padding: 11px 14px;
          color: #6EE7B7;
          font-size: 13px;
          margin-bottom: 16px;
        }

        /* Campos */
        .auth-field { margin-bottom: 14px; }

        .auth-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .auth-input-wrap { position: relative; }

        .auth-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #F1F5F9;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14.5px;
          outline: none;
          transition: all 0.2s;
        }

        .auth-input::placeholder { color: rgba(255,255,255,0.2); }

        .auth-input:focus {
          border-color: rgba(124,58,237,0.7);
          background: rgba(124,58,237,0.06);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }

        .auth-input.has-toggle { padding-right: 46px; }

        .auth-toggle-pass {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.25);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
        }

        .auth-toggle-pass:hover {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.06);
        }

        /* Fortaleza de contraseña */
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

        .strength-label {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 5px;
          text-align: right;
          transition: color 0.3s;
        }

        /* Botón principal */
        .auth-btn {
          width: 100%;
          padding: 14px;
          margin-top: 10px;
          background: linear-gradient(135deg, #7C3AED, #6366F1);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.2px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          position: relative;
          overflow: hidden;
        }

        .auth-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.15s;
        }

        .auth-btn:hover::after { background: rgba(255,255,255,0.08); }
        .auth-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,58,237,0.45); }
        .auth-btn:active { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Switch modo */
        .auth-switch {
          text-align: center;
          margin-top: 20px;
          font-size: 13.5px;
          color: rgba(255,255,255,0.28);
        }

        .auth-switch-btn {
          background: none;
          border: none;
          color: #818CF8;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
          margin-left: 4px;
        }

        .auth-switch-btn:hover { color: #A5B4FC; }

        /* Términos */
        .auth-terms {
          font-size: 11.5px;
          color: rgba(255,255,255,0.18);
          text-align: center;
          margin-top: 14px;
          line-height: 1.6;
        }

        /* Footer */
        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 11px;
          color: rgba(255,255,255,0.1);
          letter-spacing: 0.3px;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .auth-card { padding: 32px 22px 28px; border-radius: 20px; }
          .auth-title { font-size: 21px; }
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-card">

          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <ClipboardList size={20} color="white" />
            </div>
            <span className="auth-logo-text">Task Manager</span>
          </div>

          {/* Título */}
          <h1 className="auth-title">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Ingresa tus credenciales para continuar'
              : 'Únete y empieza a organizar tu día'}
          </p>

          {/* Mensajes */}
          {error && (
            <div className="auth-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          {message && (
            <div className="auth-success">
              <CheckCircle2 size={14} />
              {message}
            </div>
          )}

          {/* Nombre — solo en registro */}
          {!isLogin && (
            <div className="auth-field">
              <label className="auth-label">Nombre completo</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
              />
            </div>
          )}

          {/* Email */}
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

          {/* Contraseña */}
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
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Indicador de fortaleza solo en registro */}
            {!isLogin && password.length > 0 && (
              <>
                <div className="password-strength">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="strength-bar"
                      style={{ background: strengthLevel >= i ? strengthColor : undefined }}
                    />
                  ))}
                </div>
                <p className="strength-label" style={{ color: strengthColor }}>
                  {strengthLabel}
                </p>
              </>
            )}
          </div>

          {/* Confirmar contraseña — solo en registro */}
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

          {/* Botón */}
          <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta gratis'}
          </button>

          {!isLogin && (
            <p className="auth-terms">
              Al registrarte aceptas usar esta app con fines personales.
            </p>
          )}

          {/* Switch */}
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