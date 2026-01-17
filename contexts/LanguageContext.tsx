"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "en" | "es" | "de" | "it" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.home": "Home",
    "nav.skane": "Skane",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    
    // Home Page
    "home.title": "NOKTA ONE",
    "home.recentScans": "Recente Skane :",
    "home.today": "Today",
    "home.yesterday": "Yesterday",
    "home.daysAgo": "days ago",
    "home.noReset": "No reset today for 2 hours",
    "home.pressToSkane": "Press to\nskane",
    
    // Skane Page
    "skane.start": "Start\nSkane",
    "skane.cameraLoading": "Loading camera...",
    "skane.cameraRequired": "Camera access required",
    
    // Info Modal
    "info.title": "QU'EST-CE QU'UN SKANE ?",
    "info.description": "Un reset corporel de 30 secondes maximum :",
    "info.scan": "Scan facial IA (3 secondes)",
    "info.action": "Micro-action guidée (20-30 secondes)",
    "info.return": "Retour à l'équilibre immédiat",
    "info.noDiagnostic": "Aucun diagnostic. Juste une action.",
    "info.guestMode": "MODE INVITÉ",
    "info.guestDescription": "Invitez vos proches à tester Nokta One.",
    "info.guestPoint1": "1 invitation = 1 personne peut essayer",
    "info.guestPoint2": "Gagnez 1 invitation toutes les 3 skanes (24h)",
    "info.guestPoint3": "Les invités peuvent partager leur Skane Index",
    "info.guestPoint4": "Aucune donnée sauvegardée pour les invités",
    "info.guestActive": "L'icône bleue indique que le mode invité est actif.",
    "info.invitationsAvailable": "Invitations disponibles :",
    
    // Settings
    "settings.profile": "Profile",
    "settings.title": "Settings",
    "settings.notifications": "Notifications",
    "settings.language": "Language",
    "settings.connectedDevices": "Connected Devices",
    "settings.referralCode": "Referral code",
    "settings.invitations": "Invitations",
    "settings.logOut": "Log Out",
    "settings.comingSoon": "Coming Soon",
    "settings.comingSoonText": "Coming soon in a future update",
    
    // Invitations Modal
    "invitations.title": "Invitations disponibles",
    "invitations.count": "invitations",
    "invitations.description": "Invitez vos proches à tester Nokta One en mode invité.",
    "invitations.copyLink": "Copier le lien d'invitation",
    "invitations.linkCopied": "Lien copié !",
    "invitations.info": "Gagnez 1 invitation toutes les 3 skanes (24h)",
    
    // Signup
    "signup.firstName": "Prénom",
    "signup.lastName": "Nom",
    "signup.username": "@ Username",
    "signup.birthDate": "Date de naissance",
    "signup.email": "Email",
    "signup.country": "Pays",
    "signup.selectCountry": "Sélectionnez un pays",
    "signup.selectLanguage": "Sélectionnez une langue",
    "signup.notifications": "Activer les notifications",
    "signup.notificationsDesc": "Restez informé de vos resets et progrès",
    "signup.referralCode": "Votre code de parrainage :",
    "signup.createAccount": "Create Account",
    "signup.next": "Next",
    "signup.usernameAvailable": "Username disponible",
    "signup.usernameTaken": "Ce username est déjà pris",
    "signup.usernameReserved": "This username is reserved",
    "signup.usernameMinLength": "Username must be at least 3 characters",
    "signup.usernameInvalid": "Only letters, numbers, and underscores allowed",
    "signup.ageRequired": "Vous devez avoir au moins 13 ans",
    "signup.emailInvalid": "Format d'email invalide",
    "signup.accountCreated": "Compte créé avec succès !",
    
    // Language Modal
    "language.select": "Select Language",
    "language.french": "Français",
    "language.english": "English (US)",
    "language.spanish": "Español",
    "language.german": "Deutsch",
    "language.italian": "Italiano",
    "language.chinese": "中文",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.skane": "Skane",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    
    // Home Page
    "home.title": "NOKTA ONE",
    "home.recentScans": "Recent Skane:",
    "home.today": "Today",
    "home.yesterday": "Yesterday",
    "home.daysAgo": "days ago",
    "home.noReset": "No reset today for 2 hours",
    "home.pressToSkane": "Press to\nskane",
    
    // Skane Page
    "skane.start": "Start\nSkane",
    "skane.cameraLoading": "Loading camera...",
    "skane.cameraRequired": "Camera access required",
    
    // Info Modal
    "info.title": "WHAT IS A SKANE?",
    "info.description": "A 30-second maximum body reset:",
    "info.scan": "AI facial scan (3 seconds)",
    "info.action": "Guided micro-action (20-30 seconds)",
    "info.return": "Immediate return to balance",
    "info.noDiagnostic": "No diagnosis. Just an action.",
    "info.guestMode": "GUEST MODE",
    "info.guestDescription": "Invite your loved ones to try Nokta One.",
    "info.guestPoint1": "1 invitation = 1 person can try",
    "info.guestPoint2": "Earn 1 invitation every 3 skanes (24h)",
    "info.guestPoint3": "Guests can share their Skane Index",
    "info.guestPoint4": "No data saved for guests",
    "info.guestActive": "The blue icon indicates that guest mode is active.",
    "info.invitationsAvailable": "Available invitations:",
    
    // Settings
    "settings.profile": "Profile",
    "settings.title": "Settings",
    "settings.notifications": "Notifications",
    "settings.language": "Language",
    "settings.connectedDevices": "Connected Devices",
    "settings.referralCode": "Referral code",
    "settings.invitations": "Invitations",
    "settings.logOut": "Log Out",
    "settings.comingSoon": "Coming Soon",
    "settings.comingSoonText": "Coming soon in a future update",
    
    // Invitations Modal
    "invitations.title": "Available invitations",
    "invitations.count": "invitations",
    "invitations.description": "Invite your loved ones to try Nokta One in guest mode.",
    "invitations.copyLink": "Copy invitation link",
    "invitations.linkCopied": "Link copied!",
    "invitations.info": "Earn 1 invitation every 3 skanes (24h)",
    
    // Signup
    "signup.firstName": "First name",
    "signup.lastName": "Last name",
    "signup.username": "@ Username",
    "signup.birthDate": "Date of birth",
    "signup.email": "Email",
    "signup.country": "Country",
    "signup.selectCountry": "Select a country",
    "signup.selectLanguage": "Select a language",
    "signup.notifications": "Enable notifications",
    "signup.notificationsDesc": "Stay informed about your resets and progress",
    "signup.referralCode": "Your referral code:",
    "signup.createAccount": "Create Account",
    "signup.next": "Next",
    "signup.usernameAvailable": "Username available",
    "signup.usernameTaken": "This username is already taken",
    "signup.usernameReserved": "This username is reserved",
    "signup.usernameMinLength": "Username must be at least 3 characters",
    "signup.usernameInvalid": "Only letters, numbers, and underscores allowed",
    "signup.ageRequired": "You must be at least 13 years old",
    "signup.emailInvalid": "Invalid email format",
    "signup.accountCreated": "Account created successfully!",
    
    // Language Modal
    "language.select": "Select Language",
    "language.french": "Français",
    "language.english": "English (US)",
    "language.spanish": "Español",
    "language.german": "Deutsch",
    "language.italian": "Italiano",
    "language.chinese": "中文",
  },
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.skane": "Skane",
    "nav.settings": "Configuración",
    "nav.profile": "Perfil",
    
    // Home Page
    "home.title": "NOKTA ONE",
    "home.recentScans": "Skane reciente:",
    "home.today": "Hoy",
    "home.yesterday": "Ayer",
    "home.daysAgo": "hace días",
    "home.noReset": "No hay reinicio hoy por 2 horas",
    "home.pressToSkane": "Presiona para\nskane",
    
    // Skane Page
    "skane.start": "Iniciar\nSkane",
    "skane.cameraLoading": "Cargando cámara...",
    "skane.cameraRequired": "Se requiere acceso a la cámara",
    
    // Info Modal
    "info.title": "¿QUÉ ES UN SKANE?",
    "info.description": "Un reinicio corporal de máximo 30 segundos:",
    "info.scan": "Escaneo facial IA (3 segundos)",
    "info.action": "Micro-acción guiada (20-30 segundos)",
    "info.return": "Retorno inmediato al equilibrio",
    "info.noDiagnostic": "Sin diagnóstico. Solo una acción.",
    "info.guestMode": "MODO INVITADO",
    "info.guestDescription": "Invita a tus seres queridos a probar Nokta One.",
    "info.guestPoint1": "1 invitación = 1 persona puede probar",
    "info.guestPoint2": "Gana 1 invitación cada 3 skanes (24h)",
    "info.guestPoint3": "Los invitados pueden compartir su Skane Index",
    "info.guestPoint4": "No se guardan datos para los invitados",
    "info.guestActive": "El icono azul indica que el modo invitado está activo.",
    "info.invitationsAvailable": "Invitaciones disponibles:",
    
    // Settings
    "settings.profile": "Perfil",
    "settings.title": "Configuración",
    "settings.notifications": "Notificaciones",
    "settings.language": "Idioma",
    "settings.connectedDevices": "Dispositivos conectados",
    "settings.referralCode": "Código de referido",
    "settings.invitations": "Invitaciones",
    "settings.logOut": "Cerrar sesión",
    "settings.comingSoon": "Próximamente",
    "settings.comingSoonText": "Próximamente en una actualización futura",
    
    // Invitations Modal
    "invitations.title": "Invitaciones disponibles",
    "invitations.count": "invitaciones",
    "invitations.description": "Invita a tus seres queridos a probar Nokta One en modo invitado.",
    "invitations.copyLink": "Copiar enlace de invitación",
    "invitations.linkCopied": "¡Enlace copiado!",
    "invitations.info": "Gana 1 invitación cada 3 skanes (24h)",
    
    // Signup
    "signup.firstName": "Nombre",
    "signup.lastName": "Apellido",
    "signup.username": "@ Nombre de usuario",
    "signup.birthDate": "Fecha de nacimiento",
    "signup.email": "Correo electrónico",
    "signup.country": "País",
    "signup.selectCountry": "Selecciona un país",
    "signup.selectLanguage": "Selecciona un idioma",
    "signup.notifications": "Activar notificaciones",
    "signup.notificationsDesc": "Mantente informado sobre tus reinicios y progreso",
    "signup.referralCode": "Tu código de referido:",
    "signup.createAccount": "Crear cuenta",
    "signup.next": "Siguiente",
    "signup.usernameAvailable": "Nombre de usuario disponible",
    "signup.usernameTaken": "Este nombre de usuario ya está en uso",
    "signup.usernameReserved": "Este nombre de usuario está reservado",
    "signup.usernameMinLength": "El nombre de usuario debe tener al menos 3 caracteres",
    "signup.usernameInvalid": "Solo se permiten letras, números y guiones bajos",
    "signup.ageRequired": "Debes tener al menos 13 años",
    "signup.emailInvalid": "Formato de correo electrónico inválido",
    "signup.accountCreated": "¡Cuenta creada con éxito!",
    
    // Language Modal
    "language.select": "Seleccionar idioma",
    "language.french": "Français",
    "language.english": "English (US)",
    "language.spanish": "Español",
    "language.german": "Deutsch",
    "language.italian": "Italiano",
    "language.chinese": "中文",
  },
  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.skane": "Skane",
    "nav.settings": "Einstellungen",
    "nav.profile": "Profil",
    
    // Home Page
    "home.title": "NOKTA ONE",
    "home.recentScans": "Kürzliche Skane:",
    "home.today": "Heute",
    "home.yesterday": "Gestern",
    "home.daysAgo": "Tage her",
    "home.noReset": "Kein Reset heute für 2 Stunden",
    "home.pressToSkane": "Drücken Sie für\nskane",
    
    // Skane Page
    "skane.start": "Start\nSkane",
    "skane.cameraLoading": "Kamera wird geladen...",
    "skane.cameraRequired": "Kamerazugriff erforderlich",
    
    // Info Modal
    "info.title": "WAS IST EIN SKANE?",
    "info.description": "Ein maximal 30 Sekunden dauernder Körper-Reset:",
    "info.scan": "KI-Gesichtsscan (3 Sekunden)",
    "info.action": "Geführte Mikroaktion (20-30 Sekunden)",
    "info.return": "Sofortige Rückkehr zum Gleichgewicht",
    "info.noDiagnostic": "Keine Diagnose. Nur eine Aktion.",
    "info.guestMode": "GASTMODUS",
    "info.guestDescription": "Laden Sie Ihre Liebsten ein, Nokta One auszuprobieren.",
    "info.guestPoint1": "1 Einladung = 1 Person kann es versuchen",
    "info.guestPoint2": "Verdienen Sie 1 Einladung alle 3 Skane (24h)",
    "info.guestPoint3": "Gäste können ihren Skane Index teilen",
    "info.guestPoint4": "Keine Daten für Gäste gespeichert",
    "info.guestActive": "Das blaue Symbol zeigt an, dass der Gastmodus aktiv ist.",
    "info.invitationsAvailable": "Verfügbare Einladungen:",
    
    // Settings
    "settings.profile": "Profil",
    "settings.title": "Einstellungen",
    "settings.notifications": "Benachrichtigungen",
    "settings.language": "Sprache",
    "settings.connectedDevices": "Verbundene Geräte",
    "settings.referralCode": "Empfehlungscode",
    "settings.invitations": "Einladungen",
    "settings.logOut": "Abmelden",
    "settings.comingSoon": "Demnächst",
    "settings.comingSoonText": "Demnächst in einem zukünftigen Update",
    
    // Invitations Modal
    "invitations.title": "Verfügbare Einladungen",
    "invitations.count": "Einladungen",
    "invitations.description": "Laden Sie Ihre Liebsten ein, Nokta One im Gastmodus auszuprobieren.",
    "invitations.copyLink": "Einladungslink kopieren",
    "invitations.linkCopied": "Link kopiert!",
    "invitations.info": "Verdienen Sie 1 Einladung alle 3 Skane (24h)",
    
    // Signup
    "signup.firstName": "Vorname",
    "signup.lastName": "Nachname",
    "signup.username": "@ Benutzername",
    "signup.birthDate": "Geburtsdatum",
    "signup.email": "E-Mail",
    "signup.country": "Land",
    "signup.selectCountry": "Wählen Sie ein Land",
    "signup.selectLanguage": "Wählen Sie eine Sprache",
    "signup.notifications": "Benachrichtigungen aktivieren",
    "signup.notificationsDesc": "Bleiben Sie über Ihre Resets und Fortschritte informiert",
    "signup.referralCode": "Ihr Empfehlungscode:",
    "signup.createAccount": "Konto erstellen",
    "signup.next": "Weiter",
    "signup.usernameAvailable": "Benutzername verfügbar",
    "signup.usernameTaken": "Dieser Benutzername ist bereits vergeben",
    "signup.usernameReserved": "Dieser Benutzername ist reserviert",
    "signup.usernameMinLength": "Benutzername muss mindestens 3 Zeichen lang sein",
    "signup.usernameInvalid": "Nur Buchstaben, Zahlen und Unterstriche erlaubt",
    "signup.ageRequired": "Sie müssen mindestens 13 Jahre alt sein",
    "signup.emailInvalid": "Ungültiges E-Mail-Format",
    "signup.accountCreated": "Konto erfolgreich erstellt!",
    
    // Language Modal
    "language.select": "Sprache auswählen",
    "language.french": "Français",
    "language.english": "English (US)",
    "language.spanish": "Español",
    "language.german": "Deutsch",
    "language.italian": "Italiano",
    "language.chinese": "中文",
  },
  it: {
    // Navigation
    "nav.home": "Home",
    "nav.skane": "Skane",
    "nav.settings": "Impostazioni",
    "nav.profile": "Profilo",
    
    // Home Page
    "home.title": "NOKTA ONE",
    "home.recentScans": "Skane recente:",
    "home.today": "Oggi",
    "home.yesterday": "Ieri",
    "home.daysAgo": "giorni fa",
    "home.noReset": "Nessun reset oggi per 2 ore",
    "home.pressToSkane": "Premi per\nskane",
    
    // Skane Page
    "skane.start": "Inizia\nSkane",
    "skane.cameraLoading": "Caricamento fotocamera...",
    "skane.cameraRequired": "Accesso alla fotocamera richiesto",
    
    // Info Modal
    "info.title": "COS'È UN SKANE?",
    "info.description": "Un reset corporeo di massimo 30 secondi:",
    "info.scan": "Scansione facciale IA (3 secondi)",
    "info.action": "Micro-azione guidata (20-30 secondi)",
    "info.return": "Ritorno immediato all'equilibrio",
    "info.noDiagnostic": "Nessuna diagnosi. Solo un'azione.",
    "info.guestMode": "MODO OSPITE",
    "info.guestDescription": "Invita i tuoi cari a provare Nokta One.",
    "info.guestPoint1": "1 invito = 1 persona può provare",
    "info.guestPoint2": "Guadagna 1 invito ogni 3 skane (24h)",
    "info.guestPoint3": "Gli ospiti possono condividere il loro Skane Index",
    "info.guestPoint4": "Nessun dato salvato per gli ospiti",
    "info.guestActive": "L'icona blu indica che la modalità ospite è attiva.",
    "info.invitationsAvailable": "Inviti disponibili:",
    
    // Settings
    "settings.profile": "Profilo",
    "settings.title": "Impostazioni",
    "settings.notifications": "Notifiche",
    "settings.language": "Lingua",
    "settings.connectedDevices": "Dispositivi connessi",
    "settings.referralCode": "Codice di riferimento",
    "settings.invitations": "Inviti",
    "settings.logOut": "Esci",
    "settings.comingSoon": "Prossimamente",
    "settings.comingSoonText": "Prossimamente in un aggiornamento futuro",
    
    // Invitations Modal
    "invitations.title": "Inviti disponibili",
    "invitations.count": "inviti",
    "invitations.description": "Invita i tuoi cari a provare Nokta One in modalità ospite.",
    "invitations.copyLink": "Copia link invito",
    "invitations.linkCopied": "Link copiato!",
    "invitations.info": "Guadagna 1 invito ogni 3 skane (24h)",
    
    // Signup
    "signup.firstName": "Nome",
    "signup.lastName": "Cognome",
    "signup.username": "@ Nome utente",
    "signup.birthDate": "Data di nascita",
    "signup.email": "Email",
    "signup.country": "Paese",
    "signup.selectCountry": "Seleziona un paese",
    "signup.selectLanguage": "Seleziona una lingua",
    "signup.notifications": "Attiva notifiche",
    "signup.notificationsDesc": "Resta informato sui tuoi reset e progressi",
    "signup.referralCode": "Il tuo codice di riferimento:",
    "signup.createAccount": "Crea account",
    "signup.next": "Avanti",
    "signup.usernameAvailable": "Nome utente disponibile",
    "signup.usernameTaken": "Questo nome utente è già stato utilizzato",
    "signup.usernameReserved": "Questo nome utente è riservato",
    "signup.usernameMinLength": "Il nome utente deve contenere almeno 3 caratteri",
    "signup.usernameInvalid": "Sono consentiti solo lettere, numeri e trattini bassi",
    "signup.ageRequired": "Devi avere almeno 13 anni",
    "signup.emailInvalid": "Formato email non valido",
    "signup.accountCreated": "Account creato con successo!",
    
    // Language Modal
    "language.select": "Seleziona lingua",
    "language.french": "Français",
    "language.english": "English (US)",
    "language.spanish": "Español",
    "language.german": "Deutsch",
    "language.italian": "Italiano",
    "language.chinese": "中文",
  },
  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.skane": "Skane",
    "nav.settings": "设置",
    "nav.profile": "个人资料",
    
    // Home Page
    "home.title": "NOKTA ONE",
    "home.recentScans": "最近的Skane：",
    "home.today": "今天",
    "home.yesterday": "昨天",
    "home.daysAgo": "天前",
    "home.noReset": "今天2小时内无重置",
    "home.pressToSkane": "按下以\nskane",
    
    // Skane Page
    "skane.start": "开始\nSkane",
    "skane.cameraLoading": "正在加载相机...",
    "skane.cameraRequired": "需要相机访问权限",
    
    // Info Modal
    "info.title": "什么是SKANE？",
    "info.description": "最多30秒的身体重置：",
    "info.scan": "AI面部扫描（3秒）",
    "info.action": "引导微动作（20-30秒）",
    "info.return": "立即恢复平衡",
    "info.noDiagnostic": "无诊断。只是一个动作。",
    "info.guestMode": "访客模式",
    "info.guestDescription": "邀请您的亲人试用Nokta One。",
    "info.guestPoint1": "1个邀请 = 1人可以试用",
    "info.guestPoint2": "每3个skane（24小时）获得1个邀请",
    "info.guestPoint3": "访客可以分享他们的Skane指数",
    "info.guestPoint4": "访客不保存数据",
    "info.guestActive": "蓝色图标表示访客模式已激活。",
    "info.invitationsAvailable": "可用邀请：",
    
    // Settings
    "settings.profile": "个人资料",
    "settings.title": "设置",
    "settings.notifications": "通知",
    "settings.language": "语言",
    "settings.connectedDevices": "已连接的设备",
    "settings.referralCode": "推荐代码",
    "settings.invitations": "邀请",
    "settings.logOut": "登出",
    "settings.comingSoon": "即将推出",
    "settings.comingSoonText": "即将在未来的更新中推出",
    
    // Invitations Modal
    "invitations.title": "可用邀请",
    "invitations.count": "邀请",
    "invitations.description": "邀请您的亲人以访客模式试用Nokta One。",
    "invitations.copyLink": "复制邀请链接",
    "invitations.linkCopied": "链接已复制！",
    "invitations.info": "每3个skane（24小时）获得1个邀请",
    
    // Signup
    "signup.firstName": "名字",
    "signup.lastName": "姓氏",
    "signup.username": "@ 用户名",
    "signup.birthDate": "出生日期",
    "signup.email": "电子邮件",
    "signup.country": "国家",
    "signup.selectCountry": "选择一个国家",
    "signup.selectLanguage": "选择一种语言",
    "signup.notifications": "启用通知",
    "signup.notificationsDesc": "随时了解您的重置和进度",
    "signup.referralCode": "您的推荐代码：",
    "signup.createAccount": "创建账户",
    "signup.next": "下一步",
    "signup.usernameAvailable": "用户名可用",
    "signup.usernameTaken": "此用户名已被使用",
    "signup.usernameReserved": "此用户名已保留",
    "signup.usernameMinLength": "用户名必须至少3个字符",
    "signup.usernameInvalid": "仅允许字母、数字和下划线",
    "signup.ageRequired": "您必须至少13岁",
    "signup.emailInvalid": "无效的电子邮件格式",
    "signup.accountCreated": "账户创建成功！",
    
    // Language Modal
    "language.select": "选择语言",
    "language.french": "Français",
    "language.english": "English (US)",
    "language.spanish": "Español",
    "language.german": "Deutsch",
    "language.italian": "Italiano",
    "language.chinese": "中文",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  // Charger la langue depuis localStorage au montage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage") as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selectedLanguage", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
