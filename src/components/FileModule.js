import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

const Heartbeat_records = 'Heartbeat_records';
const path =
  Platform.OS === 'ios'
    ? RNFS.LibraryDirectoryPath + '/' + Heartbeat_records
    : RNFS.ExternalDirectoryPath;

class FileModule {
  /**
   * Frequent file locations in iOS and Android
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
    // console.log('MainBundlePath: ', RNFS.MainBundlePath);
    // console.log('CachesDirectoryPath: ', RNFS.CachesDirectoryPath);
    // console.log('DocumentDirectoryPath: ', RNFS.DocumentDirectoryPath);
    // console.log('TemporaryDirectoryPath: ', RNFS.TemporaryDirectoryPath);
    // console.log('LibraryDirectoryPath: ', RNFS.LibraryDirectoryPath);
    // console.log('ExternalDirectoryPath: ', RNFS.ExternalDirectoryPath);
    // console.log(
    //   'ExternalStorageDirectoryPath: ',
    //   RNFS.ExternalStorageDirectoryPath,
    // );
    this.createFile = this.createFile.bind(this);
    this.filePath = '';
  }

  checkDir() {
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

  clearFilePath() {
    this.filePath = '';
  }

  getFilePath() {
    return this.filePath;
  }

  async createFile(day, time) {
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
      })
      .catch(err => {
        console.log(err.message);
      });
  }

  writeFile(message) {
    RNFS.write(this.filePath, message.toString(), -1, 'utf8').catch(error => {
      console.error(error);
    });
  }

  deleteFile(pathToDelete) {
    // create a path you want to delete
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
