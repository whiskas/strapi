import React from 'react'
import {buildFileTree, Directory} from "./file-manager";

export const useFilesFromSandbox = (id: string, callback: (dir: Directory) => void) => {
  React.useEffect(() => {
    fetch('/web_file_editor/get_directory')
      .then(response => response.json())
      .then(async ({data}) => {
        const rootDir = await buildFileTree(data);
        callback(rootDir)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // const response = await fetch('/web_file_editor/get_directory');
  // const rootDir: Directory = await response.json();


}
