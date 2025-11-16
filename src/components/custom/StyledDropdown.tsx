import { DropdownMenu, Button, View } from 'reshaped'
import { CaretDown } from '@phosphor-icons/react'
import type { DropdownMenuProps } from 'reshaped'
import type { ReactNode } from 'react'

export interface StyledDropdownProps extends Omit<DropdownMenuProps, 'children'> {
  children: ReactNode
  trigger: ReactNode
  disabled?: boolean
  fullWidth?: boolean
  size?: 'small' | 'medium'
  triggerClassName?: string
  triggerFontSize?: string
  triggerPaddingLeft?: string
  triggerPaddingRight?: string
  triggerMinWidth?: string
}

export function StyledDropdown({
  trigger,
  disabled = false,
  fullWidth = false,
  size = 'small',
  triggerClassName,
  triggerFontSize,
  triggerPaddingLeft = '16px',
  triggerPaddingRight = '12px',
  triggerMinWidth,
  children,
  ...dropdownMenuProps
}: StyledDropdownProps) {
  const triggerButtonStyle: React.CSSProperties = {
    borderRadius: '30px',
    paddingLeft: triggerPaddingLeft,
    paddingRight: triggerPaddingRight,
    paddingTop: '8px',
    paddingBottom: '8px',
    borderColor: 'var(--rs-color-foreground-neutral)',
    fontWeight: 'normal',
    fontSize: triggerFontSize || '13px',
    ...(fullWidth && {
      width: '100%',
      justifyContent: 'space-between',
    }),
    ...(triggerMinWidth && {
      minWidth: triggerMinWidth,
    }),
  }

  const contentStyle: React.CSSProperties = {
    boxShadow: 'none',
    borderRadius: '16px',
    border: '1px solid var(--rs-color-border-neutral)',
    backgroundColor: 'var(--rs-color-background-neutral)',
  }

  return (
    <DropdownMenu {...dropdownMenuProps}>
      <DropdownMenu.Trigger>
        {(attributes) => (
          <Button
            {...attributes}
            variant="outline"
            size={size}
            disabled={disabled}
            attributes={{
              style: triggerButtonStyle,
              className: `styled-dropdown-trigger ${triggerClassName || ''}`,
            }}
          >
            <View
              direction="row"
              gap={2}
              align="center"
              attributes={{
                style: fullWidth
                  ? { width: '100%', justifyContent: 'space-between' }
                  : undefined,
              }}
            >
              {trigger}
              <CaretDown size={triggerFontSize === '13px' ? 14 : 16} weight="regular" />
            </View>
          </Button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        attributes={{
          style: contentStyle,
          className: 'styled-dropdown-content',
        }}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

// Re-export DropdownMenu.Item for convenience
StyledDropdown.Item = DropdownMenu.Item

