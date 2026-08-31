/**
 * useAdminPermissions — permission-aware frontend support (Part 21).
 *
 * Fetches the authenticated admin's server-side permission set from
 * /admin/system/me and exposes `has(permission)`. This drives UI visibility
 * ONLY; the backend remains the security authority.
 */
import { useCallback, useEffect, useState } from "react";
import { getAdminProfile, type AdminProfile } from "@/services/adminApi";

let cache: AdminProfile | null = null;

export function useAdminPermissions() {
  const [profile, setProfile] = useState<AdminProfile | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    if (cache) return;
    (async () => {
      try {
        const p = await getAdminProfile();
        cache = p;
        if (mounted) setProfile(p);
      } catch (e: any) {
        if (mounted) setError(e?.response?.data?.message || "Failed to load permissions");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** True only when the backend explicitly granted this granular permission. */
  const has = useCallback(
    (permission: string): boolean => {
      if (!profile) return false;
      if (profile.isSuperAdmin) return true;
      return profile.permissions.includes(permission);
    },
    [profile],
  );

  return { profile, has, loading, error };
}

/** Clear the cached profile (call on logout / account switch). */
export function resetAdminPermissionsCache() {
  cache = null;
}
