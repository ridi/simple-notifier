const React = require('react');
const PropTypes = require('prop-types');

const Row = require('react-bootstrap/lib/Row');
const Col = require('react-bootstrap/lib/Col');
const Layout = require('./Layout');

class Error extends React.Component {
  render() {
    return (
      <Layout>
        <div className="error-panel">
          <div className="error-status">{this.props.statusCode}</div>
          <div className="error-code">{this.props.code}</div>
          <div className="error-detail">{this.props.message}</div>
        </div>
      </Layout>
    );
  }
}

Error.defaultProps = {
  statusCode: 0,
  code: 'Unknown Error',
  message: '',
};

Error.propTypes = {
  statusCode: PropTypes.number,
  code: PropTypes.string,
  message: PropTypes.string,
};

module.exports = Error;
