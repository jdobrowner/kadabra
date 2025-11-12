import { Container, View, Text } from 'reshaped'
import ConversationsUploadTab from '../components/settings/ConversationsUploadTab'

export default function ImportData() {
  return (
    <Container width="large">
      <View direction="column" gap={6}>
        <View direction="column" gap={2}>
          <Text variant="title-2" weight="bold">
            Import Conversations
          </Text>
          <Text variant="body-2" color="neutral-faded">
            Upload CSV files to import conversation data
          </Text>
        </View>
        <ConversationsUploadTab />
      </View>
    </Container>
  )
}

