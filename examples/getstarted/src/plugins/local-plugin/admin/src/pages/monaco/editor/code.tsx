import React, { useRef } from 'react'
import Editor from "@monaco-editor/react";
// import { initVimMode } from 'monaco-vim';
import {File} from "../utils/file-manager";
import styled from "@emotion/styled";

export const Code = ({selectedFile}: { selectedFile: File | undefined }) => {
  if (!selectedFile)
    return null

  const editorRef = useRef(null);

  // Initialize Vim mode
  const statusNode = document.createElement('div'); // Optional: Vim status bar
  document.body.appendChild(statusNode);

  const code = selectedFile.content
  let language = selectedFile.extension;
  // let language = selectedFile.name.split('.').pop()

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript"
  else if (language === "svelte")
    language = "html"

  function handleEditorDidMount(editor, monaco) {
    // here is the editor instance
    // you can store it in `useRef` for further usage
    editorRef.current = editor;
  }

  function handleEditorWillMount(monaco: any) {
    // here is the monaco instance
    // do something before editor is mounted
    console.log('register svelte', monaco);
    monaco.languages.register({ id: 'svelte' });
    // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco.languages.setMonarchTokensProvider('svelte', {
      tokenizer: {
        root: [
          [/<\/?[a-zA-Z-]+>/, 'tag'], // HTML tags
          [/\{.*?\}/, 'expression'], // Svelte expressions
          [/on:[a-zA-Z]+/, 'attribute'], // Svelte event attributes
          [/\b(let|if|else|await|then)\b/, 'keyword'], // Svelte keywords
        ],
      },
    });
  }

  return (
    <Div>
      <Editor
        height="100vh"
        language={language}
        value={code}
        theme="vs-light"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
    </Div>
  )
}

const Div = styled.div`
  width: calc(100% - 250px);
  margin: 0;
  font-size: 16px;
`
