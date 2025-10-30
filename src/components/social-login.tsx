import { StyledButton } from "@largence/components/ui/form-components";
import { GoogleIcon, MicrosoftIcon } from "@largence/components/ui/icons";

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onMicrosoftLogin?: () => void;
  isLoading?: boolean;
}

export function SocialLogin({ 
  onGoogleLogin, 
  onMicrosoftLogin, 
  isLoading 
}: SocialLoginProps) {
  return (
    <div className="space-y-3">
      <StyledButton
        variant="outline"
        type="button"
        onClick={onGoogleLogin}
        disabled={isLoading}
        className="h-12 text-base"
      >
        <GoogleIcon className="mr-2 w-5 h-5" />
        Continue with Google
      </StyledButton>
      
      <StyledButton
        variant="outline"
        type="button"
        onClick={onMicrosoftLogin}
        disabled={isLoading}
        className="h-12 text-base"
      >
        <MicrosoftIcon className="mr-2 w-5 h-5" />
        Continue with Microsoft
      </StyledButton>
    </div>
  );
}