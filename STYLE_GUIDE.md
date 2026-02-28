# TravelBuddy Mobile - UI Style Guide

> **AI Model Instructions:** This document defines the exact visual style, colors, typography, and component patterns for the TravelBuddy mobile app. ALWAYS follow these specifications when generating UI code.

---

## 🎨 Color System

### Brand Colors (Primary - Gold/Yellow)

Use for primary actions, highlights, and brand elements.

```typescript
export const BrandColors = {
  // Dark Shades
  dark900: '#9B872F',
  dark800: '#A5983C',
  dark700: '#B2A43E',
  dark600: '#C3B329',
  
  // Base Brand
  default: '#FCD240',  // Main brand color
  
  // Light Shades  
  light400: '#E8B837',
  light300: '#EFCF70',
  light200: '#F6E788',
  light100: '#FFF4D0',
};
```

### Black & Grays

Use for text, backgrounds, and neutral elements.

```typescript
export const NeutralColors = {
  // Black Shades
  black: '#000000',
  dark900: '#1B2532',
  dark800: '#2A3743',
  dark700: '#3C4F5B',
  dark600: '#4D6073',
  
  // Gray Shades
  gray600: '#667085',
  gray500: '#7A8699',
  gray400: '#9BADBD',
  gray300: '#C0CBDA',
  gray200: '#E1E8F0',
  gray100: '#F5F8FA',
  
  white: '#FFFFFF',
};
```

### Success (Green)

Use for success states, confirmations, positive actions.

```typescript
export const SuccessColors = {
  dark900: '#0F3D3A',
  dark800: '#1A6D5B',
  dark700: '#258E6C',
  dark600: '#2DB088',
  
  default: '#32D394',
  
  light400: '#6BEBB8',
  light300: '#88EE8C',
  light200: '#A6F1B4',
  light100: '#C9FCDC',
};
```

### Error (Red/Orange)

Use for errors, warnings, destructive actions.

```typescript
export const ErrorColors = {
  dark900: '#7A0C40',
  dark800: '#B1164E',
  dark700: '#D72754',
  dark600: '#E03F56',
  
  default: '#FF4C6B',
  
  light400: '#FF7679',
  light300: '#FF9C93',
  light200: '#FFC1B7',
  light100: '#FFE4D8',
};
```

### Information (Blue)

Use for informational messages, links, info states.

```typescript
export const InfoColors = {
  dark900: '#071F90',
  dark800: '#0D2FB8',
  dark700: '#1245D2',
  dark600: '#1D5EEF',
  
  //default: '#2874CC',
  
  light400: '#5C97FE',
  light300: '#7CAEF7',
  light200: '#A4C8F9',
  light100: '#D3E5FC',
};
```

---

## 🔤 Typography

### Font Family
- **Primary:** SF Pro Display / SF Pro Text
- **Fallback (Web):** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Fallback (Android):** `Roboto, sans-serif`

### Type Scale

```typescript
export const Typography = {
  // Headings - SemiBold/Bold
  headline900: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700', // Bold
    letterSpacing: -0.5,
  },
  
  headline800: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '600', // SemiBold
    letterSpacing: -0.3,
  },
  
  headline700: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600', // SemiBold
  },
  
  headline600: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600', // SemiBold
  },
  
  headline500: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600', // SemiBold
  },
  
  headline400: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600', // SemiBold
  },
  
  headline300: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600', // SemiBold
  },
  
  // Small Headings - ALL CAPS
  heading200: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600', // SemiBold
    textTransform: 'uppercase',
  },
  
  heading100: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600', // SemiBold
    textTransform: 'uppercase',
  },
  
  // Body Text - Regular
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400', // Regular
  },
  
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400', // Regular
  },
  
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400', // Regular
  },
};
```

### Usage Guidelines

**Headlines (900-300):**
- Page titles, section headers
- Use SemiBold (600) or Bold (700)
- Dark color for contrast

**Headings (200-100):**
- UI labels, captions
- UPPERCASE only
- SemiBold weight

**Body Text:**
- Paragraphs, descriptions
- Regular weight (400)
- Gray colors for secondary text

---

## 🎭 Shadows (Elevation)

Use for cards, modals, floating elements.

```typescript
export const Shadows = {
  // Small Cards (subtle elevation)
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  
  // Medium Cards
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  
  // Large Cards / Modals
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },

  // Primary Button Shadow (New)
  // X:4 Y:8 Blur:24 Spread:0 Color:#FCD240 20%
  primaryButton: {
    shadowColor: '#FCD240',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12, // Blur approximated as radius * 0.5 or adjustments
    elevation: 8,     // Android approximation
  },
};

```

**Web CSS Equivalent:**
```css
/* Small */
box-shadow: 0px 8px 4px rgba(0, 0, 0, 0.08);

/* Medium */
box-shadow: 0px 12px 6px rgba(0, 0, 0, 0.08);

/* Large */
box-shadow: 0px 12px 8px rgba(0, 0, 0, 0.12);
```

---

## 🔘 Buttons

### Size Variants

```typescript
export const ButtonSizes = {
  small: {
    height: 32,
    paddingHorizontal: 12,
    fontSize: 12,
    iconSize: 16,
    borderRadius: 6,
  },
  
  medium: {
    height: 40,
    paddingHorizontal: 16,
    fontSize: 14,
    iconSize: 18,
    borderRadius: 8,
  },
  
  large: {
    height: 48,
    paddingHorizontal: 20,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 10,
  },
};
```

### Primary Buttons (Solid)

**Brand/Default State:**
```typescript
{
  backgroundColor: BrandColors.default, // #FCD240
  color: NeutralColors.black,
  borderWidth: 0,
}
```

**States:**
- **Pressed:** `backgroundColor: BrandColors.dark700`
- **Hovered:** `backgroundColor: BrandColors.light400`
- **Focused:** Add border `2px solid` with `BrandColors.dark800`
- **Disabled:** `backgroundColor: NeutralColors.gray200`, `color: NeutralColors.gray400`

### Secondary Buttons (Outlined)

**Line/Default State:**
```typescript
{
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: BrandColors.default,
  color: BrandColors.default,
}
```

**States:**
- **Pressed:** `borderColor: BrandColors.dark700`, `color: BrandColors.dark700`
- **Hovered:** `backgroundColor: BrandColors.light100`
- **Focused:** `borderWidth: 2`
- **Disabled:** `borderColor: NeutralColors.gray300`, `color: NeutralColors.gray400`

### Soft Background Buttons

```typescript
{
  backgroundColor: BrandColors.light100, // Very light yellow
  color: BrandColors.dark800,
  borderWidth: 0,
}
```

### Icon-Only Buttons

- Use same size variants
- Padding: `width = height` (square)
- Icon centered
- No text label

---

## 📐 Spacing System

Use 4px base unit for consistent spacing.

```typescript
export const Spacing = {
  xs: 4,   // 4px
  sm: 8,   // 8px
  md: 12,  // 12px
  lg: 16,  // 16px
  xl: 20,  // 20px
  xxl: 24, // 24px
  xxxl: 32, // 32px
};
```

### Common Patterns

- **Card padding:** `lg` (16px)
- **Screen margins:** `lg` (16px) or `xl` (20px)
- **Component gaps:** `md` (12px)
- **Section spacing:** `xxl` (24px) or `xxxl` (32px)
- **List item spacing:** `md` (12px)

---

## 🎯 Component Patterns

### Card Component

```typescript
<View style={{
  backgroundColor: NeutralColors.white,
  borderRadius: 12,
  padding: Spacing.lg,
  ...Shadows.medium,
}}>
  {/* Card content */}
</View>
```

### Screen Layout

```typescript
<View style={{
  flex: 1,
  backgroundColor: NeutralColors.gray100, // Light background
  padding: Spacing.lg,
}}>
  {/* Screen content */}
</View>
```

### Text Hierarchy

```typescript
// Page Title
<Text style={Typography.headline700}>Welcome to TravelBuddy</Text>

// Section Header
<Text style={Typography.headline500}>Your Trips</Text>

// Body Content
<Text style={Typography.bodyMedium}>Plan your next adventure</Text>

// Caption/Label
<Text style={Typography.heading200}>STATUS</Text>
```

---

## 🎨 Design Principles

### 1. **Brand Color Usage**
- **Primary actions:** Brand gold (#DBA641)
- **Backgrounds:** White or light gray
- **Text:** Dark gray/black for primary, medium gray for secondary

### 2. **Shadow Hierarchy**
- **Flat surfaces:** No shadow
- **Cards:** Small or medium shadow
- **Modals/Overlays:** Large shadow

### 3. **Typography Hierarchy**
- **One H1 per screen:** Use headline900 or headline800
- **Consistent scale:** Don't skip sizes arbitrarily
- **Color contrast:** Ensure 4.5:1 ratio for body text

### 4. **Interactive States**
- **Always provide feedback:** Pressed, hovered, focused states
- **Consistent timing:** 150-200ms transitions
- **Disabled clarity:** Reduce opacity or desaturate

### 5. **Spacing Consistency**
- **Use spacing tokens:** Never hardcode random values
- **Vertical rhythm:** Keep consistent line-height ratios
- **Touch targets:** Minimum 44px for interactive elements

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T:
1. **Use random colors** - Always use defined color tokens
2. **Mix font weights** - Stick to Regular (400) and SemiBold (600)
3. **Inconsistent shadows** - Use shadow presets only
4. **Skip button states** - Every button needs all 4 states
5. **Ignore spacing system** - Don't use `margin: 7` or `padding: 15`
6. **Flat buttons without borders** - Secondary buttons MUST have borders
7. **Low contrast text** - Avoid light gray on white

### ✅ DO:
1. **Reference color tokens** - `BrandColors.default` not `#DBA641`
2. **Use typography presets** - `Typography.headline500` not custom styles
3. **Apply shadows to cards** - Elevate important content
4. **Implement all button states** - Pressed, hovered, focused, disabled
5. **Use spacing tokens** - `Spacing.lg` not `padding: 16`
6. **Test on both platforms** - iOS and Android rendering differences
7. **Check accessibility** - Color contrast, touch targets, screen readers

---

## 🎨 Example Component Implementation

### Trip Card (Following All Guidelines)

```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BrandColors, NeutralColors, Typography, Shadows, Spacing } from './theme';

function TripCard({ trip, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{trip.title}</Text>
        <View style={[styles.badge, styles.badgeRecruiting]}>
          <Text style={styles.badgeText}>RECRUITING</Text>
        </View>
      </View>
      
      <Text style={styles.destination}>{trip.destination}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.dates}>
          {trip.startDate} - {trip.endDate}
        </Text>
        <Text style={styles.difficulty}>
          {trip.difficulty}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: NeutralColors.white,
    borderRadius: 12,
    padding: Spacing.lg, // 16px
    marginBottom: Spacing.md, // 12px
    ...Shadows.medium,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm, // 8px
  },
  
  title: {
    ...Typography.headline500, // 18px SemiBold
    color: NeutralColors.black,
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  
  badgeRecruiting: {
    backgroundColor: SuccessColors.light100,
  },
  
  badgeText: {
    ...Typography.heading200, // 12px UPPERCASE
    color: SuccessColors.dark800,
  },
  
  destination: {
    ...Typography.bodyMedium, // 14px Regular
    color: NeutralColors.gray600,
    marginBottom: Spacing.md,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: NeutralColors.gray200,
    paddingTop: Spacing.sm,
  },
  
  dates: {
    ...Typography.bodySmall, // 12px Regular
    color: NeutralColors.gray500,
  },
  
  difficulty: {
    ...Typography.heading200, // 12px UPPERCASE
    color: BrandColors.dark700,
  },
});
```

---

## 📱 Platform-Specific Notes

### iOS
- Use native shadows (shadowColor, shadowOffset, etc.)
- San Francisco font family is default
- Haptic feedback on button press

### Android
- Use `elevation` for Material Design shadows
- Roboto font family
- Ripple effect on TouchableNativeFeedback

### Web
- Use CSS box-shadow
- Fallback fonts critical
- Hover states more prominent
- Focus outlines for accessibility

---

## 🔄 Versioning

- **Current Version:** 1.0.0
- **Last Updated:** 2026-01-13
- **Design System Source:** Figma (Shadow Template, Color, Buttons, Typography)

---

## 📚 Quick Reference

**When creating a new component, ask:**
1. ✅ Am I using color tokens from the palette?
2. ✅ Am I using typography presets?
3. ✅ Am I using spacing tokens (no random px values)?
4. ✅ Does my button have all 4 states?
5. ✅ Is my shadow from the Shadows presets?
6. ✅ Is text contrast ratio sufficient (4.5:1 minimum)?
7. ✅ Are touch targets at least 44px?

**If you answered NO to any → FIX IT!**

---

## 🎯 AI Model Checklist

When generating UI code:
- [ ] Import color/typography/spacing tokens
- [ ] Use StyleSheet.create() for React Native
- [ ] Apply appropriate shadows to elevated components
- [ ] Implement all button states (pressed, hovered, focused, disabled)
- [ ] Use semantic color names (Success for green, Error for red)
- [ ] Follow typography hierarchy (headline → body)
- [ ] Apply consistent spacing (use Spacing tokens)
- [ ] Test color contrast for accessibility
- [ ] Add platform-specific optimizations where needed

---

**Remember:** Consistency is key. Every component should feel like part of the same design system!
