export default function Button({children, onClick}: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: "black",
        color: "white",
        borderRadius: "5px"
      }}
    >
      {children}
    </button>
  );
}