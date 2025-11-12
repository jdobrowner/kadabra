import { useCallback, useState } from 'react'
import { View, Text, Button, FileUpload } from 'reshaped'
import { Upload, FileCsv, CheckCircle, XCircle, Microphone } from '@phosphor-icons/react'
import { Icon } from 'reshaped'
import { trpc } from '../../lib/trpc-client'
import { useQueryClient } from '@tanstack/react-query'
import { useCustomersStore } from '../../store/useCustomersStore'
import { useDashboardStore } from '../../store/useDashboardStore'

export default function ConversationsUploadTab() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isAudioUploading, setIsAudioUploading] = useState(false)
  const [audioResult, setAudioResult] = useState<{ success: boolean; message: string } | null>(null)

  const queryClient = useQueryClient()
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  const fetchStats = useDashboardStore((state) => state.fetchStats)

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchCustomers({ sortBy: 'priority' }),
      fetchStats(),
    ])
    await queryClient.invalidateQueries()
  }, [fetchCustomers, fetchStats, queryClient])

  const uploadMutation = trpc.conversations.uploadCsv.useMutation({
    onSuccess: refreshData,
  })

  const audioUploadMutation = trpc.conversations.uploadAudio.useMutation({
    onSuccess: refreshData,
  })

  const fileToBase64 = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result === 'string') {
          const [, base64] = result.split(',')
          resolve(base64 || result)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileSelect = ({ value }: { name: string; value: File[]; event?: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> }) => {
    const selectedFile = value?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file')
        return
      }
      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      // Read file as text
      const fileText = await file.text()
      
      // Upload via tRPC
      const result = await uploadMutation.mutateAsync({
        csvData: fileText,
        isBase64: false,
      })

      setUploadResult(result)
      
      // Clear file selection on success
      if (result.failed === 0) {
        setFile(null)
      }
    } catch (error: unknown) {
      console.error('Upload error:', error)
      setUploadResult({
        total: 0,
        success: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Failed to upload CSV file'],
      })
    } finally {
      setIsUploading(false)
    }
  }


  const handleAudioSelect = ({ value }: { name: string; value: File[]; event?: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> }) => {
    const selectedAudio = value?.[0]
    if (selectedAudio) {
      if (!selectedAudio.type.startsWith('audio/')) {
        alert('Please select an audio file')
        return
      }
      setAudioFile(selectedAudio)
      setAudioResult(null)
    }
  }

  const handleAudioUpload = async () => {
    if (!audioFile) return

    setIsAudioUploading(true)
    setAudioResult(null)

    try {
      const base64 = await fileToBase64(audioFile)
      await audioUploadMutation.mutateAsync({
        audioBase64: base64,
        fileName: audioFile.name,
        channel: 'voice-message',
        recordedAt: new Date().toISOString(),
      })
      setAudioResult({
        success: true,
        message: 'Audio upload received. Mock transcription is being processed.',
      })
      setAudioFile(null)
    } catch (error) {
      console.error('Audio upload error:', error)
      setAudioResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload audio file',
      })
    } finally {
      setIsAudioUploading(false)
    }
  }

  const handleAudioReset = () => {
    setAudioFile(null)
    setAudioResult(null)
  }

  return (
    <View direction="column" gap={6}>
      <View direction="column" gap={2}>
        <Text variant="body-1" weight="medium">
          Upload Conversations
        </Text>
        <Text variant="body-2" color="neutral-faded">
          Upload a CSV file containing conversation data. The system will automatically create customers and conversations.
        </Text>
      </View>

      {/* CSV Format Info */}
      <View
        padding={4}
        attributes={{
          style: {
            border: '1px solid var(--rs-color-border-neutral)',
            borderRadius: '8px',
            backgroundColor: 'var(--rs-color-background-neutral)',
          },
        }}
      >
        <View direction="column" gap={3}>
          <Text variant="body-2" weight="medium">
            CSV Format
          </Text>
          <View direction="column" gap={2}>
            <Text variant="caption-1" color="neutral-faded">
              <strong>Required columns:</strong> customer_name, channel, date
            </Text>
            <Text variant="caption-1" color="neutral-faded">
              <strong>Optional columns:</strong> customer_email, customer_phone, customer_company, transcript, content, summary, sentiment, duration
            </Text>
            <Text variant="caption-1" color="neutral-faded">
              <strong>Channels:</strong> phone, email, sms, chat, video, ai-call, voice-message
            </Text>
            <Text variant="caption-1" color="neutral-faded">
              <strong>Note:</strong> For voice-type channels (phone, ai-call, voice-message, video), the transcript column is required.
            </Text>
          </View>
        </View>
      </View>

      {/* File Upload */}
      {!file ? (
        <FileUpload
          name="csv-file"
          onChange={handleFileSelect as any}
          inputAttributes={{ accept: '.csv,text/csv' }}
        >
          <View
            direction="column"
            gap={4}
            align="center"
            padding={6}
            attributes={{
              style: {
                border: '2px dashed var(--rs-color-border-neutral)',
                borderRadius: '8px',
                backgroundColor: 'var(--rs-color-background-neutral)',
                minHeight: '200px',
                justifyContent: 'center',
              },
            }}
          >
            <Icon svg={<FileCsv weight="bold" />} size={8} color="neutral-faded" />
            <View direction="column" gap={2} align="center">
              <Text variant="body-2" align="center">
                Drop CSV file here, or
              </Text>
              <FileUpload.Trigger>
                <Button variant="outline" icon={<Icon svg={<Upload weight="bold" />} size={4} />}>
                  browse
                </Button>
              </FileUpload.Trigger>
            </View>
          </View>
        </FileUpload>
      ) : (
        <View
          padding={4}
          attributes={{
            style: {
              border: '1px solid var(--rs-color-border-neutral)',
              borderRadius: '8px',
              backgroundColor: 'var(--rs-color-background-neutral)',
            },
          }}
        >
          <View direction="column" gap={4} align="center" attributes={{ style: { width: '100%' } }}>
            <View direction="row" gap={2} align="center">
              <Icon svg={<FileCsv weight="bold" />} size={5} color="primary" />
              <Text variant="body-2" weight="medium">
                {file.name}
              </Text>
              <Text variant="caption-1" color="neutral-faded">
                ({(file.size / 1024).toFixed(2)} KB)
              </Text>
            </View>
            <View direction="row" gap={2}>
              <FileUpload
                name="csv-file-replace"
                onChange={handleFileSelect as any}
                inline
                variant="headless"
                inputAttributes={{ accept: '.csv,text/csv' }}
              >
                {(props) => (
                  <Button
                    variant="outline"
                    disabled={isUploading}
                    highlighted={props.highlighted}
                  >
                    Change File
                  </Button>
                )}
              </FileUpload>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                loading={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Audio Upload */}
      <View direction="column" gap={2}>
        <Text variant="body-1" weight="medium">
          Upload Audio
        </Text>
        <Text variant="body-2" color="neutral-faded">
          Upload call recordings or voice notes. We generate a mock transcription and route it through the ingestion flow.
        </Text>
      </View>

      {!audioFile ? (
        <FileUpload
          name="audio-file"
          onChange={handleAudioSelect as any}
          inputAttributes={{ accept: 'audio/*' }}
        >
          <View
            direction="column"
            gap={4}
            align="center"
            padding={6}
            attributes={{
              style: {
                border: '2px dashed var(--rs-color-border-neutral)',
                borderRadius: '8px',
                backgroundColor: 'var(--rs-color-background-neutral)',
                minHeight: '200px',
                justifyContent: 'center',
              },
            }}
          >
            <Icon svg={<Microphone weight="bold" />} size={8} color="neutral-faded" />
            <View direction="column" gap={2} align="center">
              <Text variant="body-2" align="center">
                Drop audio file here, or
              </Text>
              <FileUpload.Trigger>
                <Button variant="outline" icon={<Icon svg={<Upload weight="bold" />} size={4} />}>
                  browse
                </Button>
              </FileUpload.Trigger>
            </View>
          </View>
        </FileUpload>
      ) : (
        <View
          padding={4}
          attributes={{
            style: {
              border: '1px solid var(--rs-color-border-neutral)',
              borderRadius: '8px',
              backgroundColor: 'var(--rs-color-background-neutral)',
            },
          }}
        >
          <View direction="column" gap={4} align="center" attributes={{ style: { width: '100%' } }}>
            <View direction="row" gap={2} align="center">
              <Icon svg={<Microphone weight="bold" />} size={5} color="primary" />
              <Text variant="body-2" weight="medium">
                {audioFile.name}
              </Text>
              <Text variant="caption-1" color="neutral-faded">
                ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </Text>
            </View>
            <View direction="row" gap={2}>
              <FileUpload
                name="audio-file-replace"
                onChange={handleAudioSelect as any}
                inline
                variant="headless"
                inputAttributes={{ accept: 'audio/*' }}
              >
                {(props) => (
                  <Button
                    variant="outline"
                    disabled={isAudioUploading}
                    highlighted={props.highlighted}
                  >
                    Change File
                  </Button>
                )}
              </FileUpload>
              <Button
                onClick={handleAudioUpload}
                disabled={isAudioUploading}
                loading={isAudioUploading}
              >
                {isAudioUploading ? 'Uploading...' : 'Upload Audio'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleAudioReset}
                disabled={isAudioUploading}
              >
                Remove
              </Button>
            </View>
          </View>
        </View>
      )}

      {audioResult && (
        <View
          padding={4}
          attributes={{
            style: {
              border: `1px solid ${audioResult.success ? 'var(--rs-color-border-positive)' : 'var(--rs-color-border-critical)'}`,
              borderRadius: '8px',
              backgroundColor: audioResult.success
                ? 'var(--rs-color-background-positive)'
                : 'var(--rs-color-background-critical)',
            },
          }}
        >
          <View direction="row" gap={2} align="center">
            <Icon
              svg={audioResult.success ? <CheckCircle weight="fill" /> : <XCircle weight="fill" />}
              size={5}
              color={audioResult.success ? 'positive' : 'critical'}
            />
            <Text variant="body-2" weight="medium">
              {audioResult.message}
            </Text>
          </View>
        </View>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <View
          padding={4}
          attributes={{
            style: {
              border: `1px solid ${uploadResult.failed === 0 ? 'var(--rs-color-border-positive)' : 'var(--rs-color-border-critical)'}`,
              borderRadius: '8px',
              backgroundColor: uploadResult.failed === 0 
                ? 'var(--rs-color-background-positive)' 
                : 'var(--rs-color-background-critical)',
            },
          }}
        >
          <View direction="column" gap={3}>
            <View direction="row" gap={2} align="center">
              <Icon 
                svg={uploadResult.failed === 0 ? <CheckCircle weight="fill" /> : <XCircle weight="fill" />} 
                size={5} 
                color={uploadResult.failed === 0 ? 'positive' : 'critical'} 
              />
              <Text variant="body-2" weight="medium">
                Upload Complete
              </Text>
            </View>
            
            <View direction="column" gap={2}>
              <Text variant="body-2">
                Total rows: {uploadResult.total}
              </Text>
              <Text variant="body-2" color="positive">
                Successful: {uploadResult.success}
              </Text>
              {uploadResult.failed > 0 && (
                <Text variant="body-2" color="critical">
                  Failed: {uploadResult.failed}
                </Text>
              )}
            </View>

            {uploadResult.errors.length > 0 && (
              <View
                padding={3}
                attributes={{
                  style: {
                    backgroundColor: 'var(--rs-color-background-neutral)',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  },
                }}
              >
                <View direction="column" gap={1}>
                  <Text variant="caption-1" weight="medium">
                    Errors:
                  </Text>
                  {uploadResult.errors.map((error, index) => (
                    <Text key={index} variant="caption-1" color="critical">
                      {error}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

