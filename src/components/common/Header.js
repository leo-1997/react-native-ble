import React from 'react';

import {Text, View} from 'react-native';

const Header = props => {
  const {viewStyle, textStyle} = styles;

  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{props.headerText}</Text>
    </View>
  );
};

const styles = {
  viewStyle: {
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    elevation: 1,
    position: 'relative',
  },
  textStyle: {
    fontSize: 20,
  },
};

export {Header};
