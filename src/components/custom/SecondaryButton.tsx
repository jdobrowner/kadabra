import { CustomButton } from './CustomButton'
import type { CustomButtonProps } from './CustomButton'

export interface SecondaryButtonProps extends Omit<CustomButtonProps, 'variant'> {
  children: React.ReactNode
}

export function SecondaryButton(props: SecondaryButtonProps) {
  return <CustomButton {...props} variant="outline" />
}

