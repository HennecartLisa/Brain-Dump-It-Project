import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FaGoogle } from "react-icons/fa";
import { Checkbox, Label } from "flowbite-react";
import { VOCAB } from "../../vocal";
import { useAuth } from "../../auth/useAuth";
import UiTextInput from "../ui/UiTextInput";
import UiButton from "../ui/UiButton";
import UiBannerMessage from "../ui/UiBannerMessage";
import GDPRConsentModal from "../ui/GDPRConsentModal";
import { setupNewUser } from "../../api/supabaseApi";
import type { BannerMessage } from "../../types/BannerMessageType";
import { BANNER_MESSAGE_TYPE } from "../../types/db-types/bannerMessageType";

export default function SignForm() {
  const { signIn, signUp, checkDisplayNameAvailable, signWithGoogle } = useAuth();

  const [banner, setBanner] = useState<BannerMessage | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDisplayName, setSignupDisplayName] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [displayNameValid, setDisplayNameValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<
    typeof VOCAB.PASSWORD_STRENGTH_WEAK | typeof VOCAB.PASSWORD_STRENGTH_MEDIUM | typeof VOCAB.PASSWORD_STRENGTH_STRONG
  >(VOCAB.PASSWORD_STRENGTH_WEAK);
  const [consentChecked, setConsentChecked] = useState(false);
  const [gdprModalOpen, setGdprModalOpen] = useState(false);

  const handleGoogleLogin = async () => {
    const { error } = await signWithGoogle();
    if (error) setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: error.message || VOCAB.LOGIN_GENERIC_ERROR });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoginLoading(false);
    if (error) setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: error.message || VOCAB.LOGIN_GENERIC_ERROR });
  };


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (displayNameValid === false) return setBanner({ type: "failure", message: VOCAB.USERNAME_TAKEN });
    if (passwordStrength !== VOCAB.PASSWORD_STRENGTH_STRONG) return setBanner({ type: "failure", message: VOCAB.PASSWORD_TOO_WEAK });
    if (!consentChecked) return setBanner({ type: "failure", message: VOCAB.PRIVACY_MUST_CONSENT });

    setSignupLoading(true);
    const { data, error } = await signUp(signupEmail, signupPassword);
    if (!error && data.user) {
      const result = await setupNewUser(signupDisplayName);
      if (result.data?.success) {
        setBanner({ type: BANNER_MESSAGE_TYPE.SUCCESS, message: VOCAB.ACCOUNT_CREATED_CHECK_EMAIL });
      } else {
        setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: result.error || VOCAB.ACCOUNT_CREATED_PROFILE_SETUP_FAILED });
      }
    } else {
      setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: error?.message || VOCAB.SIGNUP_GENERIC_ERROR });
    }
    setSignupLoading(false);
  };

  const checkPasswordStrength = (value: string) => {
    setSignupPassword(value);
    const strong = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/;
    const medium = /((?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[^A-Za-z\d])).{6,}/;

    if (strong.test(value)) setPasswordStrength(VOCAB.PASSWORD_STRENGTH_STRONG);
    else if (medium.test(value)) setPasswordStrength(VOCAB.PASSWORD_STRENGTH_MEDIUM);
    else setPasswordStrength(VOCAB.PASSWORD_STRENGTH_WEAK);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[--color-primary-bg] p-4">
      {banner && (
        <UiBannerMessage
          message={banner.message}
          color={banner.type}
          onClose={() => setBanner(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl gap-8 bg-white shadow-lg rounded-2xl p-6">
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <h2 className="text-xl font-semibold">{VOCAB.LOG_IN_TITLE}</h2>
          <UiTextInput
            id="login-email"
            label={VOCAB.EMAIL_LABEL}
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder={VOCAB.EMAIL_PLACEHOLDER}
            required
          />
          <UiTextInput
            id="login-password"
            label={VOCAB.PASSWORD_LABEL}
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder={VOCAB.PASSWORD_PLACEHOLDER}
            required
          />
          <UiButton type="submit" disabled={loginLoading}>
            {loginLoading ? VOCAB.LOGGING_IN : VOCAB.LOG_IN}
          </UiButton>
          <UiButton type="button" variant="secondary" onClick={handleGoogleLogin}>
            <FaGoogle className="inline-block mr-2" />
            {VOCAB.LOG_IN} with Google
          </UiButton>
        </form>

        <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
          <h2 className="text-xl font-semibold">{VOCAB.SIGN_UP_TITLE}</h2>

          <UiTextInput
            id="signup-email"
            label={VOCAB.EMAIL_LABEL}
            type="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            placeholder={VOCAB.EMAIL_PLACEHOLDER}
            required
          />

          <UiTextInput
            id="signup-password"
            label={VOCAB.PASSWORD_LABEL}
            type={showPassword ? "text" : "password"}
            value={signupPassword}
            onChange={(e) => checkPasswordStrength(e.target.value)}
            placeholder={VOCAB.PASSWORD_SECURE_PLACEHOLDER}
            required
            rightIcon={showPassword ? HiEyeOff : HiEye}
            isValid={passwordStrength === VOCAB.PASSWORD_STRENGTH_STRONG}
            helperText={
              passwordStrength === VOCAB.PASSWORD_STRENGTH_WEAK
                ? VOCAB.PASSWORD_HELPER_WEAK
                : passwordStrength === VOCAB.PASSWORD_STRENGTH_MEDIUM
                ? VOCAB.PASSWORD_HELPER_MEDIUM
                : VOCAB.PASSWORD_HELPER_STRONG
            }
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[2.6rem] cursor-pointer text-gray-500 z-10"
          >
        {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
      </span>

          <UiTextInput
            id="display-name"
            label={VOCAB.USERNAME_LABEL}
            type="text"
            value={signupDisplayName}
            onChange={(e) => {
              setSignupDisplayName(e.target.value);
              checkDisplayNameAvailable(e.target.value);
            }}
            placeholder={VOCAB.USERNAME_LABEL}
            isValid={displayNameValid}
            helperText={
              displayNameValid === false ? VOCAB.USERNAME_TAKEN : VOCAB.USERNAME_HELPER_UNIQUE
            }
            required
          />

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent-checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="consent-checkbox" className="text-sm text-gray-700">
                {VOCAB.PRIVACY_CONSENT_CHECKBOX_TEXT_PREFIX}{" "}
                <button
                  type="button"
                  onClick={() => setGdprModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  {VOCAB.PRIVACY_POLICY_LINK_TEXT}
                </button>
                {" "}{VOCAB.PRIVACY_CONSENT_CHECKBOX_TEXT_SUFFIX}
              </Label>
            </div>
          </div>

          <UiButton type="submit" disabled={signupLoading || !consentChecked}>
            {signupLoading ? VOCAB.SIGNING_UP : VOCAB.SIGN_UP}
          </UiButton>
          <UiButton type="button" variant="secondary" onClick={handleGoogleLogin}>
            <FaGoogle className="inline-block mr-2" />
            Sign up with Google
          </UiButton>
        </form>
      </div>

      <GDPRConsentModal
        isOpen={gdprModalOpen}
        onClose={() => setGdprModalOpen(false)}
      />
    </div>
  );
}