import {Platform, NativeModules, NativeEventEmitter} from 'react-native';
import {startScan, stopScan, toConnectBle, toDisconnectBle} from '../actions';
import store from '../store';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class BleModule {
  constructor() {
    this.initUUID();
    console.log('BleModule started');
  }

  /**
   * 添加监听器
   * 所有监听事件如下
   * BleManagerStopScan：扫描结束监听
   * BleManagerDiscoverPeripheral：扫描到一个新设备
   * BleManagerDidUpdateState：蓝牙状态改变
   * BleManagerDidUpdateValueForCharacteristic：接收到新数据
   * BleManagerConnectPeripheral：蓝牙设备已连接
   * BleManagerDisconnectPeripheral：蓝牙设备已断开连接
   * */
  addListener(str, fun) {
    return bleManagerEmitter.addListener(str, fun);
  }

  /**
   * Scan for available peripherals for 10 seconds
   * */
  scan() {
    console.log('scan!!!!');
    store.dispatch(startScan());
  }

  /**
   * Stop the scanning.
   * */
  stopScan() {
    store.dispatch(stopScan());
  }

  /**
   * Converts UUID to full 128bit.
   *
   * @param {UUID} uuid 16bit, 32bit or 128bit UUID.
   * @returns {UUID} 128bit UUID.
   */
  fullUUID(uuid) {
    if (uuid.length === 4) {
    }
    if (uuid.length === 8) {
    }
  }

  initUUID() {
    this.readServiceUUID = [];
    this.readCharacteristicUUID = [];
    this.writeWithResponseServiceUUID = [];
    this.writeWithResponseCharacteristicUUID = [];
    this.writeWithoutResponseServiceUUID = [];
    this.writeWithoutResponseCharacteristicUUID = [];
    this.nofityServiceUUID = [];
    this.nofityCharacteristicUUID = [];
  }

  //Gather Notify、Read、Write、WriteWithoutResponse's serviceUUID和characteristicUUID
  getUUID(peripheralInfo) {
    this.readServiceUUID = [];
    this.readCharacteristicUUID = [];
    this.writeWithResponseServiceUUID = [];
    this.writeWithResponseCharacteristicUUID = [];
    this.writeWithoutResponseServiceUUID = [];
    this.writeWithoutResponseCharacteristicUUID = [];
    this.nofityServiceUUID = [];
    this.nofityCharacteristicUUID = [];
    for (let item of peripheralInfo.characteristics) {
      if (Platform.OS == 'android') {
        if (item.properties.Notify == 'Notify') {
          this.nofityServiceUUID.push(item.service);
          this.nofityCharacteristicUUID.push(item.characteristic);
        }
        if (item.properties.Read == 'Read') {
          this.readServiceUUID.push(item.service);
          this.readCharacteristicUUID.push(item.characteristic);
        }
        if (item.properties.Write == 'Write') {
          this.writeWithResponseServiceUUID.push(item.service);
          this.writeWithResponseCharacteristicUUID.push(item.characteristic);
        }
        if (item.properties.WriteWithoutResponse == 'WriteWithoutResponse') {
          this.writeWithoutResponseServiceUUID.push(item.service);
          this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
        }
      } else {
        //ios
        for (let property of item.properties) {
          if (property == 'Notify') {
            this.nofityServiceUUID.push(item.service);
            this.nofityCharacteristicUUID.push(item.characteristic);
          }
          if (property == 'Read') {
            this.readServiceUUID.push(item.service);
            this.readCharacteristicUUID.push(item.characteristic);
          }
          if (property == 'Write') {
            this.writeWithResponseServiceUUID.push(item.service);
            this.writeWithResponseCharacteristicUUID.push(item.characteristic);
          }
          if (property == 'WriteWithoutResponse') {
            this.writeWithoutResponseServiceUUID.push(item.service);
            this.writeWithoutResponseCharacteristicUUID.push(
              item.characteristic,
            );
          }
        }
      }
    }
    console.log('readServiceUUID', this.readServiceUUID);
    console.log('readCharacteristicUUID', this.readCharacteristicUUID);
    console.log(
      'writeWithResponseServiceUUID',
      this.writeWithResponseServiceUUID,
    );
    console.log(
      'writeWithResponseCharacteristicUUID',
      this.writeWithResponseCharacteristicUUID,
    );
    console.log(
      'writeWithoutResponseServiceUUID',
      this.writeWithoutResponseServiceUUID,
    );
    console.log(
      'writeWithoutResponseCharacteristicUUID',
      this.writeWithoutResponseCharacteristicUUID,
    );
    console.log('nofityServiceUUID', this.nofityServiceUUID);
    console.log('nofityCharacteristicUUID', this.nofityCharacteristicUUID);
  }

  /**
   * Attempts to connect to a peripheral.
   * */
  connect(id) {
    store.dispatch(toConnectBle(id));
  }

  /**
   * Disconnect from a peripheral.
   * */
  disconnect(id) {
    console.log('disconnecting ', id);
    store.dispatch(toDisconnectBle(id));
  }

  /**
   * Start the notification on the specified characteristic.
   * */
  startNotification(device, index = 0) {
    BleManager.startNotification(
      device.id,
      this.nofityServiceUUID[0],
      this.nofityCharacteristicUUID[0],
    )
      .then(() => {
        console.log('Notification started');
        setTimeout(() => {
          //Due to difference structure of received peripheral info in iOS and Android
          let indx = Platform.OS == 'android' ? 1 : 0;
          if (!device.name.includes('Polar')) {
            this.write(device.id, indx);
          }
        }, 500);
      })
      .catch(error => {
        console.log('Notification error:', error);
      });
  }

  write(peripheralId, index) {
    let command1 = '1901000000000000000000000000001A';
    let command2 = '2C01000000000000000000000000002D';
    setTimeout(() => {
      BleManager.write(
        peripheralId,
        this.writeWithResponseServiceUUID[index],
        this.writeWithResponseCharacteristicUUID[index],
        command1,
      )
        .then(
          setTimeout(() => {
            BleManager.write(
              peripheralId,
              this.writeWithResponseServiceUUID[index],
              this.writeWithResponseCharacteristicUUID[index],
              command2,
            );
          }, 500),
        )
        .catch(err => console.error(err));
    }, 500);
  }
}

export default BleModule;
