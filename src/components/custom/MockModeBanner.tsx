import { View, Text, Icon } from 'reshaped'
import { Info } from '@phosphor-icons/react'

export function MockModeBanner() {
  return (
    <View
      direction="row"
      gap={3}
      align="center"
      padding={3}
      attributes={{
        style: {
          paddingLeft: 'var(--rs-space-5)',
          paddingRight: 'var(--rs-space-5)',
          background: 'rgba(59, 130, 246, 0.12)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
        },
      }}
    >
      <Icon svg={<Info weight="bold" />} size={4} color="primary" />
      <View direction="column" gap={1}>
        <Text variant="body-3" weight="medium" color="primary">
          Mock data mode is active
        </Text>
        <Text variant="caption-1" color="primary">
          UI is powered by local mock services. Toggle off `VITE_USE_MOCK_DATA` to reconnect to live APIs.
        </Text>
      </View>
    </View>
  )
}

