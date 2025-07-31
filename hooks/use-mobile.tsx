import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1440

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'large'
export type ViewMode = 'compact' | 'comfortable' | 'spacious'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = React.useState<ScreenSize>('desktop')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setScreenSize('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setScreenSize('tablet')
      } else if (width < DESKTOP_BREAKPOINT) {
        setScreenSize('desktop')
      } else {
        setScreenSize('large')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}

export function useResponsiveLayout() {
  const screenSize = useScreenSize()
  const [viewMode, setViewMode] = React.useState<ViewMode>('comfortable')

  const isMobile = screenSize === 'mobile'
  const isTablet = screenSize === 'tablet'
  const isDesktop = screenSize === 'desktop' || screenSize === 'large'
  const isLargeScreen = screenSize === 'large'

  // Auto-adjust view mode based on screen size
  React.useEffect(() => {
    if (screenSize === 'mobile') {
      setViewMode('compact')
    } else if (screenSize === 'tablet') {
      setViewMode('comfortable')
    } else {
      setViewMode('spacious')
    }
  }, [screenSize])

  return {
    screenSize,
    viewMode,
    setViewMode,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    breakpoints: {
      mobile: MOBILE_BREAKPOINT,
      tablet: TABLET_BREAKPOINT,
      desktop: DESKTOP_BREAKPOINT,
    }
  }
}
