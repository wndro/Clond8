import { useState } from "react";
import { useStorage } from "@/hooks/useStorage";
import { useLanguage } from "@/hooks/useLanguage";
import StorageUsage from "@/components/StorageUsage";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, Moon, Sun, Globe, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Settings = () => {
  const [, navigate] = useLocation();
  const { formattedTotal } = useStorage();
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-1">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">{t('nav.settings')}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-20">
        <Card className="mb-4 mt-4">
          <CardHeader>
            <CardTitle>{t('settings.account')}</CardTitle>
            <CardDescription>{t('settings.account_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-lg font-semibold">U</span>
                </div>
                <div>
                  <p className="font-medium">User</p>
                  <p className="text-sm text-gray-500">user@example.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {t('action.edit')}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('storage.plan')}</p>
                <p className="text-sm text-gray-500">{t('storage.free_plan')} ({formattedTotal})</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                {t('action.upgrade')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t('settings.preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Moon className="h-5 w-5 text-gray-500" />
                <p>{t('settings.dark_mode')}</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5 text-gray-500" />
                <p>{t('settings.language')}</p>
              </div>
              <Select 
                value={language} 
                onValueChange={(value) => setLanguage(value as 'en' | 'pt-BR')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt-BR">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-gray-500" />
                <p>{t('settings.notifications')}</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t('settings.privacy')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="h-5 w-5 text-gray-500" />
                <p>{t('settings.privacy_settings')}</p>
              </div>
              <Button variant="ghost" size="sm">
                {t('action.view_all')}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="h-5 w-5 text-gray-500" />
                <p>{t('settings.security_settings')}</p>
              </div>
              <Button variant="ghost" size="sm">
                {t('action.view_all')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t('settings.help')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <p>{t('settings.help_center')}</p>
              </div>
              <Button variant="ghost" size="sm">
                {t('action.visit')}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <p>{t('settings.contact_support')}</p>
              </div>
              <Button variant="ghost" size="sm">
                {t('action.contact')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Button variant="destructive" className="w-full mb-8">
          <LogOut className="h-4 w-4 mr-2" /> {t('action.sign_out')}
        </Button>
        
        <div className="text-center text-sm text-gray-500 mb-6">
          <p>CloudStore v1.0.0</p>
          <p>{t('settings.copyright')}</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Settings;
