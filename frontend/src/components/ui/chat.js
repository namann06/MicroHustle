import * as React from "react"
import { cn } from "../../lib/utils"

const ChatForm = React.forwardRef(({ 
  className, 
  children, 
  handleSubmit, 
  isPending = false,
  ...props 
}, ref) => {
  const [files, setFiles] = React.useState([])

  const onSubmit = (event) => {
    event.preventDefault()
    if (handleSubmit) {
      handleSubmit(event, files)
    }
    // Clear files after sending
    setFiles([])
  }

  return (
    <form
      ref={ref}
      className={cn("relative", className)}
      onSubmit={onSubmit}
      {...props}
    >
      {typeof children === 'function' ? children({ files, setFiles, isPending }) : children}
    </form>
  )
})
ChatForm.displayName = "ChatForm"

export { ChatForm }
