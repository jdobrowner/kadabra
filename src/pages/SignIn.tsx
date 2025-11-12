import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, View, Text, Button } from 'reshaped'
import { trpc } from '../lib/trpc-client'
import { useAuthStore } from '../store/useAuthStore'
import { EnvelopeSimple } from '@phosphor-icons/react'
import { Icon } from 'reshaped'

export default function SignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const invitationToken = searchParams.get('invitation')
  
  const { data: authUrlData, isLoading: authUrlLoading, error: authUrlError } = trpc.auth.getGoogleAuthUrl.useQuery(
    { invitationToken: invitationToken || undefined },
    { enabled: true }
  )
  const { data: invitationData, isLoading: invitationLoading } = trpc.invitations.getByToken.useQuery(
    { token: invitationToken! },
    { enabled: !!invitationToken }
  )

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleSignIn = () => {
    if (authUrlData?.authUrl) {
      // The authUrl already includes the invitation token in state if provided
      // via the getGoogleAuthUrl query parameter
      window.location.href = authUrlData.authUrl
    }
  }

  const hasInvitation = !!invitationToken && !!invitationData

  return (
    <Container width="640px" padding={4}>
      <View direction="column" gap={6} align="center" attributes={{ style: { paddingTop: '64px' } }}>
        <View direction="column" gap={4} align="center">
          <Text variant="title-2" weight="bold">
            Welcome to Kadabra
          </Text>
          {hasInvitation ? (
            <View direction="column" gap={3} align="center">
              <View
                direction="row"
                gap={2}
                align="center"
                padding={3}
                attributes={{
                  style: {
                    border: '1px solid var(--rs-color-border-primary)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--rs-color-primary-background)',
                  },
                }}
              >
                <Icon svg={<EnvelopeSimple weight="bold" />} size={5} color="primary" />
                <View direction="column" gap={1}>
                  <Text variant="body-2" weight="medium">
                    You've been invited!
                  </Text>
                  <Text variant="caption-1" color="neutral-faded">
                    {invitationData?.org?.name && (
                      <>Join {invitationData.org.name} as {invitationData.role}</>
                    )}
                  </Text>
                </View>
              </View>
              <Text variant="body-1" color="neutral-faded">
                {invitationData?.email && (
                  <>Sign in with <strong>{invitationData.email}</strong> to accept</>
                )}
              </Text>
            </View>
          ) : (
            <Text variant="body-1" color="neutral-faded">
              Sign in with your Google account to continue
            </Text>
          )}
        </View>

        <View attributes={{ style: { paddingTop: '16px', width: '100%', maxWidth: '300px' } }}>
          {authUrlError && (
            <View 
              padding={3} 
              attributes={{ 
                style: { 
                  backgroundColor: 'var(--rs-color-negative-background)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  width: '100%'
                } 
              }}
            >
              <Text variant="body-2" color="critical">
                Error: {authUrlError.message || 'Failed to load Google sign-in. Please check your environment variables and try again.'}
              </Text>
            </View>
          )}
          <Button
            onClick={handleSignIn}
            disabled={authUrlLoading || invitationLoading || !authUrlData?.authUrl}
            fullWidth
            size="large"
          >
            {authUrlLoading || invitationLoading ? 'Loading...' : 'Sign in with Google'}
          </Button>
          {!authUrlLoading && !authUrlError && !authUrlData?.authUrl && (
            <Text variant="caption-1" color="neutral-faded" align="center" attributes={{ style: { marginTop: '8px' } }}>
              Unable to load sign-in. Please check the console for errors.
            </Text>
          )}
        </View>

        {hasInvitation && invitationData?.expiresAt && (
          <View attributes={{ style: { paddingTop: '8px' } }}>
            <Text variant="caption-1" color="neutral-faded" align="center">
              Invitation expires {new Date(invitationData.expiresAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </Container>
  )
}

