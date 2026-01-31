import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { Send, Paperclip, X, Mic, ArrowUp } from "lucide-react"

const MessageInput = React.forwardRef(({
  className,
  value = "",
  onChange,
  onSubmit,
  allowAttachments = false,
  files = [],
  setFiles,
  placeholder = "Type a message...",
  ...props
}, ref) => {
  const fileInputRef = React.useRef(null)
  const textareaRef = React.useRef(null)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (onSubmit) {
        onSubmit(event)
      }
    }
  }

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (setFiles) {
      setFiles(prev => [...prev, ...selectedFiles])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (indexToRemove) => {
    if (setFiles) {
      setFiles(prev => prev.filter((_, index) => index !== indexToRemove))
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  React.useEffect(() => {
    adjustTextareaHeight()
  }, [value])

  const hasContent = value.trim() || (files && files.length > 0)

  return (
    <div className={cn("p-4 bg-black", className)}>
      {/* File attachments preview */}
      {files && files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-900 rounded-lg">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-sm text-white"
            >
              <Paperclip className="h-4 w-4 text-gray-400" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <Button
                type="button"
                onClick={() => removeFile(index)}
                className="h-4 w-4 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="relative flex items-center p-2 bg-[#18181b] border border-white/20 rounded-3xl shadow-sm">
        {/* File attachment button */}
        {allowAttachments && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 p-0 rounded-full hover:bg-white/10 text-gray-400 mr-1"
              tabIndex={-1}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-2 py-2 text-base text-white placeholder:text-gray-400 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none min-h-[24px] max-h-[80px]"
          rows={1}
          {...props}
        />

        {/* Mic button */}
        <Button
          type="button"
          className="h-9 w-9 p-0 rounded-full hover:bg-white/10 text-gray-400 mx-1"
          tabIndex={-1}
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Send button */}
        <Button
          type="submit"
          disabled={!hasContent}
          className={cn(
            "h-9 w-9 p-0 rounded-full ml-1 flex items-center justify-center border border-white/20 transition-all",
            hasContent
              ? "bg-white text-black hover:bg-gray-100"
              : "bg-white/10 text-gray-500 cursor-not-allowed"
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
})
MessageInput.displayName = "MessageInput"

export { MessageInput }
