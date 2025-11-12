import { Container, Text, Button, Card } from 'reshaped'
import { Sparkle, PuzzlePiece } from '@phosphor-icons/react'
import { useCounterStore } from '../store/counterStore'
import { Link } from 'react-router-dom'
import { DashboardStats } from '../components/custom/DashboardStats'
import '../App.css'

function HomePage() {
  const { count, increment, decrement, reset } = useCounterStore()

  return (
    <div className="app">
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <DashboardStats
            userName="Sarah"
            customersAnalyzed={24}
            actionPlansCreated={18}
            urgentActionPlans={5}
            onCustomersAnalyzedClick={() => console.log('Customers analyzed clicked')}
            onActionPlansCreatedClick={() => console.log('Action plans created clicked')}
            onUrgentActionPlansClick={() => console.log('Urgent action plans clicked')}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
            <Sparkle size={32} weight="bold" />
            <Text variant="featured-1" weight="bold">
              Kadabra Demo
            </Text>
          </div>
          
          <Text variant="body-1" color="neutral-faded">
            React + TypeScript + Vite + Zustand + Reshaped + Phosphor
          </Text>

          <div style={{ width: '100%', maxWidth: '500px' }}>
            <Card padding={6}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                <Text variant="title-3" weight="medium">
                  Counter: {count}
                </Text>
                
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                  <Button onClick={decrement} variant="outline">
                    Decrement
                  </Button>
                  <Button onClick={reset} variant="outline">
                    Reset
                  </Button>
                  <Button onClick={increment}>
                    Increment
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ width: '100%', maxWidth: '500px' }}>
            <Card padding={6}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PuzzlePiece size={24} weight="bold" />
                  <Text variant="title-3" weight="medium">
                    Component Library
                  </Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text variant="body-2" color="neutral-faded">
                    Explore all available Reshaped UI components in a comprehensive showcase
                  </Text>
                </div>
                <Link to="/components">
                  <Button>
                    View All Components
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div style={{ width: '100%', maxWidth: '500px' }}>
            <Card padding={6}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkle size={24} weight="bold" />
                  <Text variant="title-3" weight="medium">
                    Custom Components
                  </Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text variant="body-2" color="neutral-faded">
                    View custom building block components built with Reshaped
                  </Text>
                </div>
                <Link to="/custom-components">
                  <Button>
                    View Custom Components
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default HomePage

