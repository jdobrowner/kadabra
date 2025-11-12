import { View, Text, Button } from 'reshaped'
import { useTheme } from 'reshaped'
import { Moon, Sun } from '@phosphor-icons/react'
import { Icon } from 'reshaped'
import { LOCAL_STORAGE_KEYS, setStoredValue } from '../../utils/storage'

export default function GeneralTab() {
  const { colorMode, setColorMode } = useTheme()
  const isDark = colorMode === 'dark'

  return (
    <View direction="column" gap={6}>
      <View direction="column" gap={2}>
        <Text variant="body-1" weight="medium">
          Appearance
        </Text>
        <Text variant="body-2" color="neutral-faded">
          Customize the look and feel of your workspace
        </Text>
      </View>

      <View
        direction="row"
        justify="space-between"
        align="center"
        padding={4}
        attributes={{
          style: {
            border: '1px solid var(--rs-color-border-neutral)',
            borderRadius: '8px',
            backgroundColor: 'var(--rs-color-background-neutral)',
          },
        }}
      >
        <View direction="column" gap={1}>
          <Text variant="body-2" weight="medium">
            Theme
          </Text>
          <Text variant="caption-1" color="neutral-faded">
            Choose between light and dark mode
          </Text>
        </View>
        <Button
          variant="outline"
          icon={
            isDark ? (
              <Icon svg={<Sun weight="bold" />} size={4} />
            ) : (
              <Icon svg={<Moon weight="bold" />} size={4} />
            )
          }
          onClick={() => {
            const nextMode = isDark ? 'light' : 'dark'
            setColorMode(nextMode)
            setStoredValue(LOCAL_STORAGE_KEYS.colorMode, nextMode)
          }}
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </View>
    </View>
  )
}

