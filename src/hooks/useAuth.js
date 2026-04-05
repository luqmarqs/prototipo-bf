/**
 * Thin wrapper around useAdminAuth exposing the simplified useAuth interface.
 * Returns { user, loading, isAdmin } for use in components that only need auth context.
 */
import { useAdminAuth } from './useAdminAuth'

export function useAuth() {
  const { user, loading, isAdmin } = useAdminAuth()
  return { user, loading, isAdmin }
}
