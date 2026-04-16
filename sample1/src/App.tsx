import { GovBanner, GridContainer, Header, Title } from '@trussworks/react-uswds'
import { ContactForm } from './forms/ContactForm'

function App() {
  return (
    <>
      <GovBanner />
      <Header basic>
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>RJSF + USWDS Sample</Title>
          </div>
        </div>
      </Header>
      <main id="main-content">
        <GridContainer className="margin-y-4">
          <ContactForm />
        </GridContainer>
      </main>
    </>
  )
}

export default App
