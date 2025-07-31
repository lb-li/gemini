/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { EnterpriseIcon } from '../icon-component'
import { IconMap } from '../index'

// Mock Next.js theme provider
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' })
}))

describe('Enterprise Icon System', () => {
  test('renders icon component with correct name', () => {
    render(<EnterpriseIcon name="search" data-testid="search-icon" />)
    const icon = screen.getByTestId('search-icon')
    expect(icon).toBeInTheDocument()
  })

  test('applies correct size classes', () => {
    const { container } = render(<EnterpriseIcon name="search" size="lg" />)
    const iconWrapper = container.querySelector('.h-6.w-6')
    expect(iconWrapper).toBeInTheDocument()
  })

  test('applies correct variant classes', () => {
    const { container } = render(<EnterpriseIcon name="search" variant="primary" />)
    const iconWrapper = container.querySelector('.text-primary')
    expect(iconWrapper).toBeInTheDocument()
  })

  test('handles invalid icon names gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    const { container } = render(<EnterpriseIcon name="invalid-icon" as any />)
    
    expect(consoleSpy).toHaveBeenCalledWith('Icon "invalid-icon" not found in IconMap')
    expect(container.firstChild).toBeNull()
    
    consoleSpy.mockRestore()
  })

  test('IconMap contains all expected icons', () => {
    const expectedIcons = [
      'search', 'send', 'add', 'delete', 'settings',
      'chat', 'message', 'bot', 'user',
      'attach', 'file', 'document', 'image',
      'loading', 'success', 'warning', 'error',
      'analytics', 'chart', 'statistics'
    ]

    expectedIcons.forEach(iconName => {
      expect(IconMap).toHaveProperty(iconName)
      expect(IconMap[iconName as keyof typeof IconMap]).toBeDefined()
    })
  })

  test('custom icons render correctly', () => {
    const customIcons = ['chat', 'analytics', 'document', 'statistics']
    
    customIcons.forEach(iconName => {
      const { container } = render(<EnterpriseIcon name={iconName as any} />)
      const svgElement = container.querySelector('svg')
      expect(svgElement).toBeInTheDocument()
      expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svgElement).toHaveAttribute('stroke', 'currentColor')
      expect(svgElement).toHaveAttribute('strokeWidth', '2')
    })
  })

  test('emoji replacement mapping works', () => {
    const emojiMappings = [
      { emoji: '💬', iconName: 'chat' },
      { emoji: '📄', iconName: 'document' },
      { emoji: '🔍', iconName: 'search' },
      { emoji: '📊', iconName: 'statistics' }
    ]

    emojiMappings.forEach(({ emoji, iconName }) => {
      expect(IconMap[emoji as keyof typeof IconMap]).toBeDefined()
      expect(IconMap[iconName as keyof typeof IconMap]).toBeDefined()
    })
  })
})