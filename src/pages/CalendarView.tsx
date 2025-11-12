import { Container, View, Text } from 'reshaped'
import { MiniCalendar } from '../components/custom/MiniCalendar'

export default function CalendarView() {
  return (
    <Container width="large">
      <View direction="column" gap={6}>
        <View direction="column" gap={2}>
          <Text variant="title-2" weight="bold">
            Calendar
          </Text>
          <Text variant="body-2" color="neutral-faded">
            View your scheduled events
          </Text>
        </View>
        <MiniCalendar />
      </View>
    </Container>
  )
}

