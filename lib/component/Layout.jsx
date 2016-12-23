const React = require('react');

const Navbar = require('react-bootstrap/lib/Navbar');
const Nav = require('react-bootstrap/lib/Nav');
const NavItem = require('react-bootstrap/lib/NavItem');

const Grid = require('react-bootstrap/lib/Grid');
const Row = require('react-bootstrap/lib/Row');
const Col = require('react-bootstrap/lib/Col');
const Button = require('react-bootstrap/lib/Button');

// TODO Login/Logout 버튼
class Layout extends React.Component {
  render() {
    let button;
    if (this.props.auth && this.props.auth.isAuthenticated) {
      button = <NavItem href="/logout">Logout {this.props.auth.credentials.username}</NavItem>;
    } else {
      button = <NavItem href="/login">Login</NavItem>;
    }
    return (
      <html lang="ko">
        <head>
          <title>{this.props.title}</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
        </head>
        <body>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>
                Notifications
              </Navbar.Brand>
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight>
                {button}
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Grid>
            <Row id="app-mount" />
          </Grid>
          <script id="app-state" dangerouslySetInnerHTML={{ __html: this.props.state }} />
          <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" />
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" />
          <script src="https://unpkg.com/react@15/dist/react.min.js" />
          <script src="https://unpkg.com/react-dom@15/dist/react-dom.min.js" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.30.7/react-bootstrap.min.js" />
          <script src="/public/client.bundle.js" />
        </body>
      </html>
    );
  }
}

module.exports = Layout;
