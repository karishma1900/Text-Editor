import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const Draft = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const styleMap = {
    red: {
      color: "red",
    },
    underline: {
      textDecoration: "underline",
    },
  };

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("draftEditorContent");
    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  // Handle key commands like CTRL+B for bold
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  // Handle before input for specific formatting
  const handleBeforeInput = (chars) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const blockKey = selectionState.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();

    if (chars === " " && blockText === "#") {
      applyBlockStyle("header-one");
      return "handled";
    }
    if (chars === " " && blockText === "*") {
      applyInlineStyle("BOLD");
      return "handled";
    }
    if (chars === " " && blockText === "**") {
      applyInlineStyle("red");
      return "handled";
    }
    if (chars === " " && blockText === "***") {
      applyInlineStyle("UNDERLINE");
      return "handled";
    }
    return "not-handled";
  };

  // Function to apply block styles (e.g., header)
  const applyBlockStyle = (style) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const blockKey = selectionState.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();

    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: blockText.length,
      }),
      "", // Remove the special character (#, *, etc.)
      null
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-block-type"
    );

    setEditorState(RichUtils.toggleBlockType(newEditorState, style));
  };

  // Function to apply inline styles (e.g., bold, red, underline)
  const applyInlineStyle = (style) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const blockKey = selectionState.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();

    // Remove special characters
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: blockText.length,
      }),
      "", // Remove the special characters (*, **, etc.)
      null
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "remove-range"
    );

    setEditorState(RichUtils.toggleInlineStyle(newEditorState, style));
  };

  // Save content to localStorage
  const handleSave = () => {
    const content = editorState.getCurrentContent();
    localStorage.setItem("draftEditorContent", JSON.stringify(convertToRaw(content)));
    alert("Content saved!");
  };

  return (
    <div className="editor-container">
      <h1>Demo Editor</h1>
      <div className="editor-box">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
          placeholder="Type here..."
        />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Draft;
