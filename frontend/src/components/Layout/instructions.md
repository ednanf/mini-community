# Instructions

## Introduction

This directory contains layout components inspired by SwiftUI.

The goal is to create reusable and composable layout components that can be used to build complex user interfaces in a
declarative manner.

## Available Components

- `HStack`: A horizontal stack that arranges its children in a horizontal line.
- `VStack`: A vertical stack that arranges its children in a vertical line.
- `ZStack`: A z-axis stack that overlays its children on top of each other.

## Component API

All stack components accept standard `div` attributes like `className` and `style`. They also share a common set of
props for layout and spacing.

### Common Props

- `gap`: `SpacingKey | number | string`
    - Controls the space between children. (Not available on `ZStack`).
- `align`: `'start' | 'center' | 'end' | 'stretch'`
    - Controls alignment on the cross-axis. (`stretch` is the default for `VStack`).
- `justify`: `'start' | 'center' | 'end' | 'between' | 'around'`
    - Controls alignment on the main-axis.
- `textAlign`: `'left' | 'center' | 'right'`
    - Sets the `text-align` property for the stack, which is inherited by all children.
- `margin`: `SpacingKey | number | string`
    - Sets the margin around the component.
- `padding`: `SpacingKey | number | string`
    - Sets the padding inside the component.

### Component-Specific Props

- `HStack`
    - `wrap`: `boolean` - Allows children to wrap to the next line if they exceed the container width.
- `ZStack`
    - `center`: `boolean` - A shortcut to center all children both horizontally and vertically within the stack.

## Spacing Scale

The `gap`, `margin`, and `padding` props can accept a spacing key for standardized sizing.

- `xs`: '0.25rem' (4px)
- `sm`: '0.5rem' (8px)
- `md`: '1rem' (16px)
- `lg`: '1.5rem' (24px)
- `xl`: '2rem' (32px)

## Usage Example

```jsx
import { HStack, VStack, ZStack } from "@/components/layout";

export const ProfileCard = () => (
    <VStack 
      gap="md" 
      align="start" 
      padding="lg" 
      style={{ width: "300px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
        <HStack justify="between" style={{ width: "100%" }}>
            <span style={{ fontWeight: 600 }}>John Doe</span>
            <button>Edit</button>
        </HStack>

        <ZStack center style={{ width: "150px", height: "150px" }}>
            <img src="/avatar-bg.png" alt="background" />
            <img
                src="/avatar.png"
                alt="avatar"
                style={{ borderRadius: "50%", width: "100px", height: "100px" }}
            />
        </ZStack>

        <VStack textAlign="center" gap="sm">
            <p>Bio: Building cool things with React.</p>
        </VStack>
    </VStack>
);