import React, {Component} from 'react';
import {Header, Button, CardSection} from '../components/common';
import {View, Text, Switch} from 'react-native';
import {connect} from 'react-redux';
import {FlatList} from 'react-native';
import ListItem from './ListItem';
import _ from 'lodash';

class SelectDevices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      heartRate: 0,
    };
  }

  _toggleSwitch = isScanning => {
    if (isScanning) {
      this.props.BluetoothManager.scan();
    } else {
      this.props.BluetoothManager.stopScan();
      if (this.props.bluetoothState === 'connected') {
        console.log('here!!!!!');
        this._disconnectAll();
      }
    }
  };

  _disconnectAll() {
    if (!_.isEmpty(this.props.connectedDevice)) {
      this.props.connectedDevice.forEach(
        this.props.BluetoothManager.disconnect,
      );
    }
  }

  _renderItem(item) {
    return (
      <ListItem
        selectedIndex={this.props.selectedIndex}
        itemIndex={item.index}
        connectBle={this.props.BluetoothManager.connect}
        item={item}
      />
    );
  }

  flatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '90%',
          marginStart: 20,
          backgroundColor: '#DCDCDC',
        }}
      />
    );
  };

  render() {
    const {bluetoothState, BLEList} = this.props;
    return (
      <View style={{flex: 1}}>
        <Header headerText="Select Devices" />
        <CardSection>
          <Text style={styles.textStyle}>
            Bluetooth Status: {bluetoothState}
          </Text>
        </CardSection>
        <CardSection Style={{flex: 0.02}}>
          <Text style={styles.textStyle}>Bluetooth</Text>
          <Switch
            onValueChange={this._toggleSwitch}
            value={
              bluetoothState === 'connected' ||
              bluetoothState === 'scanning' ||
              bluetoothState === 'connecting'
            }
          />
        </CardSection>
        <Text style={{textAlign: 'center'}}>Scan for 20 seconds</Text>
        <View style={{flex: 0.9}}>
          <FlatList
            data={BLEList}
            renderItem={this._renderItem.bind(this)}
            ItemSeparatorComponent={this.flatListItemSeparator}
            keyExtractor={device => {
              device.id.toString();
            }}
          />
        </View>
        <View style={{flex: 0.08, marginBottom: 5}}>
          <Button onPress={() => this.props.onClose()}>Exit</Button>
        </View>
      </View>
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
export default connect(mapStateToProps, {})(SelectDevices);
