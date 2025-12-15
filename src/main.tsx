import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/crm/ProtectedRoute'
import { CRMLayout } from './components/crm/Layout'
import App from './App.tsx'
import {
  LoginPage,
  DashboardPage,
  CarsPage,
  CarFormPage,
  CarDetailPage,
  ServiceFormPage,
  CompaniesPage,
  CustomersPage,
  PaymentsPage,
  SettingsPage,
} from './pages/crm'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<App />} />
          
          {/* CRM Auth */}
          <Route path="/crm/login" element={<LoginPage />} />
          
          {/* Protected CRM Routes */}
          <Route path="/crm" element={
            <ProtectedRoute>
              <CRMLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="cars" element={<CarsPage />} />
            <Route path="cars/new" element={<CarFormPage />} />
            <Route path="cars/:id" element={<CarDetailPage />} />
            <Route path="cars/:id/edit" element={<CarFormPage />} />
            <Route path="service/new" element={<ServiceFormPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
