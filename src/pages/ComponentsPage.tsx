import { useState } from 'react'
import {
  Container,
  Grid,
  Text,
  Button,
  Card,
  Badge,
  Avatar,
  Alert,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  TextArea,
  NumberField,
  Select,
  Slider,
  Progress,
  Loader,
  Skeleton,
  Tabs,
  Table,
  Breadcrumbs,
  Divider,
  Link as ReshapedLink,
  Modal,
  Popover,
  Accordion,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  DropdownMenu,
  FileUpload,
  FormControl,
  View,
  Icon,
  Image,
  useToast,
  ToastProvider,
} from 'reshaped'
import { 
  Sparkle, 
  House, 
  User, 
  Gear, 
  Heart,
  Star
} from '@phosphor-icons/react'
import './ComponentsPage.css'

function ComponentsPage() {
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [switchValue, setSwitchValue] = useState(false)
  const [sliderValue, setSliderValue] = useState(50)
  const [modalOpen, setModalOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('tab1')
  const [toggleValue, setToggleValue] = useState(['option1'])
  const { show: showToast } = useToast()

  const components = [
    {
      name: 'Button',
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button>Primary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button size="small">Small Button</Button>
        </div>
      ),
    },
    {
      name: 'Card',
      component: (
        <Card>
          <Text variant="body-1">Card Content</Text>
          <Text variant="body-2" color="neutral-faded">
            This is a card component
          </Text>
        </Card>
      ),
    },
    {
      name: 'Badge',
      component: (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge>Default</Badge>
          <Badge color="primary">Primary</Badge>
          <Badge color="positive">Positive</Badge>
          <Badge color="critical">Critical</Badge>
          <Badge color="warning">Warning</Badge>
        </div>
      ),
    },
    {
      name: 'Avatar',
      component: (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Avatar initials="AB" size={24} />
          <Avatar initials="CD" size={32} />
          <Avatar initials="EF" size={40} />
        </div>
      ),
    },
    {
      name: 'Alert',
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Alert>Info alert message</Alert>
          <Alert color="positive">Success alert message</Alert>
          <Alert color="warning">Warning alert message</Alert>
          <Alert color="critical">Error alert message</Alert>
        </div>
      ),
    },
    {
      name: 'Checkbox',
      component: (
        <Checkbox 
          name="checkbox-demo"
          checked={checkboxValue} 
          onChange={(args) => setCheckboxValue(args.checked)}
        >
          Checkbox option
        </Checkbox>
      ),
    },
    {
      name: 'Radio',
      component: (
        <RadioGroup 
          name="radio-demo"
          value={radioValue} 
          onChange={(args) => setRadioValue(args.value)}
        >
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
          <Radio value="option3">Option 3</Radio>
        </RadioGroup>
      ),
    },
    {
      name: 'Switch',
      component: (
        <Switch 
          name="switch-demo"
          checked={switchValue} 
          onChange={(args) => setSwitchValue(args.checked)}
        >
          Toggle switch
        </Switch>
      ),
    },
    {
      name: 'TextField',
      component: (
        <TextField name="text" placeholder="Enter text..." />
      ),
    },
    {
      name: 'TextArea',
      component: (
        <TextArea name="textarea" placeholder="Enter longer text..." />
      ),
    },
    {
      name: 'NumberField',
      component: (
        <NumberField 
          name="number" 
          placeholder="Enter number"
          increaseAriaLabel="Increase"
          decreaseAriaLabel="Decrease"
        />
      ),
    },
    {
      name: 'Select',
      component: (
        <Select
          name="select"
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ]}
          placeholder="Select an option"
        />
      ),
    },
    {
      name: 'Slider',
      component: (
        <Slider 
          name="slider-demo"
          value={sliderValue} 
          onChange={(args) => setSliderValue(args.value)}
        />
      ),
    },
    {
      name: 'Progress',
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <Progress value={30} />
          <Progress value={60} />
          <Progress value={90} />
        </div>
      ),
    },
    {
      name: 'Loader',
      component: (
        <Loader />
      ),
    },
    {
      name: 'Skeleton',
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <Skeleton width="100%" height={20} />
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={20} />
        </div>
      ),
    },
    {
      name: 'Tabs',
      component: (
        <Tabs value={selectedTab} onChange={(args) => setSelectedTab(args.value)}>
          <Tabs.List>
            <Tabs.Item value="tab1">Tab 1</Tabs.Item>
            <Tabs.Item value="tab2">Tab 2</Tabs.Item>
            <Tabs.Item value="tab3">Tab 3</Tabs.Item>
          </Tabs.List>
          <Tabs.Panel value="tab1">
            <Text>Content for Tab 1</Text>
          </Tabs.Panel>
          <Tabs.Panel value="tab2">
            <Text>Content for Tab 2</Text>
          </Tabs.Panel>
          <Tabs.Panel value="tab3">
            <Text>Content for Tab 3</Text>
          </Tabs.Panel>
        </Tabs>
      ),
    },
    {
      name: 'Table',
      component: (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Heading>Name</Table.Heading>
              <Table.Heading>Status</Table.Heading>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Item 1</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Item 2</Table.Cell>
              <Table.Cell>Inactive</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: 'Breadcrumbs',
      component: (
        <Breadcrumbs>
          <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/components">Components</Breadcrumbs.Item>
          <Breadcrumbs.Item>Current</Breadcrumbs.Item>
        </Breadcrumbs>
      ),
    },
    {
      name: 'Divider',
      component: (
        <div>
          <Text>Above divider</Text>
          <Divider />
          <Text>Below divider</Text>
        </div>
      ),
    },
    {
      name: 'Link',
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ReshapedLink href="/">Default Link</ReshapedLink>
          <ReshapedLink href="/" variant="plain">Plain Link</ReshapedLink>
        </div>
      ),
    },
    {
      name: 'Modal',
      component: (
        <>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal active={modalOpen} onClose={() => setModalOpen(false)}>
            <Modal.Title>Modal Title</Modal.Title>
            <div style={{ padding: '16px 0' }}>
              <Text>Modal content goes here</Text>
            </div>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </Modal>
        </>
      ),
    },
    {
      name: 'Popover',
      component: (
        <Popover active={popoverOpen} onClose={() => setPopoverOpen(false)}>
          <Popover.Trigger>
            {(attributes) => (
              <Button {...attributes} onClick={() => setPopoverOpen(!popoverOpen)}>
                Toggle Popover
              </Button>
            )}
          </Popover.Trigger>
          <Popover.Content>
            <Text>Popover content</Text>
          </Popover.Content>
        </Popover>
      ),
    },
    {
      name: 'Accordion',
      component: (
        <Accordion>
          <Accordion.Trigger>
            <Text>Section 1</Text>
          </Accordion.Trigger>
          <Accordion.Content>
            <Text>Content for section 1</Text>
          </Accordion.Content>
          <Accordion.Trigger>
            <Text>Section 2</Text>
          </Accordion.Trigger>
          <Accordion.Content>
            <Text>Content for section 2</Text>
          </Accordion.Content>
        </Accordion>
      ),
    },
    {
      name: 'Pagination',
      component: (
        <Pagination 
          total={100}
          previousAriaLabel="Previous"
          nextAriaLabel="Next"
        />
      ),
    },
    {
      name: 'ToggleButton',
      component: (
        <ToggleButtonGroup 
          value={toggleValue} 
          onChange={(args) => setToggleValue(args.value)}
        >
          <ToggleButton value="option1">Option 1</ToggleButton>
          <ToggleButton value="option2">Option 2</ToggleButton>
          <ToggleButton value="option3">Option 3</ToggleButton>
        </ToggleButtonGroup>
      ),
    },
    {
      name: 'MenuItem',
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '200px' }}>
          <MenuItem><House size={16} weight="bold" /> Home</MenuItem>
          <MenuItem><User size={16} weight="bold" /> Profile</MenuItem>
          <MenuItem><Gear size={16} weight="bold" /> Settings</MenuItem>
        </div>
      ),
    },
    {
      name: 'DropdownMenu',
      component: (
        <DropdownMenu>
          <DropdownMenu.Trigger>
            {(attributes) => <Button {...attributes}>Open Menu</Button>}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <MenuItem>Item 1</MenuItem>
            <MenuItem>Item 2</MenuItem>
            <MenuItem>Item 3</MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
    },
    {
      name: 'FileUpload',
      component: (
        <FileUpload name="file-upload-demo" />
      ),
    },
    {
      name: 'FormControl',
      component: (
        <FormControl>
          <FormControl.Label>Label</FormControl.Label>
          <TextField name="form-input" placeholder="Input field" />
          <FormControl.Helper>Helper text</FormControl.Helper>
        </FormControl>
      ),
    },
    {
      name: 'View',
      component: (
        <View padding={4} backgroundColor="neutral-faded" borderRadius="medium">
          <Text>View component with padding and background</Text>
        </View>
      ),
    },
    {
      name: 'Icon',
      component: (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Icon svg={<Sparkle weight="bold" />} size={20} />
          <Icon svg={<Heart weight="bold" />} size={24} />
          <Icon svg={<Star weight="bold" />} size={28} />
        </div>
      ),
    },
    {
      name: 'Image',
      component: (
        <Image
          src="/vite.svg"
          alt="Vite logo"
          width={64}
          height={64}
        />
      ),
    },
    {
      name: 'Text',
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Text variant="featured-1" weight="bold">Featured 1</Text>
          <Text variant="title-1">Title 1</Text>
          <Text variant="title-2">Title 2</Text>
          <Text variant="title-3">Title 3</Text>
          <Text variant="body-1">Body 1</Text>
          <Text variant="body-2">Body 2</Text>
        </div>
      ),
    },
  ]

  return (
    <ToastProvider>
      <div className="components-page">
        <Container>
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: '24px' }}>
              <Text variant="featured-1" weight="bold">
                Reshaped Components Showcase
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Text variant="body-1" color="neutral-faded">
                  A comprehensive grid of all available Reshaped UI components
                </Text>
              </div>
            </div>

            <Grid columns={{ s: 1, m: 2, l: 3 }} gap={6}>
              {components.map((item, index) => (
                <Card key={index} padding={4}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Text variant="title-3" weight="medium">
                      {item.name}
                    </Text>
                    <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                      {item.component}
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>

            <div style={{ marginTop: '32px', padding: '16px', textAlign: 'center' }}>
              <Button onClick={() => showToast({ text: 'Toast notification example!' })}>
                Show Toast Example
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </ToastProvider>
  )
}

export default ComponentsPage
