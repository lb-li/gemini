/**
 * Design System Validation Tests
 * Ensures the enterprise design system foundation is properly implemented
 */

import { designTokens, getColor, getTypography, getSpacing } from '../design-tokens';
import { componentVariants, generateClasses } from '../enterprise-styles';

describe('Enterprise Design System Foundation', () => {
  describe('Design Tokens', () => {
    test('should have all required color tokens', () => {
      expect(designTokens.colors.main.bgPrimary).toBe('#FEFEFE');
      expect(designTokens.colors.main.bgSecondary).toBe('#F8F9FA');
      expect(designTokens.colors.main.bgCard).toBe('#FFFFFF');
      expect(designTokens.colors.main.border).toBe('#E9ECEF');
      expect(designTokens.colors.main.textPrimary).toBe('#212529');
      expect(designTokens.colors.main.textSecondary).toBe('#6C757D');
    });

    test('should have all required functional colors', () => {
      expect(designTokens.colors.functional.actionPrimary).toBe('#0D6EFD');
      expect(designTokens.colors.functional.success).toBe('#198754');
      expect(designTokens.colors.functional.warning).toBe('#FFC107');
      expect(designTokens.colors.functional.error).toBe('#DC3545');
      expect(designTokens.colors.functional.info).toBe('#0DCAF0');
    });

    test('should have proper typography system', () => {
      expect(designTokens.typography.fontSize.title1.size).toBe('28px');
      expect(designTokens.typography.fontSize.title1.lineHeight).toBe('36px');
      expect(designTokens.typography.fontSize.title1.weight).toBe('600');
      
      expect(designTokens.typography.fontSize.body.size).toBe('14px');
      expect(designTokens.typography.fontSize.body.lineHeight).toBe('20px');
      expect(designTokens.typography.fontSize.body.weight).toBe('400');
    });

    test('should have icon sizes defined', () => {
      expect(designTokens.iconSizes.xs).toBe('16px');
      expect(designTokens.iconSizes.sm).toBe('20px');
      expect(designTokens.iconSizes.md).toBe('24px');
      expect(designTokens.iconSizes.lg).toBe('32px');
    });

    test('should have responsive breakpoints', () => {
      expect(designTokens.breakpoints.mobile).toBe('768px');
      expect(designTokens.breakpoints.tablet).toBe('1024px');
      expect(designTokens.breakpoints.desktop).toBe('1440px');
    });
  });

  describe('Utility Functions', () => {
    test('getColor should work correctly', () => {
      expect(getColor('main.bgPrimary')).toBe('#FEFEFE');
      expect(getColor('functional.actionPrimary')).toBe('#0D6EFD');
    });

    test('getTypography should work correctly', () => {
      const title1 = getTypography('title1');
      expect(title1.size).toBe('28px');
      expect(title1.lineHeight).toBe('36px');
      expect(title1.weight).toBe('600');
    });

    test('getSpacing should work correctly', () => {
      expect(getSpacing('md')).toBe('12px');
      expect(getSpacing('lg')).toBe('16px');
    });
  });

  describe('Component Variants', () => {
    test('should have button variants', () => {
      expect(componentVariants.button.primary).toBe('btn-enterprise-primary');
      expect(componentVariants.button.secondary).toBe('btn-enterprise-secondary');
    });

    test('should have card variants', () => {
      expect(componentVariants.card.default).toBe('card-enterprise');
      expect(componentVariants.card.elevated).toBe('card-enterprise shadow-enterprise-md');
    });

    test('should have typography variants', () => {
      expect(componentVariants.typography.h1).toBe('text-title-1 font-semibold tracking-tight');
      expect(componentVariants.typography.body).toBe('text-body');
    });

    test('should have icon variants', () => {
      expect(componentVariants.icon.xs).toBe('icon-xs');
      expect(componentVariants.icon.md).toBe('icon-md');
      expect(componentVariants.icon.lg).toBe('icon-lg');
    });
  });

  describe('Class Generation', () => {
    test('should generate button classes correctly', () => {
      const primaryButton = generateClasses.button('primary', 'md');
      expect(primaryButton).toContain('btn-enterprise-primary');
      expect(primaryButton).toContain('px-4 py-2 text-sm');
    });

    test('should generate card classes correctly', () => {
      const elevatedCard = generateClasses.card('elevated', 'lg');
      expect(elevatedCard).toContain('card-enterprise shadow-enterprise-md');
      expect(elevatedCard).toContain('p-8');
    });

    test('should generate icon classes correctly', () => {
      expect(generateClasses.icon('xs')).toBe('icon-xs');
      expect(generateClasses.icon('lg')).toBe('icon-lg');
    });
  });
});