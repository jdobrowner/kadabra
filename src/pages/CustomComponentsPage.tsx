import { Container, Grid, Text, Card, View } from 'reshaped'
import { CustomBadge } from '../components/custom/Badge'
import { CustomerCard } from '../components/custom/CustomerCard'
import { CustomerCardHorizontal } from '../components/custom/CustomerCardHorizontal'
import { CustomerCardCompact } from '../components/custom/CustomerCardCompact'
import { TodaysProgress } from '../components/custom/TodaysProgress'
import { ActNowButton } from '../components/custom/ActNowButton'
import { WarningCircle, CheckCircle, Clock, Info } from '@phosphor-icons/react'
import { mockCustomers } from '../data/mockCustomers'
import './CustomComponentsPage.css'

function CustomComponentsPage() {

  return (
    <div className="custom-components-page">
      <Container>
        <View padding={{ s: 0, m: 6 }}>
          <View direction="column" gap={8} attributes={{ style: { marginBottom: '32px' } }}>
            <Text variant="featured-1" weight="bold">
              Custom Components
            </Text>
            <Text variant="body-1" color="neutral-faded">
              Building block components built with Reshaped
            </Text>
          </View>

          {/* Act Now Button Component Section */}
          <View attributes={{ style: { marginBottom: '32px' } }}>
            <Card padding={6}>
              <View direction="column" gap={6}>
                <View direction="column" gap={2}>
                  <Text variant="title-3" weight="medium">
                    Act Now Button Component
                  </Text>
                  <Text variant="body-2" color="neutral-faded">
                    Gradient button component using Reshaped Button with custom gradient styling
                  </Text>
                </View>

                <View direction="column" gap={4}>
                  <View direction="column" gap={2}>
                    <Text variant="body-2" weight="medium">
                      Default
                    </Text>
                    <View direction="row" gap={2} attributes={{ style: { flexWrap: 'wrap' } }}>
                      <ActNowButton />
                      <ActNowButton disabled>Disabled</ActNowButton>
                      <ActNowButton loading>Loading</ActNowButton>
                    </View>
                  </View>

                  <View direction="column" gap={2}>
                    <Text variant="body-2" weight="medium">
                      Icon Only
                    </Text>
                    <View direction="row" gap={2} attributes={{ style: { flexWrap: 'wrap', alignItems: 'center' } }}>
                      <ActNowButton iconOnly />
                      <ActNowButton iconOnly disabled />
                      <ActNowButton iconOnly loading />
                    </View>
                  </View>

                  <View direction="column" gap={2}>
                    <Text variant="body-2" weight="medium">
                      Full Width
                    </Text>
                    <ActNowButton fullWidth />
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Badge Component Section */}
          <View attributes={{ style: { marginBottom: '32px' } }}>
            <Card padding={6}>
              <View direction="column" gap={6}>
                <View direction="column" gap={2}>
                  <Text variant="title-3" weight="medium">
                    Badge Component
                  </Text>
                  <Text variant="body-2" color="neutral-faded">
                    Outlined, pill-shaped badge with optional icon on the left
                  </Text>
                </View>

                <View direction="column" gap={4}>
                  <View direction="column" gap={2}>
                    <Text variant="body-2" weight="medium">
                      Default (with Circle icon)
                    </Text>
                    <View direction="row" gap={2} attributes={{ style: { flexWrap: 'wrap' } }}>
                      <CustomBadge>Neutral</CustomBadge>
                      <CustomBadge color="primary">Primary</CustomBadge>
                      <CustomBadge color="critical">Critical</CustomBadge>
                      <CustomBadge color="positive">Positive</CustomBadge>
                      <CustomBadge color="warning">Warning</CustomBadge>
                    </View>
                  </View>

                  <View direction="column" gap={2}>
                    <Text variant="body-2" weight="medium">
                      With Custom Icons
                    </Text>
                    <View direction="row" gap={2} attributes={{ style: { flexWrap: 'wrap' } }}>
                      <CustomBadge icon={WarningCircle} color="critical">Alert</CustomBadge>
                      <CustomBadge icon={CheckCircle} color="positive">Complete</CustomBadge>
                      <CustomBadge icon={Clock} color="warning">Pending</CustomBadge>
                      <CustomBadge icon={Info} color="primary">Info</CustomBadge>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Today's Progress Component Section */}
          <View attributes={{ style: { marginBottom: '32px' } }}>
            <Card padding={6}>
              <View direction="column" gap={6}>
                <View direction="column" gap={2}>
                  <Text variant="title-3" weight="medium">
                    Today's Progress Component
                  </Text>
                  <Text variant="body-2" color="neutral-faded">
                    Header component showing resolved action plans with progress indicator
                  </Text>
                </View>

                <View direction="column" gap={4}>
                  <TodaysProgress resolved={3} total={10} />
                  <TodaysProgress resolved={7} total={10} />
                  <TodaysProgress resolved={10} total={10} />
                  <TodaysProgress resolved={0} total={5} />
                </View>
              </View>
            </Card>
          </View>

          {/* Customer Card Component Section */}
          <View attributes={{ style: { marginBottom: '32px' } }}>
            <Card padding={6}>
              <View direction="column" gap={6}>
                <View direction="column" gap={2}>
                  <Text variant="title-3" weight="medium">
                    Customer Card Component
                  </Text>
                  <Text variant="body-2" color="neutral-faded">
                    Card component displaying customer information with priority badge and AI recommendations
                  </Text>
                </View>

                <Grid columns={{ s: 1, m: 2, l: 3 }} gap={4}>
                  {mockCustomers.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      {...customer}
                      actionPlanId={`demo-action-plan-${customer.id}`}
                      onActNow={(actionPlanId, customerId) => {
                        console.log('Act now clicked', { actionPlanId, customerId })
                      }}
                    />
                  ))}
                </Grid>
              </View>
            </Card>
          </View>

          {/* Customer Card Horizontal Component Section */}
          <View attributes={{ style: { marginBottom: '32px' } }}>
            <Card padding={6}>
              <View direction="column" gap={6}>
                <View direction="column" gap={2}>
                  <Text variant="title-3" weight="medium">
                    Customer Card Horizontal Component
                  </Text>
                  <Text variant="body-2" color="neutral-faded">
                    Horizontal layout version - wider and less tall, with all information displayed horizontally
                  </Text>
                </View>

                <View direction="column" gap={4}>
                  {mockCustomers.map((customer) => (
                    <CustomerCardHorizontal
                      key={customer.id}
                      {...customer}
                      actionPlanId={`demo-action-plan-${customer.id}`}
                      onActNow={(actionPlanId, customerId) => {
                        console.log('Act now clicked', { actionPlanId, customerId })
                      }}
                    />
                  ))}
                </View>
              </View>
            </Card>
          </View>

          {/* Customer Card Compact Component Section */}
          <View attributes={{ style: { marginBottom: '32px' } }}>
            <Card padding={6}>
              <View direction="column" gap={6}>
                <View direction="column" gap={2}>
                  <Text variant="title-3" weight="medium">
                    Customer Card Compact Component
                  </Text>
                  <Text variant="body-2" color="neutral-faded">
                    Compact horizontal version with less information and icon-only Act Now button
                  </Text>
                </View>

                <View direction="column" gap={4}>
                  {mockCustomers.map((customer) => (
                    <CustomerCardCompact
                      key={customer.id}
                      id={customer.id}
                      name={customer.name}
                      badge={customer.badge}
                      communications={customer.communications}
                      topic={customer.topic}
                      actionPlanId={`demo-action-plan-${customer.id}`}
                      onActNow={(actionPlanId, customerId) => {
                        console.log('Act now clicked', { actionPlanId, customerId })
                      }}
                    />
                  ))}
                </View>
              </View>
            </Card>
          </View>
        </View>
      </Container>
    </div>
  )
}

export default CustomComponentsPage

