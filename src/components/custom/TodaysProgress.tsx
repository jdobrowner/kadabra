import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { View, Text, Progress, Badge, Icon, Flyout } from 'reshaped'
import { Star, CheckCircle, Lightning } from '@phosphor-icons/react'
import { useActionPlansStore } from '../../store/useActionPlansStore'
import './TodaysProgress.css'

export interface TodaysProgressProps {
  resolved?: number
  total?: number
  className?: string
}

function countActiveActionPlans(actionPlans: ReturnType<typeof useActionPlansStore.getState>['actionPlans']) {
  return actionPlans.reduce((count, plan) => {
    if (!plan) {
      return count
    }
    const status = plan.status?.toLowerCase()
    const isActive = status !== 'completed' && status !== 'canceled' && status !== 'cancelled'
    return isActive ? count + 1 : count
  }, 0)
}

function countCompletedToday(actionPlans: ReturnType<typeof useActionPlansStore.getState>['actionPlans']) {
  const now = new Date()
  return actionPlans.reduce((count, plan) => {
    if (!plan?.completedAt) {
      return count
    }
    const completedDate = new Date(plan.completedAt)
    const isToday =
      completedDate.getFullYear() === now.getFullYear() &&
      completedDate.getMonth() === now.getMonth() &&
      completedDate.getDate() === now.getDate()

    return plan.status?.toLowerCase() === 'completed' && isToday ? count + 1 : count
  }, 0)
}

export function TodaysProgress({ resolved, total, className }: TodaysProgressProps) {
  const actionPlans = useActionPlansStore((state) => state.actionPlans)
  const actionPlansLoading = useActionPlansStore((state) => state.actionPlansLoading)
  const fetchActionPlans = useActionPlansStore((state) => state.fetchActionPlans)

  const storeResolved = useMemo(() => countCompletedToday(actionPlans), [actionPlans])
  const storeTotal = useMemo(() => countActiveActionPlans(actionPlans), [actionPlans])

  const resolvedValue = resolved ?? storeResolved
  const totalValue = total ?? storeTotal

  const progressPercentage = totalValue > 0
    ? Math.min(100, Math.round((resolvedValue / totalValue) * 100))
    : 0
  const allResolved = totalValue === 0
    ? resolvedValue > 0
    : resolvedValue >= totalValue
  const progressWidth = 180

  const [isAnimating, setIsAnimating] = useState(false)
  const [displayProgress, setDisplayProgress] = useState(progressPercentage)
  const previousResolvedRef = useRef(resolvedValue)
  const previousProgressRef = useRef(progressPercentage)
  const hasRequestedFetchRef = useRef(false)

  useEffect(() => {
    if (resolved !== undefined || total !== undefined) {
      return
    }
    if (hasRequestedFetchRef.current) {
      return
    }
    if (!actionPlansLoading && actionPlans.length === 0) {
      hasRequestedFetchRef.current = true
      fetchActionPlans().catch(() => {
        hasRequestedFetchRef.current = false
      })
    }
  }, [resolved, total, actionPlansLoading, actionPlans.length, fetchActionPlans])

  useEffect(() => {
    if (resolvedValue > previousResolvedRef.current) {
      setIsAnimating(true)
    }
    previousResolvedRef.current = resolvedValue
  }, [resolvedValue])

  useEffect(() => {
    if (!isAnimating) return

    const timer = window.setTimeout(() => {
      setIsAnimating(false)
    }, 900)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isAnimating])

  useEffect(() => {
    if (progressPercentage === previousProgressRef.current) {
      setDisplayProgress(progressPercentage)
      return
    }

    const duration = 700
    const startValue = previousProgressRef.current
    const changeInValue = progressPercentage - startValue
    let animationFrameId = 0
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      setDisplayProgress(startValue + changeInValue * easedProgress)

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(animate)
      } else {
        previousProgressRef.current = progressPercentage
        setDisplayProgress(progressPercentage)
      }
    }

    animationFrameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [progressPercentage])

  const containerClassName = [
    'progress-container',
    isAnimating ? 'progress-container--animating' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const iconCircleClassName = [
    'progress-icon-circle',
    'gradient-purple',
    isAnimating ? 'progress-icon-circle--animating' : '',
  ].join(' ').trim()

  return (
    <Flyout triggerType="hover" position="bottom">
      <Flyout.Trigger>
        {(attributes) => (
          <View 
            attributes={attributes}
            className={className}
          >
            {allResolved && (
              <Icon svg={<Star weight="fill" />} />
            )}
            
            <View 
              attributes={{ 
                style: { 
                  flex: '0 0 auto',
                  width: `${progressWidth}px`,
                  minWidth: `${progressWidth}px`,
                  position: 'relative',
                  cursor: 'default'
                } 
              }}
              className={containerClassName}
            >
              <Progress 
                value={displayProgress} 
                attributes={{
                  style: {
                    '--rs-color-background-primary': 'var(--rs-color-border-neutral)'
                  } as CSSProperties
                }}
              />
              <div 
                className="progress-icon"
                style={{
                  left: `clamp(0px, calc(${displayProgress}% - 12px), calc(${progressWidth}px - 24px))`,
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <div className={iconCircleClassName}>
                  <Icon svg={<Lightning weight="fill" />} />
                </div>
              </div>
            </View>
          </View>
        )}
      </Flyout.Trigger>
      <Flyout.Content
        attributes={{
          style: {
            boxShadow: 'none',
            borderRadius: '16px',
            border: '1px solid var(--rs-color-border-neutral)',
            backgroundColor: 'var(--rs-color-background-neutral)',
          },
        }}
      >
        <View padding={4} direction="column" gap={2} backgroundColor='neutral'>
          <View direction="row" gap={0} align="center">
            <Text variant="body-2" weight="bold">
              Today's Progress
            </Text>
            {allResolved && (
              <Badge color="positive" size="small" rounded icon={<CheckCircle weight="bold" />}>
                Complete
              </Badge>
            )}
          </View>
          <Text variant="body-3" color="neutral-faded">
            {resolvedValue} / {totalValue} resolved
          </Text>
        </View>
      </Flyout.Content>
    </Flyout>
  )
}
