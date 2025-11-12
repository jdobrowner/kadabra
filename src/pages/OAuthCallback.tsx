import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, View, Text, Button } from 'reshaped'
import { useAuthStore } from '../store/useAuthStore'
import { CheckCircle } from '@phosphor-icons/react'
import { Icon } from 'reshaped'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [invitationAccepted, setInvitationAccepted] = useState(false)
  const [orgName, setOrgName] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')
    const invitationAcceptedParam = searchParams.get('invitation_accepted')
    const orgNameParam = searchParams.get('org_name')

    if (errorParam) {
      setError('Authentication failed. Please try again.')
      setTimeout(() => {
        navigate('/signin')
      }, 3000)
      return
    }

    if (token) {
      // Check if invitation was accepted
      if (invitationAcceptedParam === 'true' && orgNameParam) {
        setInvitationAccepted(true)
        setOrgName(orgNameParam)
      }

      // Store token and fetch user data
      login(token)
        .then(() => {
          // If invitation was accepted, show message for a moment before redirect
          if (invitationAccepted) {
            setTimeout(() => {
              navigate('/')
            }, 3000)
          } else {
            // Redirect to home/dashboard immediately
            navigate('/')
          }
        })
        .catch((err) => {
          console.error('Login failed:', err)
          setError('Failed to complete sign-in. Please try again.')
          setTimeout(() => {
            navigate('/signin')
          }, 3000)
        })
    } else {
      setError('No authentication token received. Please try again.')
      setTimeout(() => {
        navigate('/signin')
      }, 3000)
    }
  }, [searchParams, navigate, login, invitationAccepted])

  if (error) {
    return (
      <Container width="640px" padding={4}>
        <View direction="column" gap={4} align="center" attributes={{ style: { paddingTop: '64px' } }}>
          <Text variant="title-3" color="critical">
            {error}
          </Text>
          <Text variant="body-2" color="neutral-faded">
            Redirecting to sign-in page...
          </Text>
        </View>
      </Container>
    )
  }

  if (invitationAccepted && orgName) {
    return (
      <Container width="640px" padding={4}>
        <View direction="column" gap={6} align="center" attributes={{ style: { paddingTop: '64px' } }}>
          <View
            direction="column"
            gap={4}
            align="center"
            padding={6}
            attributes={{
              style: {
                border: '1px solid var(--rs-color-border-positive)',
                borderRadius: '12px',
                backgroundColor: 'var(--rs-color-positive-background)',
                maxWidth: '400px',
              },
            }}
          >
            <Icon svg={<CheckCircle weight="fill" />} size={10} color="positive" />
            <View direction="column" gap={2} align="center">
              <Text variant="title-3" weight="bold">
                Invitation Accepted!
              </Text>
              <Text variant="body-2" align="center">
                You've successfully joined <strong>{orgName}</strong>
              </Text>
            </View>
            <Button onClick={() => navigate('/')} fullWidth>
              Go to Dashboard
            </Button>
            <Text variant="caption-1" color="neutral-faded">
              Redirecting automatically...
            </Text>
          </View>
        </View>
      </Container>
    )
  }

  return (
    <Container width="640px" padding={4}>
      <View direction="column" gap={4} align="center" attributes={{ style: { paddingTop: '64px' } }}>
        <Text variant="title-3">Completing sign-in...</Text>
        <Text variant="body-2" color="neutral-faded">
          Please wait while we set up your account.
        </Text>
      </View>
    </Container>
  )
}

