import { Container, View } from 'reshaped'
import { PageHeader } from '../components/custom/PageHeader'
import ConversationsUploadTab from '../components/settings/ConversationsUploadTab'

export default function ImportData() {
  return (
    <Container width="large">
      <View direction="column" gap={6}>
        <PageHeader
          title="Import Conversations"
          subtitle="Upload CSV files to import conversation data"
        />
        <ConversationsUploadTab />
      </View>
    </Container>
  )
}

