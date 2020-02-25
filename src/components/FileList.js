import React, {Component} from 'react';
import {Button, CardSection, Header} from './common';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import Share from 'react-native-share';

class FileList extends Component {
  constructor() {
    super();
    this.state = {
      fileList: [],
    };
  }

  componentDidMount() {
    this.fetchFileList();
  }

  async fetchFileList() {
    try {
      const response = await this.props.fileManager.readDir();
      console.log('response is ', response);
      this.setState({fileList: response});
    } catch (error) {
      console.log(error);
    }
  }

  deleteFile(path) {
    this.props.fileManager.deleteFile(path).then(this.fetchFileList());
  }

  onClick(item) {
    let options = {
      title: 'React Native',
      type: 'application/pdf',
      url: 'file://' + item.item.path,
      showAppsToView: true,
    };

    console.log('Shared url is ', options.url);

    Share.open(options)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err);
      });
  }

  renderItem = item => {
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => this.onClick(item)}>
          <View>
            <CardSection style={styles.item}>
              <Text>{item.item.name}</Text>
            </CardSection>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderHiddenItem = item => {
    return (
      <View style={styles.rowBack}>
        <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
          <Text
            style={styles.backTextWhite}
            onPress={() => this.deleteFile(item.item.path)}>
            Delete
          </Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Header headerText="Files" />
        <View style={{flex: 0.95}}>
          <SwipeListView
            disableRightSwipe
            data={this.state.fileList.sort(
              (a, b) => new Date(b.mtime) - new Date(a.mtime),
            )}
            renderItem={this.renderItem}
            renderHiddenItem={this.renderHiddenItem}
            rightOpenValue={-75}
            showsVerticalScrollIndicator={true}
            keyExtractor={(item, index) => {
              return item.name;
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

const styles = StyleSheet.create({
  backTextWhite: {
    color: '#FFF',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: 'red',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  item: {
    backgroundColor: '#fff',
    padding: 8,
    borderBottomColor: '#DCDCDC',
    justifyContent: 'flex-start',
  },
});

export default FileList;
