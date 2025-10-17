# Instructions

## Introduction

This directory contains layout components inspired by SwiftUI.

The goal is to create reusable and composable layout components that can be used to build complex user interfaces in a
declarative manner.

## Available Components

- `HStack`: A horizontal stack that arranges its children in a horizontal line.
- `VStack`: A vertical stack that arranges its children in a vertical line.
- `ZStack`: A z-axis stack that overlays its children on top of each other.

## Spacing

- `xs`: '0.25rem', // 4px
- `sm`: '0.5rem', // 8px
- `md`: '1rem', // 16px
- `lg`: '1.5rem', // 24px
- `xl`: '2rem', // 32px

## Usage

```jsx
import {HStack, VStack, ZStack} from "@/components/layout";

export const ProfileCard = () => (
    <VStack gap="md" align="start" style={{width: "300px"}}>
        <HStack justify="between">
            <span style={{fontWeight: 600}}>John Doe</span>
            <button>Edit</button>
        </HStack>

        <ZStack center style={{width: "150px", height: "150px"}}>
            <img src="/avatar-bg.png" alt="background"/>
            <img
                src="/avatar.png"
                alt="avatar"
                style={{borderRadius: "50%", width: "100px", height: "100px"}}
            />
        </ZStack>
    </VStack>
);
```
