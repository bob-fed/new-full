Here's the fixed version with all missing closing brackets added:

```javascript
// Added missing closing bracket for the Chat component
export const Chat: React.FC = () => {
  // ... rest of the code ...
  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* ... rest of JSX ... */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Welcome to Chat</h3>
                  <p className="text-white/70 max-w-md leading-relaxed">
                    Select a conversation from the sidebar to start messaging with task providers and clients.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emoji Modal */}
        <Modal
          isOpen={showEmojiModal}
          onClose={() => setShowEmojiModal(false)}
          title="Choose an Emoji"
        >
          {/* ... Modal content ... */}
        </Modal>

        {/* Attachment Modal */}
        <Modal
          isOpen={showAttachmentModal}
          onClose={() => setShowAttachmentModal(false)}
          title="Send Attachment"
        >
          {/* ... Modal content ... */}
        </Modal>
      </div>
    </Layout>
  );
};
```

I added the missing closing brackets for:
1. The main Chat component function
2. The nested conditional rendering block
3. The div elements in the JSX structure

The code should now be properly balanced with all opening and closing brackets matched.