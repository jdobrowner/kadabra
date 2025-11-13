import { Container, View } from 'reshaped'
import { PageHeader } from '../components/custom/PageHeader'
import { MiniCalendar } from '../components/custom/MiniCalendar'

export default function CalendarView() {
  return (
    <Container width="large">
      <View direction="column" gap={6}>
        <PageHeader
          title="Calendar"
          subtitle="View your scheduled events"
        />
        <MiniCalendar />
      </View>
    </Container>
  )
}

