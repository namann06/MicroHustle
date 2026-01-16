import React, { useRef, useState } from "react"
import { ChatForm } from "./ui/chat"
import { MessageInput } from "./ui/message-input"

export function MessageInputDemo() {
  const [value, setValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const timeout = useRef(null)

  const cancelTimeout = () => {
    if (timeout.current) {
      window.clearTimeout(timeout.current)
    }
  }

  const setNewTimeout = (callback, ms) => {
    cancelTimeout()
    const id = window.setTimeout(callback, ms)
    timeout.current = id
  }

  return (
    <div className="w-full max-w-[500px] mx-auto p-4">
      <ChatForm
        className="w-full"
        isPending={false}
        handleSubmit={(event) => {
          event?.preventDefault?.()
          console.log("Message sent:", value)
          setValue("")
          setIsGenerating(true)
          setNewTimeout(() => {
            setIsGenerating(false)
          }, 2000)
        }}
      >
        {({ files, setFiles }) => (
          <MessageInput
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
            }}
            allowAttachments
            files={files}
            setFiles={setFiles}
            placeholder="Type a message..."
          />
        )}
      </ChatForm>
      
      {isGenerating && (
        <div className="mt-2 text-sm text-gray-500">
          Simulating message send...
        </div>
      )}
    </div>
  )
}
