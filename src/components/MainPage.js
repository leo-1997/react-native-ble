import React, {Component} from 'react';
import {Card, Button, CardSection} from '../components/common';
import {Text, Modal} from 'react-native';
import {connect} from 'react-redux';
import {Alert, Platform, PermissionsAndroid, Switch} from 'react-native';
import FileModule from './FileModule';
import FileList from './FileList';

const FileManager = new FileModule();

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      heartRate: 0,
      bluetoothPermission: '',
      bluetoothState: '',
      scanning: false,
      currentTime: null,
      modalVisible: false,
      recording: false,
      storedPath: '',
    };
  }

  componentDidMount() {
    this._handleLocationPermission();
    FileManager.checkDir();
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  async _handleLocationPermission() {
    if (Platform.OS == 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: 'Heartbeat App Location Permission',
            message:
              'Heartbeat App needs access to your location ' +
              'to scan BLE devices',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the Location');
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }

  _getCurrentTime = () => {
    let hour = new Date().getHours();
    let minutes = new Date().getMinutes();
    let seconds = new Date().getSeconds();
    let am_pm = 'pm';

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    if (hour > 12) {
      hour = hour - 12;
    }

    if (hour == 0) {
      hour = 12;
    }

    if (new Date().getHours() < 12) {
      am_pm = 'am';
    }

    // this.setState({
    //   currentTime:
    //     new Date().getUTCFullYear() +
    //     ' ' +
    //     hour +
    //     ':' +
    //     minutes +
    //     ':' +
    //     seconds +
    //     ' ' +
    //     am_pm,
    // });
    // console.log(this.state.currentTime);
    return hour + ':' + minutes + ':' + seconds + ' ' + am_pm;
  };

  _getCurrentDay() {
    let year = new Date().getUTCFullYear();
    let month = new Date().getUTCMonth();
    let day = new Date().getUTCDay();

    return day + '-' + month + '-' + year;
  }

  _setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  onCloseModal() {
    this.setState({modalVisible: false});
  }

  _toggleSwitch = recording => {
    let path = FileManager.getFilePath();
    console.log('recording file path is ', path);
    console.log(recording);

    if (path.length === 0 || this.props.connectedDevice.length === 0) {
      Alert.alert('Please create file and connect devices first!');
    } else {
      this.setState({recording: recording});
      if (recording) {
        this.timer = setInterval(this._recordHeartbeat.bind(this), 1000);
      } else {
        clearInterval(this.timer);
      }
    }
  };

  _recordHeartbeat() {
    if (this.props.status == 'disconnected') {
      clearInterval(this.timer);
      this.setState({recording: false});
      return;
    }
    let message =
      this._getCurrentTime() +
      ' ' +
      Number.parseInt(this.props.heartBeat[0], 0) +
      ' ' +
      Number.parseInt(this.props.heartBeat[1], 0) +
      '\n';
    console.log('record!!! ', message);
    FileManager.writeFile(message);
  }

  render() {
    const {textStyle, cardSectionStyle} = styles;
    let heartBeat1 = Number.parseInt(this.props.heartBeat[0], 0);
    let heartBeat2 = Number.parseInt(this.props.heartBeat[1], 0);

    return (
      <Card>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <FileList
            onClose={() => {
              this.onCloseModal();
            }}
            fileManager={FileManager}
          />
        </Modal>
        <CardSection>
          <Button
            onPress={() => {
              FileManager.createFile(
                this._getCurrentDay(),
                this._getCurrentTime(),
              );
            }}>
            Create Files
          </Button>
          <Button
            onPress={() => {
              this._setModalVisible(true);
            }}>
            Lookup Files
          </Button>
        </CardSection>

        <CardSection>
          <Text>Recording</Text>
          <Switch
            onValueChange={this._toggleSwitch}
            value={this.state.recording}
          />
        </CardSection>
        <CardSection style={cardSectionStyle}>
          <Text style={textStyle}>Device1: {heartBeat1}</Text>
          <Text style={textStyle}>Device2: {heartBeat2}</Text>
        </CardSection>
      </Card>
    );
  }
}

const styles = {
  textStyle: {
    color: '#000',
    backgroundColor: '#ffff',
    fontSize: 20,
    padding: 10,
  },
  cardSectionStyle: {
    alignItems: 'center',
  },
};

const mapStateToProps = state => {
  return {
    heartBeat: state.connect.heartBeats,
    connectedDevice: state.connect.connectedDevice,
    status: state.connect.status,
  };
};

// eslint-disable-next-line prettier/prettier
export default connect(mapStateToProps, {})(Main);
