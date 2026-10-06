import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PortfolioData, ThemeSettings, SectionVisibility, NavigationItem, ContactMessage } from '../types/portfolio';
import { initialPortfolioData, THEME_PRESETS } from '../data/initialData';
import { useAuth } from './AuthContext';

interface PortfolioContextType {
  data: PortfolioData;
  isLoading: boolean;
  error: string | null;
  saveSection: <K extends keyof PortfolioData>(section: K, value: PortfolioData[K]) => Promise<{ success: boolean; error?: string }>;
  saveAll: (newData: PortfolioData) => Promise<{ success: boolean; error?: string }>;
  applyTheme: (theme: ThemeSettings) => void;
  setPresetTheme: (presetKey: keyof typeof THEME_PRESETS) => Promise<{ success: boolean; error?: string }>;
  updateLocalSection: <K extends keyof PortfolioData>(section: K, value: PortfolioData[K]) => void;
  resetToDefaults: () => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  submitContactForm: (formData: { name: string; email: string; subject: string; message: string }) => Promise<{ success: boolean; error?: string }>;
  markMessageAsRead: (id: string, read?: boolean) => Promise<boolean>;
  deleteContactMessage: (id: string) => Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Helper to adjust color brightness for hover states
function adjustBrightness(col: string, percent: number): string {
  let num = parseInt(col.replace('#', ''), 16);
  if (isNaN(num)) return col;
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<PortfolioData>(initialPortfolioData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Apply CSS variables on DOM
  const applyThemeTokens = useCallback((theme: ThemeSettings) => {
    if (!theme) return;
    const root = document.documentElement;
    const body = document.body;

    const savedPreference = typeof window !== 'undefined' ? localStorage.getItem('mansoor_theme_preference') : null;
    const activeMode = savedPreference || theme.mode || 'dark';

    // Determine effective mode: 'dark' or 'light'
    let isDark = true;
    if (activeMode === 'light') {
      isDark = false;
    } else if (activeMode === 'system') {
      isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = true;
    }

    const setVar = (key: string, val: string) => {
      root.style.setProperty(key, val);
      if (body) body.style.setProperty(key, val);
    };

    if (!isDark) {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';

      // Light mode tokens with high legibility
      const primary = theme.primaryColor || '#0891B2';
      const secondary = theme.secondaryColor || '#2563EB';
      const bg = '#F8FAFC';
      const bgSecondary = '#EDF2F7';
      const card = '#FFFFFF';
      const cardHover = '#F1F5F9';
      const text = '#0B0F19';
      const textMuted = '#475569';
      const border = '#E2E8F0';

      setVar('--color-primary', primary);
      setVar('--color-primary-hover', adjustBrightness(primary, -15));
      setVar('--color-secondary', secondary);
      setVar('--color-secondary-hover', adjustBrightness(secondary, -15));
      setVar('--color-bg', bg);
      setVar('--color-bg-secondary', bgSecondary);
      setVar('--color-card', card);
      setVar('--color-card-hover', cardHover);
      setVar('--color-text', text);
      setVar('--color-text-muted', textMuted);
      setVar('--color-border', border);
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';

      // Dark mode tokens
      const primary = theme.primaryColor || '#22D3EE';
      const secondary = theme.secondaryColor || '#3B82F6';
      const bg = theme.backgroundColor || '#080B12';
      const bgSecondary = theme.backgroundSecondaryColor || '#0D111C';
      const card = theme.cardColor || '#111827';
      const cardHover = theme.cardColor ? adjustBrightness(theme.cardColor, 10) : '#172033';
      const text = theme.textColor || '#F8FAFC';
      const textMuted = theme.mutedTextColor || '#94A3B8';
      const border = theme.borderColor || '#1E293B';

      setVar('--color-primary', primary);
      setVar('--color-primary-hover', adjustBrightness(primary, -12));
      setVar('--color-secondary', secondary);
      setVar('--color-secondary-hover', adjustBrightness(secondary, -12));
      setVar('--color-bg', bg);
      setVar('--color-bg-secondary', bgSecondary);
      setVar('--color-card', card);
      setVar('--color-card-hover', cardHover);
      setVar('--color-text', text);
      setVar('--color-text-muted', textMuted);
      setVar('--color-border', border);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = isAuthenticated && token ? '/api/portfolio/admin' : '/api/portfolio';
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const json = await res.json();
        setData((prev) => ({
          ...initialPortfolioData,
          ...prev,
          ...json,
          contactMessages: json.contactMessages ?? prev.contactMessages ?? initialPortfolioData.contactMessages ?? [],
          media: json.media ?? prev.media ?? initialPortfolioData.media ?? [],
          projects: json.projects ?? prev.projects ?? initialPortfolioData.projects ?? [],
          research: json.research ?? prev.research ?? initialPortfolioData.research ?? [],
          skills: json.skills ?? prev.skills ?? initialPortfolioData.skills ?? [],
        }));
        if (json.theme) {
          applyThemeTokens(json.theme);
        }
        setError(null);
      } else {
        const errorMsg = `Server response error (${res.status}): Failed to load portfolio`;
        console.warn(errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error connecting to backend';
      console.warn('Backend temporarily unreachable, preserving current portfolio state:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, applyThemeTokens]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply theme tokens on initial load or theme change
  useEffect(() => {
    if (data.theme) {
      applyThemeTokens(data.theme);
    }
  }, [data.theme, applyThemeTokens]);

  // Listen to OS system color scheme updates when mode is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const savedPref = localStorage.getItem('mansoor_theme_preference');
      const activeMode = savedPref || data.theme?.mode;
      if (activeMode === 'system') {
        applyThemeTokens({ ...data.theme, mode: 'system' });
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [data.theme, applyThemeTokens]);

  // Save single section to backend
  const saveSection = async <K extends keyof PortfolioData>(section: K, value: PortfolioData[K]) => {
    // Optimistic local update
    setData((prev) => {
      const next = { ...prev, [section]: value };
      if (section === 'theme') {
        applyThemeTokens(value as ThemeSettings);
      }
      return next;
    });

    if (!token) {
      return { success: false, error: 'Authentication required to save changes' };
    }

    try {
      const res = await fetch(`/api/portfolio/${String(section)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(value),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Failed to save section' }));
        return { success: false, error: errJson.error || 'Failed to save section' };
      }

      const updated = await res.json().catch(() => null);
      if (updated && typeof updated === 'object') {
        setData((prev) => ({
          ...prev,
          ...updated,
          contactMessages: updated.contactMessages ?? prev.contactMessages ?? [],
          media: updated.media ?? prev.media ?? [],
          projects: updated.projects ?? prev.projects ?? [],
          research: updated.research ?? prev.research ?? [],
          skills: updated.skills ?? prev.skills ?? [],
        }));
        if (updated.theme) {
          applyThemeTokens(updated.theme);
        }
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving section' };
    }
  };

  // Save entire portfolio
  const saveAll = async (newData: PortfolioData) => {
    setData((prev) => ({
      ...newData,
      contactMessages: newData.contactMessages ?? prev.contactMessages ?? [],
    }));
    applyThemeTokens(newData.theme);

    if (!token) return { success: false, error: 'Authentication required' };

    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData),
      });

      if (!res.ok) {
        const errJson = await res.json();
        return { success: false, error: errJson.error || 'Failed to save portfolio' };
      }

      const updated = await res.json();
      setData(updated);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const applyTheme = (theme: ThemeSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mansoor_theme_preference', theme.mode);
    }
    applyThemeTokens(theme);
    setData((prev) => ({ ...prev, theme }));
  };

  const setPresetTheme = async (presetKey: keyof typeof THEME_PRESETS) => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return { success: false, error: 'Preset not found' };

    const newTheme: ThemeSettings = {
      ...data.theme,
      ...preset.colors,
      activePreset: presetKey as any,
    };

    return await saveSection('theme', newTheme);
  };

  const updateLocalSection = <K extends keyof PortfolioData>(section: K, value: PortfolioData[K]) => {
    setData((prev) => {
      const next = { ...prev, [section]: value };
      if (section === 'theme') {
        applyThemeTokens(value as ThemeSettings);
      }
      return next;
    });
  };

  const resetToDefaults = async () => {
    if (!token) return { success: false, error: 'Authentication required' };

    try {
      const res = await fetch('/api/portfolio/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.portfolio);
        applyThemeTokens(json.portfolio.theme);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to reset data' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const submitContactForm = async (formData: { name: string; email: string; subject: string; message: string }) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to dispatch inquiry' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const markMessageAsRead = async (id: string, read: boolean = true) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/contact-messages/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ read }),
      });
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          contactMessages: prev.contactMessages.map((m) => (m.id === id ? { ...m, read } : m)),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteContactMessage = async (id: string) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          contactMessages: prev.contactMessages.filter((m) => m.id !== id),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        isLoading,
        error,
        saveSection,
        saveAll,
        applyTheme,
        setPresetTheme,
        updateLocalSection,
        resetToDefaults,
        refreshData: fetchData,
        submitContactForm,
        markMessageAsRead,
        deleteContactMessage,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
