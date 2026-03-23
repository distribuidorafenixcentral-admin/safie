type Props = {
  message: string
  type?: "success" | "error"
  visible: boolean
}

export default function Toast({ message, type = "success", visible }: Props) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50
      transition-all duration-300
      ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`px-6 py-4 rounded shadow-lg text-white text-center
        transform transition-all duration-300
        ${visible ? "scale-100" : "scale-95"}
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
      >
        {message}
      </div>
    </div>
  )
}