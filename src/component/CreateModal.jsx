const React = require('react');

const Modal = require('./Modal');
const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const HelpBlock = require('react-bootstrap/lib/HelpBlock');
const Row = require('react-bootstrap/lib/Row');
const Col = require('react-bootstrap/lib/Col');

const Selectize = require('react-selectize');
const DateTime = require('react-datetime');

const moment = require('moment');
const axios = require('axios');
const util = require('../util');

const SimpleSelect = Selectize.SimpleSelect;
const MultiSelect = Selectize.MultiSelect;

const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm';

class CreateModal extends React.Component {
  constructor(props) {
    super(props);
    const self = this;

    this.defaultData = Object.freeze({
      type: props.options.statusTypes[0],
      startTime: moment(),
      endTime: moment().add(2, 'hours'),
      deviceType: [],
      deviceVersionComparator: props.options.comparators[0],
      deviceVersion: '',
      appVersionComparator: props.options.comparators[0],
      appVersion: '',
      contents: '',
    });

    this.state = {
      title: '새로운 알림 등록',
      mode: 'add',
      startTimeState: null,
      endTimeState: null,
      deviceVersionDisabled: true,
      appVersionDisabled: true,
      deviceVersionComparatorDisabled: false,
      appVersionComparatorDisabled: false,
    };

    Object.assign(this.state, this.defaultData);

    this.modes = {
      add: {
        title: '새로운 알림 등록',
        buttons: [
          { label: '저장', onClick: (e, modal) => self.onSave(false, modal), style: 'primary' },
          { label: '저장과 함께 활성화', onClick: (e, modal) => self.onSave(true, modal) },
          { label: '닫기', onClick: (e, modal) => modal.close(true) },
        ],
      },
      modify: {
        title: '알림 업데이트',
        buttons: [
          { label: '업데이트', onClick: (e, modal) => self.onSave(false, modal), style: 'primary' },
          { label: '업데이트와 함께 활성화', onClick: (e, modal) => self.onSave(true, modal) },
          { label: '닫기', onClick: (e, modal) => modal.close(true) },
        ],
      },
    };
  }

  onSave(withActivation, modal) {
    const self = this;
    const data = {
      type: this.state.type.value,
      deviceType: this.state.deviceType.map(dt => dt.value),
      deviceVersion: [this.state.deviceVersionComparator.value]
        .concat((this.state.deviceVersionComparator.value !== '*' && this.state.deviceVersion) ? this.state.deviceVersion.split('.') : []),
      appVersion: [this.state.appVersionComparator.value]
        .concat((this.state.appVersionComparator.value !== '*' && this.state.appVersion) ? this.state.appVersion.split('.') : []),
      startTime: util.formatDate(this.state.startTime),
      endTime: util.formatDate(this.state.endTime),
      contents: this.state.contents,
      isActivated: withActivation,
    };

    if (this.state.mode !== 'add') {
      data._id = this.state._id;
    }

    const api = (this.state.mode === 'add')
      ? axios.post('/api/v1/status', data)
      : axios.put(`/api/v1/status/${data._id}`, data);

    api.then((response) => {
      if (typeof self.props.onSuccess === 'function') {
        self.props.onSuccess();
      }
      self.modal.close();
      console.log(`Add Status Success: ${response}`);
    }).catch(() => self.modal.message('저장 도중 에러가 발생했습니다. 다시 시도해주세요.', 'warning'));
  }

  show(mode, data) {
    this.setState({ mode });
    this.resolveData(data);
    this.modal.show();
  }

  onStartTimeChanged(startTime) {
    this.setState({ startTime });
    if (this.state.endTime.isSameOrBefore(startTime)) {
      this.setState({ endTimeState: 'error' });
      return;
    }
    this.setState({ endTimeState: null });
  }

  resolveData(data) {
    let newData = {};
    if (data) {
      newData = {
        _id: data._id,
        type: this.props.options.statusTypes.find(o => o.value === data.type),
        deviceType: this.props.options.deviceTypes.filter(o => data.deviceType.includes(o.value)),
        deviceVersionComparator: this.props.options.comparators.find(o => o.value === data.deviceVersion[0]),
        deviceVersion: data.deviceVersion.length > 1 ? data.deviceVersion.slice(1).join('.') : '',
        appVersionComparator: this.props.options.comparators.find(o => o.value === data.appVersion[0]),
        appVersion: data.appVersion.length > 1 ? data.appVersion.slice(1).join('.') : '',
        startTime: moment(data.startTime),
        endTime: moment(data.endTime),
        contents: data.contents,
        isActivated: data.isActivated,
      };
    }

    this.setState(Object.assign({}, this.defaultData, newData), () => this.onSelectionChanged());
  }

  onEndTimeChanged(endTime) {
    if (typeof endTime === 'string' || endTime.isSameOrBefore(this.state.startTime)) {
      this.setState({ endTime, endTimeState: 'error' });
      return;
    }
    this.setState({ endTime, endTimeState: null });
  }

  isValidRange(startTime, endTime) {
    if (!startTime || !endTime) {
      return true;
    }
    return moment(startTime).isBefore(endTime);
  }

  onSelectionChanged() {
    if (this.state.deviceType.length > 1) {
      // disable device version, app version inputs
      this.setState({
        appVersionDisabled: true,
        appVersionComparatorDisabled: true,
        deviceVersionDisabled: true,
        deviceVersionComparatorDisabled: true,
      });
    } else {
      this.setState({
        appVersionDisabled: this.state.appVersionComparator.value === '*',
        appVersionComparatorDisabled: false,
        deviceVersionDisabled: this.state.deviceVersionComparator.value === '*',
        deviceVersionComparatorDisabled: false,
      });
    }
  }

  onComparatorChanged(selected, target) {
    this.setState({ [`${target}Comparator`]: selected }, () => this.onSelectionChanged());
  }

  onDeviceTypeChanged(deviceType) {
    this.setState({ deviceType }, () => this.onSelectionChanged());
  }

  render() {
    return (
      <Modal title={this.modes[this.state.mode].title} ref={(modal) => { this.modal = modal; }} buttons={this.modes[this.state.mode].buttons}>
        <FormGroup controlId="type">
          <ControlLabel>알람 타입</ControlLabel>
          <SimpleSelect value={this.state.type} onValueChange={type => this.setState({ type })} placeholder="알람 타입을 선택하세요" options={this.props.options.statusTypes} />
        </FormGroup>
        <Row>
          <Col xs={6}>
            <FormGroup validationState={this.state.startTimeState}>
              <ControlLabel>시작일시</ControlLabel>
              <DateTime
                value={this.state.startTime}
                placeholder="Start Time"
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                onChange={startTime => this.onStartTimeChanged(startTime)}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup validationState={this.state.endTimeState}>
              <ControlLabel>종료일시</ControlLabel>
              <DateTime
                value={this.state.endTime}
                placeholder="End Time"
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                isValidDate={current => this.isValidRange(this.state.startTime, current)}
                onChange={endTime => this.onEndTimeChanged(endTime)}
                onBlur={endTime => this.onEndTimeChanged(endTime)}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <HelpBlock>시작/종료일시의 기본값은 현재부터 2시간으로 설정되어 있습니다.</HelpBlock>
        </Row>
        <FormGroup controlId="deviceType">
          <ControlLabel>타겟 디바이스 타입</ControlLabel>
          <MultiSelect
            values={this.state.deviceType}
            onValuesChange={deviceType => this.onDeviceTypeChanged(deviceType)}
            placeholder="디바이스 타압을 선택하세요"
            options={this.props.options.deviceTypes}
          />
        </FormGroup>
        <FormGroup controlId="deviceVersionComparator">
          <ControlLabel>타겟 디바이스 버전</ControlLabel>
          <Row>
            <Col xs={6}>
              <SimpleSelect
                value={this.state.deviceVersionComparator}
                onValueChange={deviceVersionComparator => this.onComparatorChanged(deviceVersionComparator, 'deviceVersion')}
                options={this.props.options.comparators}
                disabled={this.state.deviceVersionComparatorDisabled}
              />
            </Col>
            <Col xs={6}>
              <FormControl
                type="text"
                value={this.state.deviceVersion}
                onChange={e => this.setState({ deviceVersion: e.target.value })}
                placeholder="Device Version"
                disabled={this.state.deviceVersionDisabled}
              />
            </Col>
          </Row>
        </FormGroup>
        <FormGroup controlId="appVersion">
          <ControlLabel>앱 버전</ControlLabel>
          <Row>
            <Col xs={6}>
              <SimpleSelect
                value={this.state.appVersionComparator}
                onValueChange={appVersionComparator => this.onComparatorChanged(appVersionComparator, 'appVersion')}
                options={this.props.options.comparators}
                disabled={this.state.appVersionComparatorDisabled}
              />
            </Col>
            <Col xs={6}>
              <FormControl
                type="text"
                value={this.state.appVersion}
                onChange={e => this.setState({ appVersion: e.target.value })}
                placeholder="App Version"
                disabled={this.state.appVersionDisabled}
              />
            </Col>
          </Row>
        </FormGroup>
        <FormGroup controlId="content">
          <ControlLabel>내용</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={this.state.contents}
            onChange={e => this.setState({ contents: e.target.value })}
            placeholder="Content"
          />
        </FormGroup>
      </Modal>
    );
  }
}

CreateModal.propTypes = {
  options: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.string))),
};

module.exports = CreateModal;

