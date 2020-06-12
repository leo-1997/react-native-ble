import React, {Component} from 'react';
import {Card, Button, CardSection} from '../components/common';
import {View, Text, Modal, TouchableOpacity} from 'react-native';
import Toast from 'react-native-easy-toast';
import {connect} from 'react-redux';
import {Icon} from 'react-native-elements';
import {Alert, Platform, PermissionsAndroid} from 'react-native';
import FileModule from './FileModule';
import FileList from './FileList';
import BleModule from './BleModule';
import {
  addBLE,
  bleConnected,
  bleDisconnected,
  updateHeartBeat,
} from '../actions';
import BleManager from 'react-native-ble-manager';
import SelectDevices from './SelectDevices';

const FileManager = new FileModule();
const BluetoothManager = new BleModule();

/**
 * Main page of the App. Handle lookupFiles, scan and receive heartbeat operations
 * lookupFile functionality is achieved through FileModule and Bluetooth BLE scanning, connecting is achieved
 * through BleModule
 */
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
      // stopped / paused / recording
      recordingStatus: 'stopped',
      recording: false,
      storedPath: '',
      connectedDeviceName: [],
    };
  }

  /**
   * react-native-ble-manager uses bunch of listeners to handle all the Bluetooth connection events
   */
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
    if (device.name != null) {
      this.props.addBLE(device);
    }
  };

  handleConnectPeripheral = args => {
    this.props.bleConnected(args.peripheral);
    BleManager.retrieveServices(args.peripheral).then(peripheralInfo => {
      BluetoothManager.getUUID(peripheralInfo);
      BluetoothManager.startNotification(peripheralInfo);
      this.setState({
        connectedDeviceName: [
          ...this.state.connectedDeviceName,
          peripheralInfo.name,
        ],
      });
    });
  };

  handleDisconnectPeripheral = args => {
    this.props.bleDisconnected(args.peripheral);
    this.setState({
      connectedDeviceName: [],
    });
    this.numOfDevices > 0 ? this.numOfDevices-- : 0;
    if (
      this.state.recordingStatus === 'recording' ||
      this.state.recordingStatus === 'paused'
    ) {
      Alert.alert('Device has disconnected, stop recording!');
      this._onClickStopped();
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

  /**
   * In order to connect bluetooth, the app needs the permission to access location [Android only]
   */
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

  _onCloseFileListModal() {
    this.setState({modalFileListVisible: false});
  }

  _setBleListModalVisible(visible) {
    this.setState({modalBleListVisible: visible});
  }

  _onCloseBleListModal() {
    this.setState({modalBleListVisible: false});
  }

  _onClickRecording = () => {
    if (this.props.connectedDevice.length === 0) {
      Alert.alert('Please connect devices first!');
      return;
    }
    if (FileManager.getFilePath().length === 0) {
      FileManager.createFile(
        this._getCurrentDay(),
        this._getCurrentTime(),
      ).then(() => {
        this.refs.toast.show('New File Created!', 1000);
        this.timer = setInterval(this._recordHeartbeat.bind(this), 1000);
      });
    } else {
      this.timer = setInterval(this._recordHeartbeat.bind(this), 1000);
    }
    console.log('Recording');
    this.setState({
      recordingStatus: 'recording',
    });
  };

  _onClickPaused = () => {
    clearInterval(this.timer);
    console.log('paused');
    this.setState({
      recordingStatus: 'paused',
    });
  };

  _onClickStopped = () => {
    clearInterval(this.timer);
    FileManager.clearFilePath();
    console.log('Stopped');
    this.setState({
      recordingStatus: 'stopped',
    });
  };

  _recordHeartbeat() {
    if (this.props.bluetoothState === 'disconnected') {
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
      ' ' +
      Number.parseInt(this.props.heartBeat[2], 0) +
      ' ' +
      Number.parseInt(this.props.heartBeat[3], 0) +
      '\n';
    console.log('record!!! ', message);
    FileManager.writeFile(message);
  }

  render() {
    const {textStyle, cardSectionStyle} = styles;
    let heartBeat1 = Number.parseInt(this.props.heartBeat[0], 0);
    let heartBeat2 = Number.parseInt(this.props.heartBeat[1], 0);
    let heartBeat3 = Number.parseInt(this.props.heartBeat[2], 0);
    let heartBeat4 = Number.parseInt(this.props.heartBeat[3], 0);

    let device1Name = this.state.connectedDeviceName[0];
    let device2Name = this.state.connectedDeviceName[1];
    let device3Name = this.state.connectedDeviceName[2];
    let device4Name = this.state.connectedDeviceName[3];

    return (
      <Card>
        <Toast
          ref="toast"
          style={{backgroundColor: 'grey'}}
          position="top"
          positionValue={500}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
          textStyle={{color: 'white'}}
        />
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalBleListVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <SelectDevices
            onClose={() => {
              this._onCloseBleListModal();
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
              this._onCloseFileListModal();
            }}
            fileManager={FileManager}
          />
        </Modal>
        <CardSection>
          <Button
            onPress={() => {
              this._setFileListModalVisible(true);
            }}>
            Lookup Files
          </Button>
          <Button
            onPress={() => {
              this._setBleListModalVisible(true);
            }}>
            Scan
          </Button>
        </CardSection>
        <CardSection>
          <Text>Recoding Status: {this.state.recordingStatus}</Text>
        </CardSection>
        <CardSection>
          <TouchableOpacity
            disabled={this.state.recordingStatus === 'recording'}
            style={{paddingStart: 1}}
            onPress={this._onClickRecording}>
            <View>
              <Icon
                name="play"
                size={35}
                type="font-awesome"
                color={
                  this.state.recordingStatus === 'recording'
                    ? '#DCDCDC'
                    : '#0099cc'
                }
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={this.state.recordingStatus !== 'recording'}
            style={{paddingStart: 30}}
            onPress={this._onClickPaused}>
            <View>
              <Icon
                name="pause"
                size={35}
                type="font-awesome"
                color={
                  this.state.recordingStatus !== 'recording'
                    ? '#DCDCDC'
                    : '#0099cc'
                }
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={this.state.recordingStatus === 'stopped'}
            style={{paddingStart: 30}}
            onPress={this._onClickStopped}>
            <View>
              <Icon
                name="stop"
                size={35}
                type="font-awesome"
                color={
                  this.state.recordingStatus === 'stopped'
                    ? '#DCDCDC'
                    : '#0099cc'
                }
              />
            </View>
          </TouchableOpacity>
        </CardSection>
        <CardSection style={cardSectionStyle}>
          <Text style={textStyle}>
            {device1Name === undefined ? 'Device1' : device1Name}: {heartBeat1}{' '}
            BPM
          </Text>
          <Text style={textStyle}>
            {device2Name === undefined ? 'Device2' : device2Name}: {heartBeat2}{' '}
            BPM
          </Text>
          <Text style={textStyle}>
            {device3Name === undefined ? 'Device3' : device3Name}: {heartBeat3}{' '}
            BPM
          </Text>
          <Text style={textStyle}>
            {device4Name === undefined ? 'Device4' : device4Name}: {heartBeat4}{' '}
            BPM
          </Text>
        </CardSection>
        <Text style={{position: 'absolute', bottom: 0, right: 0}}>V1.1</Text>
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
    flexDirection: 'column',
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
  bleConnected,
  bleDisconnected,
  updateHeartBeat,
})(Main);
