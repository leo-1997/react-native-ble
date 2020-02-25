import RNFS from 'react-native-fs';
import {Alert, Platform} from 'react-native';

const Heartbeat_records = 'Heartbeat_records';
const path =
  Platform.OS === 'ios'
    ? RNFS.LibraryDirectoryPath + '/' + Heartbeat_records
    : RNFS.ExternalDirectoryPath + '/' + Heartbeat_records;

class FileModule {
  /**
   * 常用文件存储目录(ios与android)
   *
   * RNFS.MainBundlePath (not available on Android)
   * RNFS.CachesDirectoryPath (absolute path of Cache Directory)
   * RNFS.DocumentDirectoryPath (not available on iOS)
   * RNFS.TemporaryDirectoryPath (same with Cache Directory on Android)
   * RNFS.LibraryDirectoryPath (not available on Android)
   * RNFS.ExternalDirectoryPath (not available on iOS)
   * RNFS.ExternalStorageDirectoryPath (not available on iOS)
   */

  constructor() {
    console.log('MainBundlePath: ', RNFS.MainBundlePath);
    console.log('CachesDirectoryPath: ', RNFS.CachesDirectoryPath);
    console.log('DocumentDirectoryPath: ', RNFS.DocumentDirectoryPath);
    console.log('TemporaryDirectoryPath: ', RNFS.TemporaryDirectoryPath);
    console.log('LibraryDirectoryPath: ', RNFS.LibraryDirectoryPath);
    console.log('ExternalDirectoryPath: ', RNFS.ExternalDirectoryPath);
    console.log(
      'ExternalStorageDirectoryPath: ',
      RNFS.ExternalStorageDirectoryPath,
    );
    this.createFile = this.createFile.bind(this);
    this.filePath = '';
  }

  checkDir() {
    console.log('path is ', path);
    RNFS.exists(path).then(result => {
      if (!result) {
        RNFS.mkdir(path)
          .then(console.log('Directory created'))
          .catch(error => console.log(error));
      }
    });
  }

  readDir() {
    return RNFS.readDir(path);
  }

  getFilePath() {
    return this.filePath;
  }

  createFile(day, time) {
    let filePath = path + '/' + day + ' ' + time + '.txt';
    console.log('path is ', filePath);
    RNFS.writeFile(
      filePath,
      'Heartbeat record ' + day + ' ' + time + '\n',
      'utf8',
    )
      .then(success => {
        this.filePath = filePath;
        console.log('FILE CREATED' + ' ' + filePath);
        Alert.alert(
          'New File has been Created',
          '',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      })
      .catch(err => {
        console.log(err.message);
      });
  }

  writeFile(message) {
    console.log('writing to file ', this.filePath);
    RNFS.write(this.filePath, message.toString(), -1, 'utf8')
      .then(success => {
        console.log('Message written');
      })
      .catch(error => {
        console.err(error);
      });
  }

  deleteFile(pathToDelete) {
    // create a path you want to delete
    // var path = RNFS.DocumentDirectoryPath + '/test.txt';

    return (
      RNFS.unlink(pathToDelete)
        .then(() => {
          console.log('FILE DELETED');
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log(err.message);
        })
    );
  }
}

export default FileModule;
