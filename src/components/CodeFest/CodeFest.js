import React                from 'react';
import {
  Header,
  Image,
  Container,
  Grid
}                           from 'semantic-ui-react'

const CodeFest = () => (
  <div className="codefest">
    <div className="codefest-header" style={{paddingTop: 25, backgroundColor: "darkolivegreen"}}>
      <Grid centered stackable>
        <Grid.Column width={16}>
          <Header as='h2' icon style={{ width: "100%", color:"#fff" }}>
            <div className="ui icon" style={{ width: "100%"}}>
              <Image centered src="./codefest_logo.png" size="small" className="codefest-logo" />
            </div>
            Welcome to the CodeFest
            <Header.Subheader style={{ color:"#fff" }}>
              This is our React-Boilerplate
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid>
    </div>
    <div className="codefest-body">
      <Container>

      </Container>
    </div>
  </div>

)

export default CodeFest
