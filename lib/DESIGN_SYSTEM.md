# 企业级设计系统基础

## 概述

本文档描述了企业级AI聊天平台的设计系统基础实现，包括配色方案、字体系统、组件样式规范和CSS变量系统。

## 实现文件

- `tailwind.config.js` - Tailwind CSS配置，包含企业级配色和字体系统
- `lib/design-tokens.ts` - 设计令牌配置文件
- `lib/enterprise-styles.ts` - 企业级样式指南和组件变体
- `app/globals.css` - 全局CSS样式和CSS变量定义

## 配色系统

### 主色调系统
- **主背景**: `#FEFEFE` (纯白偏暖)
- **次级背景**: `#F8F9FA` (浅灰暖色)
- **卡片背景**: `#FFFFFF` (纯白)
- **边框颜色**: `#E9ECEF` (中性灰)
- **文字主色**: `#212529` (深灰黑)
- **文字次色**: `#6C757D` (中性灰)

### 功能色彩
- **主要操作**: `#0D6EFD` (专业蓝)
- **成功状态**: `#198754` (森林绿)
- **警告状态**: `#FFC107` (琥珀黄)
- **错误状态**: `#DC3545` (砖红色)
- **信息提示**: `#0DCAF0` (天蓝色)

### 暗色主题
所有颜色都有对应的暗色主题适配，保持相同的色彩逻辑，调整明度和饱和度。

## 字体系统

### 字体层级
- **标题1**: 28px/36px, font-weight: 600
- **标题2**: 24px/32px, font-weight: 600
- **标题3**: 20px/28px, font-weight: 500
- **正文大**: 16px/24px, font-weight: 400
- **正文**: 14px/20px, font-weight: 400
- **小字**: 12px/16px, font-weight: 400
- **微字**: 10px/14px, font-weight: 400

### 字体选择
- **中文**: 系统默认字体栈
- **英文/数字**: Inter字体
- **代码**: JetBrains Mono或系统等宽字体

## 图标系统

### 图标尺寸
- **xs**: 16px
- **sm**: 20px
- **md**: 24px (默认)
- **lg**: 32px

### 使用方式
```tsx
// 使用Tailwind类
<Icon className="icon-md" />

// 使用工具函数
<Icon className={generateClasses.icon('lg')} />
```

## 响应式断点

- **移动端**: < 768px
- **平板端**: 768px - 1024px
- **桌面端**: > 1024px
- **大屏端**: > 1440px

## 组件样式规范

### 按钮样式
```css
.btn-enterprise-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90 
         px-4 py-2 rounded-enterprise font-medium transition-colors;
}
```

### 卡片样式
```css
.card-enterprise {
  @apply bg-card text-card-foreground rounded-enterprise border border-border
         shadow-enterprise-sm hover:shadow-enterprise-md transition-shadow;
}
```

### 输入框样式
```css
.input-enterprise {
  @apply flex h-10 w-full rounded-enterprise border border-input bg-background 
         px-3 py-2 text-sm ring-offset-background;
}
```

## 使用示例

### 基础组件使用
```tsx
import { componentVariants, generateClasses } from '@/lib/enterprise-styles';

// 按钮组件
<button className={componentVariants.button.primary}>
  主要操作
</button>

// 卡片组件
<div className={generateClasses.card('elevated', 'lg')}>
  卡片内容
</div>

// 图标组件
<Icon className={generateClasses.icon('md')} />
```

### 设计令牌使用
```tsx
import { designTokens, getColor, getTypography } from '@/lib/design-tokens';

// 获取颜色
const primaryColor = getColor('functional.actionPrimary');

// 获取字体样式
const titleStyle = getTypography('title1');
```

## CSS变量系统

所有颜色都通过CSS变量定义，支持主题切换：

```css
:root {
  --background: 0 0% 99.6%; /* #FEFEFE */
  --foreground: 210 11% 15%; /* #212529 */
  --primary: 213 94% 68%; /* #0D6EFD */
  /* ... 更多变量 */
}

.dark {
  --background: 0 0% 10%; /* #1A1A1A */
  --foreground: 0 0% 100%; /* #FFFFFF */
  /* ... 暗色主题变量 */
}
```

## 最佳实践

1. **一致性**: 始终使用设计令牌中定义的值
2. **可维护性**: 通过工具函数生成类名
3. **可访问性**: 确保颜色对比度符合WCAG 2.1 AA标准
4. **响应式**: 使用定义的断点进行响应式设计
5. **主题支持**: 使用CSS变量确保主题切换正常工作

## 验证测试

运行以下命令验证设计系统：

```bash
npm test lib/__tests__/design-system.test.ts
```

测试覆盖：
- 设计令牌完整性
- 工具函数正确性
- 组件变体定义
- 类名生成功能