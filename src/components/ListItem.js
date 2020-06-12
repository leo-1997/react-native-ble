import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {CardSection} from './common';
import {TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import {selectRow} from '../actions';
import {connect} from 'react-redux';

class ListItem extends Component {
  _onItemPress() {
    this.props.selectRow(this.props.itemIndex);
    this.props.connectBle(this.props.item.item.id);
  }

  render() {
    const {name, id} = this.props.item.item;
    const bleName = name === undefined ? 'Unknown Device' : name;
    return (
      <TouchableOpacity onPress={this._onItemPress.bind(this)}>
        <View>
          <CardSection>
            {this.props.selectedIndex.includes(this.props.itemIndex) ? (
              <Icon name="check" type="font-awesome" color="#0099cc" />
            ) : null}
            <CardSection
              style={{flexDirection: 'column', alignItems: 'center'}}>
              <Text style={styles.titleStyle}>{bleName}</Text>
              <Text style={styles.titleStyle}>{id}</Text>
            </CardSection>
          </CardSection>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = {
  titleStyle: {
    fontSize: 20,
  },
};

// eslint-disable-next-line prettier/prettier
export default connect(null, {selectRow})(ListItem);
