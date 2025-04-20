import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'pt-BR';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

type TranslationsType = {
  [key in Language]: {
    [key: string]: string;
  };
};

// Translations dictionary
const translations: TranslationsType = {
  'en': {
    // Common
    'app.name': 'CloudStore',
    'app.tagline': 'Your files, anywhere',

    // Actions
    'action.upload': 'Upload',
    'action.download': 'Download',
    'action.delete': 'Delete',
    'action.rename': 'Rename',
    'action.create': 'Create',
    'action.cancel': 'Cancel',
    'action.save': 'Save',
    'action.search': 'Search',
    'action.sign_out': 'Sign Out',
    'action.view_all': 'View all',
    'action.contact': 'Contact',
    'action.visit': 'Visit',
    'action.edit': 'Edit',
    'action.upgrade': 'Upgrade',
    'action.open': 'Open',
    'action.more': 'More options',

    // Navigation
    'nav.home': 'Home',
    'nav.files': 'Files',
    'nav.folders': 'Folders',
    'nav.settings': 'Settings',
    'nav.shared': 'Shared',

    // Files
    'files.all': 'All Files',
    'files.recent': 'Recent Files',
    'files.no_files': 'No files',
    'files.upload_message': 'Upload some files to see them here',
    'files.no_recent': 'No recent files',
    'files.upload_appear': 'Uploaded files will appear here',
    'files.file_count': '{count} files',
    
    // Sort options
    'sort.name': 'Name',
    'sort.date': 'Date',
    'sort.size': 'Size',

    // Folders
    'folders.title': 'Folders',
    'folders.new': 'New folder',
    'folders.no_folders': 'No folders yet',
    'folders.create_message': 'Create a folder to organize your files',

    // Categories
    'category.documents': 'Documents',
    'category.images': 'Images',
    'category.videos': 'Videos',
    'category.audio': 'Audio',
    'category.all': 'All Files',

    // Storage
    'storage.title': 'Storage',
    'storage.used': 'Used',
    'storage.free': 'Free',
    'storage.total': 'Total',
    'storage.plan': 'Storage Plan',
    'storage.free_plan': 'Free Plan',

    // Media
    'media.gallery': 'Media Gallery',
    'media.no_preview': 'This file type doesn\'t support preview',

    // Dialogs
    'dialog.are_you_sure': 'Are you sure?',
    'dialog.delete_folder_warning': 'This will delete the folder and all files inside. This action cannot be undone.',
    'dialog.delete_file_warning': 'This will delete the file permanently. This action cannot be undone.',

    // Viewer
    'viewer.no_preview': 'This file type doesn\'t support preview',
    'viewer.file_info': 'File information',
    'viewer.modified': 'Modified',

    // Settings
    'settings.account': 'Account',
    'settings.account_desc': 'Manage your account settings',
    'settings.preferences': 'Preferences',
    'settings.privacy': 'Privacy & Security',
    'settings.privacy_settings': 'Privacy Settings',
    'settings.security_settings': 'Security Settings',
    'settings.help': 'Help & Support',
    'settings.help_center': 'Help Center',
    'settings.contact_support': 'Contact Support',
    'settings.language': 'Language',
    'settings.dark_mode': 'Dark Mode',
    'settings.notifications': 'Notifications',
    'settings.version': 'Version',
    'settings.copyright': '© 2023 CloudStore, Inc.'
  },
  'pt-BR': {
    // Common
    'app.name': 'CloudStore',
    'app.tagline': 'Seus arquivos, em qualquer lugar',

    // Actions
    'action.upload': 'Enviar',
    'action.download': 'Baixar',
    'action.delete': 'Excluir',
    'action.rename': 'Renomear',
    'action.create': 'Criar',
    'action.cancel': 'Cancelar',
    'action.save': 'Salvar',
    'action.search': 'Buscar',
    'action.sign_out': 'Sair',
    'action.view_all': 'Ver todos',
    'action.contact': 'Contato',
    'action.visit': 'Visitar',
    'action.edit': 'Editar',
    'action.upgrade': 'Atualizar',
    'action.open': 'Abrir',
    'action.more': 'Mais opções',

    // Navigation
    'nav.home': 'Início',
    'nav.files': 'Arquivos',
    'nav.folders': 'Pastas',
    'nav.settings': 'Configurações',
    'nav.shared': 'Compartilhado',

    // Files
    'files.all': 'Todos os Arquivos',
    'files.recent': 'Arquivos Recentes',
    'files.no_files': 'Sem arquivos',
    'files.upload_message': 'Envie alguns arquivos para vê-los aqui',
    'files.no_recent': 'Sem arquivos recentes',
    'files.upload_appear': 'Arquivos enviados aparecerão aqui',
    'files.file_count': '{count} arquivos',
    
    // Sort options
    'sort.name': 'Nome',
    'sort.date': 'Data',
    'sort.size': 'Tamanho',

    // Folders
    'folders.title': 'Pastas',
    'folders.new': 'Nova pasta',
    'folders.no_folders': 'Nenhuma pasta ainda',
    'folders.create_message': 'Crie uma pasta para organizar seus arquivos',

    // Categories
    'category.documents': 'Documentos',
    'category.images': 'Imagens',
    'category.videos': 'Vídeos',
    'category.audio': 'Áudio',
    'category.all': 'Todos os Arquivos',

    // Storage
    'storage.title': 'Armazenamento',
    'storage.used': 'Usado',
    'storage.free': 'Livre',
    'storage.total': 'Total',
    'storage.plan': 'Plano de Armazenamento',
    'storage.free_plan': 'Plano Gratuito',

    // Media
    'media.gallery': 'Galeria de Mídia',
    'media.no_preview': 'Este tipo de arquivo não suporta pré-visualização',

    // Dialogs
    'dialog.are_you_sure': 'Tem certeza?',
    'dialog.delete_folder_warning': 'Isso excluirá a pasta e todos os arquivos dentro dela. Esta ação não pode ser desfeita.',
    'dialog.delete_file_warning': 'Isso excluirá o arquivo permanentemente. Esta ação não pode ser desfeita.',

    // Viewer
    'viewer.no_preview': 'Este tipo de arquivo não suporta pré-visualização',
    'viewer.file_info': 'Informações do arquivo',
    'viewer.modified': 'Modificado',

    // Settings
    'settings.account': 'Conta',
    'settings.account_desc': 'Gerencie as configurações da sua conta',
    'settings.preferences': 'Preferências',
    'settings.privacy': 'Privacidade e Segurança',
    'settings.privacy_settings': 'Configurações de Privacidade',
    'settings.security_settings': 'Configurações de Segurança',
    'settings.help': 'Ajuda e Suporte',
    'settings.help_center': 'Central de Ajuda',
    'settings.contact_support': 'Contatar Suporte',
    'settings.language': 'Idioma',
    'settings.dark_mode': 'Modo Escuro',
    'settings.notifications': 'Notificações',
    'settings.version': 'Versão',
    'settings.copyright': '© 2023 CloudStore, Inc.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get saved language from localStorage or use browser default language or fallback to English
  const getSavedLanguage = (): Language => {
    const savedLang = localStorage.getItem('app-language');
    if (savedLang === 'en' || savedLang === 'pt-BR') {
      return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) {
      return 'pt-BR';
    }
    
    return 'en'; // Default fallback
  };
  
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);
  
  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };
  
  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  useEffect(() => {
    // Update html lang attribute
    document.documentElement.lang = language;
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};