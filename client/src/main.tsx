import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/carousel/styles.css'
import App from './App'
import './styles.css'

const theme = createTheme({
  primaryColor: 'teal',
  fontFamily: 'League Spartan, sans-serif',
  headings: { fontFamily: 'League Spartan, sans-serif' },
  defaultRadius: 'md',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>,
)
