// src/components/atoms/Button/Button.stories.tsx
// import type { Meta, StoryObj } from '@storybook/html'

import { Meta, StoryObj } from 'storybook-solidjs'
import { Button } from './Button'
import './Button.module.scss'

// Примените корректную типизацию для Storybook
const meta: Meta<typeof Button> = {
  title: 'Atom/Button',
  component: Button,

  argTypes: {
    value: {
      control: { type: 'text' }
    },
    variant: {
      options: ['primary', 'secondary', 'bordered', 'outline', 'primary-square', 'secondary-square'],
      control: { type: 'select' }
    },
    size: {
      options: ['S', 'M', 'L', 'XS-square', 'S-square', 'M-square'],
      control: { type: 'radio' }
    },
    onClick: { action: 'clicked' }
  }
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    value: 'Button',
    variant: 'primary',
    size: 'M'
  }
}

export const Secondary: Story = {
  args: {
    value: 'Button',
    variant: 'secondary',
    size: 'M'
  }
}

export const PrimarySwitchFromStateAToStateB: Story = {
  args: {
    value: 'State A',
    variant: 'bordered',
    size: 'M'
  }
}

export const PrimarySwitchFromStateBToStateA: Story = {
  args: {
    value: 'State B',
    variant: 'outline',
    size: 'M'
  }
}

export const PrimarySquare: Story = {
  args: {
    value: 'Button',
    variant: 'primary-square',
    size: 'S-square'
  }
}

export const SecondarySquare: Story = {
  args: {
    value: 'Button',
    variant: 'secondary-square',
    size: 'S-square'
  }
}


