import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { LoadingSpinner } from "@largence/components/loading-spinner"

export default function SSOCallback() {
  return (
    <>
      <AuthenticateWithRedirectCallback 
        afterSignInUrl="/"
        afterSignUpUrl="/onboarding"
      />
      <LoadingSpinner />
    </>
  )
}
