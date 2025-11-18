import { CustomButton } from './CustomButton'
import type { CustomButtonProps } from './CustomButton'

export interface GhostButtonProps extends Omit<CustomButtonProps, 'variant'> {
  children: React.ReactNode
}

export function GhostButton(props: GhostButtonProps) {
  return <CustomButton {...props} variant="ghost" />
}

