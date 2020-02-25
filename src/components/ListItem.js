import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {CardSection} from './common';
import {TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import {toConnectBle, selectRow} from '../actions';
import {connect} from 'react-redux';

class ListItem extends Component {
  _onItemPress() {
    console.log('pressed index:', this.props.itemIndex);
    this.props.selectRow(this.props.itemIndex);
    this.props.connectBle(this.props.item.item.id);
  }

  render() {
    const {name} = this.props.item.item;
    // console.log('props is ', this.props);
    const bleName = name === undefined ? 'Unknown Device' : name;
    // console.log('name is ', name);
    return (
      <TouchableOpacity onPress={this._onItemPress.bind(this)}>
        <View>
          <CardSection>
            {this.props.selectedIndex.includes(this.props.itemIndex) ? (
              <Icon name="check" type="font-awesome" color="#0099cc" />
            ) : null}
            <Text style={styles.titleStyle}>{bleName}</Text>
          </CardSection>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = {
  titleStyle: {
    fontSize: 20,
    paddingLeft: 15,
  },
};

// eslint-disable-next-line prettier/prettier
export default connect(null, {toConnectBle, selectRow})(ListItem);
