import React, {Component} from 'react';
import {Card, Button, CardSection} from '../components/common';
import {Text, Modal} from 'react-native';
import {connect} from 'react-redux';
import {Alert, Platform, PermissionsAndroid, Switch} from 'react-native';
import FileModule from './FileModule';
import FileList from './FileList';
import BleModule from './BleModule';
import {
  addBLE,
  startScan,
  stopScan,
  initializeList,
  changeStatus,
  bleConnected,
  toDisconnectBle,
  bleDisconnected,
  updateHeartBeat,
} from '../actions';
import BleManager from 'react-native-ble-manager';
import SelectDevices from './SelectDevices';

const FileManager = new FileModule();
const BluetoothManager = new BleModule();

class Main extends Component {
  constructor(props) {
    super(props);
    this._handleBleListeners();
    this.state = {
      heartRate: 0,
      bluetoothPermission: '',
      bluetoothState: '',
      scanning: false,
      currentTime: null,
      modalFileListVisible: false,
      modalBleListVisible: false,
      recording: false,
      storedPath: '',
    };
  }

  _handleBleListeners() {
    this.numOfDevices = 0;
    // console.log('Adding ble listeners!!!');
    this.stopScanListener = BluetoothManager.addListener(
      'BleManagerStopScan',
      this.handleStopScan,
    );
    this.discoverPeripheralListener = BluetoothManager.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    this.connectPeripheralListener = BluetoothManager.addListener(
      'BleManagerConnectPeripheral',
      this.handleConnectPeripheral,
    );
    this.disconnectPeripheralListener = BluetoothManager.addListener(
      'BleManagerDisconnectPeripheral',
      this.handleDisconnectPeripheral,
    );
    this.updateValueListener = BluetoothManager.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValue,
    );
  }

  handleDiscoverPeripheral = device => {
    // console.log('Discovered new device! ' + device.id + ' ' + device.name);
    if (device.name != null) {
      this.props.addBLE(device);
    }
  };

  handleConnectPeripheral = args => {
    this.props.bleConnected(args.peripheral);
    BleManager.retrieveServices(args.peripheral).then(peripheralInfo => {
      BluetoothManager.getUUID(peripheralInfo);
      BluetoothManager.startNotification(peripheralInfo);
    });
  };

  handleDisconnectPeripheral = args => {
    this.props.bleDisconnected(args.peripheral);
    this.numOfDevices > 0 ? this.numOfDevices-- : 0;
    if (this.state.recording) {
      Alert.alert('Device has disconnected, stop recording!');
      this._toggleSwitch(false);
    }
    console.log('BleManagerDisconnectPeripheral:', args);
  };

  //Retrieve new data
  handleUpdateValue = data => {
    console.log('props inside selectDevices ', this.props);
    console.log('received data!', data);
    let index = this.props.connectedDevice.indexOf(data.peripheral);
    console.log(
      'data is ',
      data.peripheral,
      ' index is ',
      index,
      'map is ',
      this.props.connectedDevice,
    );
    if (data.value[0] === 44) {
      // Actxa Spark+ begins to transfer heartbeat value
      this.props.updateHeartBeat({value: data.value[1], index});
    } else if (data.value[0] === 16) {
      //Polar H10 begins to transfer heartbeat value
      this.props.updateHeartBeat({value: data.value[1], index});
    }
  };

  componentDidMount() {
    console.log('main page is mounted!!');
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

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return hour + '-' + minutes + '-' + seconds;
  };

  _getCurrentDay() {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let date = new Date().getDate();

    return date + '-' + month + '-' + year;
  }

  _setFileListModalVisible(visible) {
    this.setState({modalFileListVisible: visible});
  }

  onCloseFileListModal() {
    this.setState({modalFileListVisible: false});
  }

  _setBleListModalVisible(visible) {
    this.setState({modalBleListVisible: visible});
  }

  onCloseBleListModal() {
    this.setState({modalBleListVisible: false});
  }

  _toggleSwitch = recording => {
    let path = FileManager.getFilePath();
    console.log('recording file path is ', path);
    console.log(recording);

    if (recording) {
      if (path.length === 0 || this.props.connectedDevice.length === 0) {
        Alert.alert('Please create file and connect devices first!');
        return;
      } else {
        this.timer = setInterval(this._recordHeartbeat.bind(this), 1000);
      }
    } else {
      clearInterval(this.timer);
    }
    this.setState({recording: recording});
  };

  _recordHeartbeat() {
    if (this.props.bluetoothState == 'disconnected') {
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
          visible={this.state.modalBleListVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <SelectDevices
            onClose={() => {
              this.onCloseBleListModal();
            }}
            BluetoothManager={BluetoothManager}
          />
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalFileListVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <FileList
            onClose={() => {
              this.onCloseFileListModal();
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
              this._setFileListModalVisible(true);
            }}>
            Lookup Files
          </Button>
        </CardSection>
        <CardSection>
          <Button
            onPress={() => {
              this._setBleListModalVisible(true);
            }}>
            Scan
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
    BLEList: state.connect.BLEList,
    connectedDevice: state.connect.connectedDevice,
    bluetoothState: state.connect.status,
    selectedIndex: state.select,
  };
};

// eslint-disable-next-line prettier/prettier
export default connect(mapStateToProps, {
  addBLE,
  initializeList,
  stopScan,
  startScan,
  changeStatus,
  bleConnected,
  toDisconnectBle,
  bleDisconnected,
  updateHeartBeat,
})(Main);
