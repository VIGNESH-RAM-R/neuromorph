import { useMorphyChat } from '../../hooks/useMorphyChat.js';
import ChatBubbleButton from './ChatBubbleButton.jsx';
import ChatPanel from './ChatPanel.jsx';

// The single drop-in piece: everything Morphy needs, self-contained,
// requiring nothing from its host app except being rendered somewhere in
// the tree (it's positioned fixed via CSS, so placement in the JSX tree
// doesn't matter). See README.md "Reusing Morphy in another module" for
// exactly what to copy into another NEUROMORPH project.
export default function MorphyWidget() {
  const chat = useMorphyChat();

  return (
    <div className="morphy-widget">
      {chat.isOpen && (
        <ChatPanel
          messages={chat.messages}
          inputValue={chat.inputValue}
          onInputChange={chat.setInputValue}
          onSend={chat.send}
          onSuggestionClick={chat.selectSuggestion}
          onUploadReport={chat.uploadReport}
          isThinking={chat.isThinking}
          onClose={chat.close}
        />
      )}
      <ChatBubbleButton isOpen={chat.isOpen} onToggle={chat.toggle} />
    </div>
  );
}
