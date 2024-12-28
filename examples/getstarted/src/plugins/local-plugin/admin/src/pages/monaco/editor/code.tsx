import React from 'react'
import Editor from "@monaco-editor/react";
import {File} from "../utils/file-manager";
import styled from "@emotion/styled";

export const Code = ({selectedFile}: { selectedFile: File | undefined }) => {
  if (!selectedFile)
    return null

  console.log('selected file is ', selectedFile);

  const code = selectedFile.content
  const ext = selectedFile.extension;
  let language = selectedFile.name.split('.').pop()

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript"
  else if (ext === "svelte")
    language = "html"

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
      />
    </Div>
  )
}

const Div = styled.div`
  width: calc(100% - 250px);
  margin: 0;
  font-size: 16px;
`
