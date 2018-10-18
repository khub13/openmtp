'use strict';

export const processMtpBuffer = ({ error, stderr }) => {
  const errorDictionary = {
    noMtp: `No MTP device found.`,
    common: `Oops.. Your MTP device has gone crazy! Try again.`,
    unResponsive: `MTP device is not responding. Reload or reconnect device.`,
    mtpStorageNotAccessible: `MTP storage not accessible.`
  };

  const errorTpl = {
    noMtp: `No MTP device found`,
    invalidObjectHandle: `invalid response code InvalidObjectHandle`,
    invalidStorageID: `invalid response code InvalidStorageID`,
    fileNotFound: `could not find`,
    noFilesSelected: `No files selected`,
    invalidPath: `Invalid path`,
    writePipe: `WritePipe`,
    mtpStorageNotAccessible1: `MTP storage not accessible`,
    mtpStorageNotAccessible2: `error: storage`
  };

  const errorStringified = (error !== null && error.toString()) || '';
  const stderrStringified = (stderr !== null && stderr.toString()) || '';

  if (!errorStringified || !stderrStringified) {
    return {
      error: null,
      throwAlert: false,
      status: true
    };
  }

  const checkError = errorTplKey => {
    return (
      stderrStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1 ||
      errorStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1
    );
  };

  if (
    /*No MTP device found*/
    checkError('noMtp')
  ) {
    return {
      error: errorDictionary.noMtp,
      throwAlert: false,
      status: false
    };
  } else if (
    /*error: Get: invalid response code InvalidObjectHandle (0x2009)*/
    checkError('invalidObjectHandle')
  ) {
    return {
      error: errorDictionary.unResponsive,
      throwAlert: true,
      status: false
    };
  } else if (
    /*error: Get: invalid response code InvalidStorageID*/
    checkError('invalidStorageID')
  ) {
    return {
      error: errorDictionary.unResponsive,
      throwAlert: true,
      status: false
    };
  } else if (
    /*error: (*interface)->WritePipe(interface, ep->GetRefIndex(), buffer.data(), r): error 0xe00002eb*/
    checkError('writePipe')
  ) {
    return {
      error: errorDictionary.unResponsive,
      throwAlert: true,
      status: false
    };
  } else if (
    /*MTP storage not accessible*/
    checkError('mtpStorageNotAccessible1') ||
    checkError('mtpStorageNotAccessible2')
  ) {
    return {
      error: errorDictionary.mtpStorageNotAccessible,
      throwAlert: true,
      status: false
    };
  } else if (
    /*Path not found*/
    checkError('fileNotFound')
  ) {
    return {
      error: sanitizeErrors(stderrStringified),
      throwAlert: true,
      status: true
    };
  } else if (
    /*No files selected*/
    checkError('noFilesSelected') ||
    checkError('invalidPath')
  ) {
    return {
      error: errorStringified,
      throwAlert: true,
      status: true
    };
  } else {
    /*common errors*/
    return {
      error: errorDictionary.common,
      throwAlert: true,
      status: true
    };
  }
};

export const processLocalBuffer = ({ error, stderr }) => {
  const errorDictionary = {
    noPerm: `Operation not permitted.`,
    commandFailed: `Could not complete! Try again.`,
    common: `Oops.. Your device has gone crazy! Try again.`,
    unResponsive: `Device is not responding! Reload`,
    invalidPath: `Invalid path`
  };

  const errorTpl = {
    noPerm1: `Operation not permitted`,
    noPerm2: `Permission denied`,
    commandFailed: `Command failed`
  };

  const errorStringified = (error !== null && error.toString()) || '';
  const stderrStringified = (stderr !== null && stderr.toString()) || '';

  if (!errorStringified || !stderrStringified) {
    return {
      error: null,
      throwAlert: false
    };
  }

  const checkError = errorTplKey => {
    return (
      stderrStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1 ||
      errorStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1
    );
  };

  if (
    /*No Permission*/
    checkError('noPerm1') ||
    checkError('noPerm2')
  ) {
    return {
      error: errorDictionary.noPerm,
      throwAlert: true
    };
  } else if (
    /*Command failed*/
    checkError('commandFailed')
  ) {
    return {
      error: errorDictionary.commandFailed,
      throwAlert: true
    };
  } else if (
    /*No files selected*/
    checkError('invalidPath')
  ) {
    return {
      error: errorStringified,
      throwAlert: true
    };
  } else {
    /*common errors*/
    return {
      error: errorDictionary.common,
      throwAlert: true
    };
  }
};

const sanitizeErrors = string => {
  if (string === null) {
    return `Oops.. Try again`;
  }
  string = string.replace(/^(error: )/, '').trim();

  return string.charAt(0).toUpperCase() + string.slice(1);
};
