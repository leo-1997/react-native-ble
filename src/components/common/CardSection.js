import React from 'react';
import {View} from 'react-native';

const CardSection = props => {
  return (
    //when we put an array of styles, the style at
    //the most of right will over write style at left
    <View style={[styles.containerStyle, props.style]}>{props.children}</View>
  );
};

const styles = {
  containerStyle: {
    borderBottomWidth: 1,
    padding: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    flexDirection: 'row',
    borderColor: '#ffff',
    position: 'relative',
  },
};

export {CardSection};
