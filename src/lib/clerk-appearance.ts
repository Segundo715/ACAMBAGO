import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#3b82f6",
    colorBackground: "#0d1b2e",
    colorText: "#f1f5f9",
    colorTextSecondary: "#cbd5e1",
    colorInputBackground: "#1e3352",
    colorInputText: "#f1f5f9",
    colorNeutral: "#94a3b8",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "w-full",
    card: "bg-[#0d1b2e] border border-white/10 shadow-2xl rounded-2xl",

    headerTitle: "text-white text-2xl font-bold",
    headerSubtitle: "text-slate-300",

    /* Tabs de método */
    tabButton: "text-slate-300 hover:text-white transition-colors",
    tabButtonActive: "text-white border-b-2 border-blue-500",
    tabPanel: "text-white",

    /* Labels */
    formFieldLabel: "text-slate-200 font-medium",

    /* Inputs — forzar texto blanco */
    formFieldInput:
      "!bg-[#1e3352] !border-white/25 !text-white placeholder:!text-slate-400 rounded-xl focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/30 transition-all",

    /* Selector de país (teléfono) */
    phoneInputBox:
      "!bg-[#1e3352] !border-white/25 rounded-xl overflow-hidden",
    formFieldInputGroup:
      "!bg-[#1e3352] !border-white/25 rounded-xl",
    formFieldInputShowPasswordButton:
      "text-slate-400 hover:text-white transition-colors",

    /* Botón principal */
    formButtonPrimary:
      "!bg-blue-600 hover:!bg-blue-500 active:!bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25",

    /* Botones sociales */
    socialButtonsBlockButton:
      "!bg-white/5 !border-white/20 !text-white hover:!bg-white/15 hover:!border-white/35 transition-all duration-200 rounded-xl font-medium",
    socialButtonsBlockButtonText: "!text-white font-medium",
    socialButtonsBlockButtonArrow: "text-white",

    /* Divider */
    dividerLine: "bg-white/10",
    dividerText: "text-slate-400",

    /* Links y acciones */
    footerActionLink:
      "!text-blue-400 hover:!text-blue-300 transition-colors font-medium",
    formFieldAction:
      "!text-blue-400 hover:!text-blue-300 transition-colors",
    identityPreviewEditButton:
      "!text-blue-400 hover:!text-blue-300 transition-colors",
    formResendCodeLink:
      "!text-blue-400 hover:!text-blue-300 transition-colors",

    /* Texto de alternativa (Usar correo / Usar teléfono) */
    alternativeMethodsBlockButton:
      "!bg-white/5 !border-white/20 !text-slate-200 hover:!bg-white/10 hover:!text-white transition-all duration-200 rounded-xl",

    /* OTP */
    otpCodeFieldInput:
      "!bg-[#1e3352] !border-white/25 !text-white focus:!border-blue-500 transition-all rounded-xl",

    /* Errores */
    formFieldErrorText: "text-red-400",
    alert: "!bg-red-500/10 !border-red-500/20 rounded-xl",
    alertText: "text-red-400",

    /* Footer */
    footer: "!bg-transparent",
    footerPages: "text-slate-400",
    footerPagesLink: "!text-blue-400 hover:!text-blue-300",

    /* Texto de identidad */
    identityPreviewText: "!text-slate-200",

    /* Selector interno (bandera país) */
    selectButton: "!text-white !bg-transparent",
    selectOption: "!text-white",
  },
};
