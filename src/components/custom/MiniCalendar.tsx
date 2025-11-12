import { Text, View } from 'reshaped'
import { ContainerCard } from './ContainerCard'
import { ElevatedCard } from './ElevatedCard'
import { Calendar } from '@phosphor-icons/react'
import { useCalendarStore } from '../../store/useCalendarStore'
import { useEffect } from 'react'

export interface MiniCalendarProps {
  onEventClick?: (eventId: string) => void
}

export function MiniCalendar({ onEventClick }: MiniCalendarProps) {
  const todayEvents = useCalendarStore((state) => state.todayEvents)
  // const isLoading = useCalendarStore((state) => state.todayEventsLoading) // Not used - removed loading state
  const fetchTodayEvents = useCalendarStore((state) => state.fetchTodayEvents)
  
  useEffect(() => {
    fetchTodayEvents()
  }, [fetchTodayEvents])

  return (
    <ContainerCard padding={6}>
      <View direction="column" gap={4}>
        <View direction="row" gap={2} align="center">
          <Calendar size={20} weight="bold" />
          <Text variant="title-4" weight="bold">
            Today's Schedule
          </Text>
        </View>

        {todayEvents.length === 0 ? (
          <Text variant="body-2" color="neutral-faded">
            No events scheduled for today
          </Text>
        ) : (
          <View direction="column" gap={3}>
            {todayEvents.slice(0, 5).map(event => (
              <ElevatedCard
                key={event.id}
                padding={3}
                onClick={onEventClick ? () => onEventClick(event.id) : undefined}
              >
                <View direction="column" gap={1}>
                  <View direction="row" gap={2} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
                    <Text variant="body-2" weight="medium">
                      {event.title}
                    </Text>
                    <Text variant="caption-1" color="neutral-faded">
                      {new Date(event.date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </Text>
                  </View>
                  <Text variant="body-3" color="neutral-faded">
                    {event.goal}
                  </Text>
                </View>
              </ElevatedCard>
            ))}
          </View>
        )}
      </View>
    </ContainerCard>
  )
}
