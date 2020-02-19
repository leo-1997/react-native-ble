import React, {Component} from 'react';
import {Card, Button, CardSection} from '../components/common';
import {Text} from 'react-native';
import {connect} from 'react-redux';
import {Platform, PermissionsAndroid} from 'react-native';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      heartRate: 0,
      bluetoothPermission: '',
      bluetoothState: '',
      scanning: false,
    };
  }

  componentDidMount() {
    this.handleLocationPermission();
  }

  async handleLocationPermission() {
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

  render() {
    const {textStyle, cardSectionStyle} = styles;
    let heartBeat = Number.parseInt(this.props.heartBeat, 0);

    return (
      <Card>
        <CardSection>
          <Button>Create Files</Button>
          <Button> Lookup Files</Button>
        </CardSection>

        <CardSection style={cardSectionStyle}>
          <Text style={textStyle}>Heart Rate</Text>
          <Text style={textStyle}>HeartBeat: {heartBeat}</Text>
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
    heartBeat: state.connect.heartBeats,
  };
};

// eslint-disable-next-line prettier/prettier
export default connect(mapStateToProps, {})(Main);
