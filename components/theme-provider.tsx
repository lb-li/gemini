"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// 企业级主题配置
export interface EnterpriseThemeConfig {
  theme: 'light' | 'dark' | 'system'
  accentColor?: string
  fontSize?: 'compact' | 'comfortable' | 'spacious'
  reducedMotion?: boolean
}

// 企业级主题上下文
interface EnterpriseThemeContextType {
  config: EnterpriseThemeConfig
  updateConfig: (config: Partial<EnterpriseThemeConfig>) => void
  resetToDefaults: () => void
}

const EnterpriseThemeContext = React.createContext<EnterpriseThemeContextType | undefined>(undefined)

// 默认企业级主题配置
const defaultConfig: EnterpriseThemeConfig = {
  theme: 'system',
  accentColor: '#0D6EFD',
  fontSize: 'comfortable',
  reducedMotion: false,
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [config, setConfig] = React.useState<EnterpriseThemeConfig>(defaultConfig)

  // 从 localStorage 加载配置
  React.useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('enterprise-theme-config')
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig({ ...defaultConfig, ...parsedConfig })
      }
    } catch (error) {
      console.warn('Failed to load theme configuration:', error)
    }
  }, [])

  // 保存配置到 localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('enterprise-theme-config', JSON.stringify(config))
    } catch (error) {
      console.warn('Failed to save theme configuration:', error)
    }
  }, [config])

  // 应用字体大小配置
  React.useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-font-size', config.fontSize)
  }, [config.fontSize])

  // 应用减少动画配置
  React.useEffect(() => {
    const root = document.documentElement
    if (config.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s')
      root.style.setProperty('--transition-duration', '0s')
    } else {
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
    }
  }, [config.reducedMotion])

  const updateConfig = React.useCallback((newConfig: Partial<EnterpriseThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  const resetToDefaults = React.useCallback(() => {
    setConfig(defaultConfig)
  }, [])

  const contextValue = React.useMemo(() => ({
    config,
    updateConfig,
    resetToDefaults,
  }), [config, updateConfig, resetToDefaults])

  return (
    <NextThemesProvider 
      {...props}
      defaultTheme={config.theme}
      enableSystem
      disableTransitionOnChange={config.reducedMotion}
      storageKey="enterprise-theme"
    >
      <EnterpriseThemeContext.Provider value={contextValue}>
        {children}
      </EnterpriseThemeContext.Provider>
    </NextThemesProvider>
  )
}

// 企业级主题钩子
export function useEnterpriseTheme() {
  const context = React.useContext(EnterpriseThemeContext)
  if (context === undefined) {
    throw new Error('useEnterpriseTheme must be used within a ThemeProvider')
  }
  return context
}

// 主题切换钩子 - 兼容现有代码
export { useTheme } from "next-themes"
