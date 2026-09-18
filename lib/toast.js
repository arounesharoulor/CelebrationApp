import toast from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export const showToast = {
  success: (message, options = {}) => {
    return toast.custom(
      (t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.25s ease-in-out',
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '10px',
            padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#166534',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-inter), sans-serif',
            maxWidth: '420px',
            zIndex: 99999,
          }}
        >
          <FiCheckCircle style={{ fontSize: '20px', color: '#16A34A', flexShrink: 0 }} />
          <span>{message}</span>
        </div>
      ),
      { duration: 3500, ...options }
    );
  },

  error: (message, options = {}) => {
    return toast.custom(
      (t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.25s ease-in-out',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '10px',
            padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991B1B',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-inter), sans-serif',
            maxWidth: '420px',
            zIndex: 99999,
          }}
        >
          <FiAlertCircle style={{ fontSize: '20px', color: '#DC2626', flexShrink: 0 }} />
          <span>{message}</span>
        </div>
      ),
      { duration: 4500, ...options }
    );
  },

  warning: (message, options = {}) => {
    return toast.custom(
      (t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.25s ease-in-out',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#92400E',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-inter), sans-serif',
            maxWidth: '420px',
            zIndex: 99999,
          }}
        >
          <FiAlertTriangle style={{ fontSize: '20px', color: '#D97706', flexShrink: 0 }} />
          <span>{message}</span>
        </div>
      ),
      { duration: 4000, ...options }
    );
  },

  info: (message, options = {}) => {
    return toast.custom(
      (t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.25s ease-in-out',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#1E40AF',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-inter), sans-serif',
            maxWidth: '420px',
            zIndex: 99999,
          }}
        >
          <FiInfo style={{ fontSize: '20px', color: '#2563EB', flexShrink: 0 }} />
          <span>{message}</span>
        </div>
      ),
      { duration: 3500, ...options }
    );
  },
};
