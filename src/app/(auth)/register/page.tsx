import SignUpForm from "@/components/auth/SignUpForm";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUpForm role="viewer" />
    </div>
  );
}