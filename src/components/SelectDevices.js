import React, {Component} from 'react';
import {Card, CardSection} from '../components/common';
import {Text, Switch} from 'react-native';
import {connect} from 'react-redux';
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
import {FlatList} from 'react-native';
import ListItem from './ListItem';
import _ from 'lodash';
import BleManager from 'react-native-ble-manager';
import BleModule from './BleModule';

const BluetoothManager = new BleModule();

class SelectDevices extends Component {
  constructor(props) {
    super(props);
    this.peripheralId = '';
    this.state = {
      heartRate: 0,
    };
  }

  componentDidMount() {
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

  handleStopScan() {
    console.log('BleManagerStopScan:', 'Scanning is stopped');
  }

  handleDiscoverPeripheral = device => {
    console.log('Discovered new device! ' + device.id + ' ' + device.name);
    if (device.name != null) {
      this.props.addBLE(device);
    }
  };

  handleConnectPeripheral = args => {
    this.props.bleConnected(args.peripheral);
    this.peripheralId = args.peripheral;
    BleManager.retrieveServices(args.peripheral).then(peripheralInfo => {
      console.log('peripheral info is ', peripheralInfo);
      BluetoothManager.getUUID(peripheralInfo);
      BluetoothManager.startNotification(args.peripheral);
    });
  };

  handleDisconnectPeripheral = args => {
    this.props.bleDisconnected(args.peripheral);
    console.log('BleManagerDisconnectPeripheral:', args);
  };

  //Retrieve new data
  handleUpdateValue = data => {
    console.log('props inside selectDevices ', this.props);
    console.log('received data!', data);
    let index = this.props.connectedDevice.indexOf(data.peripheral);
    if (data.value[0] === 44) {
      // Actxa Spark+ begins to transfer heartbeat value
      this.props.updateHeartBeat({value: data.value[1], index});
    } else if (data.value[0] === 16) {
      //Polar H10 begins to transfer heartbeat value
      this.props.updateHeartBeat({value: data.value[1], index});
    }
  };

  _toggleSwitch = isScanning => {
    if (isScanning) {
      BluetoothManager.scan();
    } else {
      BluetoothManager.stopScan();
      if (!_.isEmpty(this.props.connectedDevice)) {
        this.props.connectedDevice.forEach(BluetoothManager.disconnect);
      }
    }
  };

  _renderItem(item) {
    return (
      <ListItem
        selectedIndex={this.props.selectedIndex}
        itemIndex={item.index}
        connectBle={BluetoothManager.connect}
        item={item}
      />
    );
  }

  render() {
    const {bluetoothState, BLEList} = this.props;
    return (
      <Card>
        <CardSection>
          <Text>Bluetooth Status: {bluetoothState}</Text>
        </CardSection>
        <CardSection style={styles.cardSectionStyle}>
          <Text>Bluetooth</Text>
          <Switch
            onValueChange={this._toggleSwitch}
            value={
              bluetoothState === 'connected' ||
              bluetoothState === 'scanning' ||
              bluetoothState === 'connecting'
            }
          />
        </CardSection>
        <CardSection>
          <FlatList
            data={BLEList}
            renderItem={this._renderItem.bind(this)}
            keyExtractor={device => {
              device.id.toString();
            }}
          />
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
    flexDirection: 'column',
    alignItems: 'center',
  },
};

const mapStateToProps = state => {
  return {
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
})(SelectDevices);
