import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Key, Globe, Bell, Palette, Save, Eye, EyeOff, QrCode, Download, RefreshCw, Share2, Facebook, Instagram, Music, MessageCircle, Smartphone, User, Link as LinkIcon
} from 'lucide-react';

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-black' },
  { id: 'xiaohongshu', name: 'Xiaohongshu', icon: MessageCircle, color: 'text-red-500' }
];

const SettingsPage = () => {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: '',
    businessName: 'ShareAI',
    businessDescription: 'Premium products for modern homes',
    website: 'https://shareai.com',
    businessLocation: '',
    socialMedia: {
      facebook: { enabled: true, url: '' },
      instagram: { enabled: true, url: '' },
      tiktok: { enabled: false, url: '' },
      xiaohongshu: { enabled: false, url: '' }
    },
    notifications: { email: true, push: true, analytics: true },
    branding: { primaryColor: '#10b981', secondaryColor: '#3b82f6', logo: '' }
  });

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(window.location.origin, { width: 256, margin: 2 });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to generate QR code.", variant: "destructive" });
    }
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  const handleRegenerateClick = () => {
    setCountdown(10);
    setIsCountingDown(true);
  };

  const handleConfirmRegenerate = () => {
    generateQRCode();
    toast({ title: "QR Code Regenerated!", description: "A new QR code has been successfully generated." });
  };

  const handleInputChange = (field, value) => setSettings(p => ({ ...p, [field]: value }));
  const handleNestedChange = (parent, field, value) => setSettings(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));
  const handleSocialChange = (platform, field, value) => setSettings(p => ({ ...p, socialMedia: { ...p.socialMedia, [platform]: { ...p.socialMedia[platform], [field]: value } } }));

  const handleSave = (section) => {
    localStorage.setItem('shareai_settings', JSON.stringify(settings));
    toast({ title: "Settings Saved", description: `${section} settings have been updated successfully.` });
  };

  const enabledPlatforms = socialPlatforms.filter(p => settings.socialMedia[p.id].enabled);

  return (
    <>
      <Head>
        <title>Settings - ShareAI Platform</title>
        <meta name="description" content="Configure your platform settings and preferences." />
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your platform preferences and integrations</p>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business">Business Info</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API & AI</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Globe className="h-5 w-5 mr-2" />Business Information</CardTitle>
                <CardDescription>Update your business details for better AI content generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label htmlFor="businessName">Business Name</Label><Input id="businessName" value={settings.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} /></div>
                  <div><Label htmlFor="website">Website URL</Label><Input id="website" type="url" value={settings.website} onChange={(e) => handleInputChange('website', e.target.value)} /></div>
                </div>
                <div><Label htmlFor="businessLocation">Business Location</Label><Input id="businessLocation" value={settings.businessLocation} onChange={(e) => handleInputChange('businessLocation', e.target.value)} placeholder="e.g., City, Country" /></div>
                <div><Label htmlFor="businessDescription">Business Description</Label><Textarea id="businessDescription" rows={3} value={settings.businessDescription} onChange={(e) => handleInputChange('businessDescription', e.target.value)} placeholder="Describe your business..." /></div>

                <Card>
                  <CardHeader><CardTitle className="flex items-center text-lg"><QrCode className="h-5 w-5 mr-2" />QR Code Path</CardTitle></CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    {qrCodeUrl ? <img src={qrCodeUrl} alt="Generated QR Code" className="w-48 h-48 rounded-lg" /> : <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center"><p className="text-gray-500">Generating...</p></div>}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { const a = document.createElement('a'); a.href = qrCodeUrl; a.download = 'shareai-qr-code.png'; a.click(); }}><Download className="w-4 h-4 mr-2" />Download</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline" onClick={handleRegenerateClick}><RefreshCw className="w-4 h-4 mr-2" />Regenerate</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Warning: Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>Regenerating the QR code will invalidate all previously printed codes. Customers scanning old QR codes will not be directed correctly. <a href="#" className="underline">Terms of Use</a></AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setIsCountingDown(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmRegenerate} disabled={isCountingDown}>{isCountingDown ? `Confirm (${countdown})` : 'Confirm'}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center text-lg"><Share2 className="h-5 w-5 mr-2" />Social Media Links</CardTitle><CardDescription>Configure URLs for Share and Follow actions.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    {socialPlatforms.map(platform => (
                      <div key={platform.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${platform.id}-enabled`} className="flex items-center gap-2 font-medium"><platform.icon className={`w-5 h-5 ${platform.color}`} />{platform.name}</Label>
                          <Switch id={`${platform.id}-enabled`} checked={settings.socialMedia[platform.id].enabled} onCheckedChange={(c) => handleSocialChange(platform.id, 'enabled', c)} />
                        </div>
                        {settings.socialMedia[platform.id].enabled && (
                          <div className="space-y-2">
                            <Label htmlFor={`${platform.id}-url`}>Official Page URL</Label>
                            <Input id={`${platform.id}-url`} type="url" placeholder={`https://${platform.id}.com/yourpage`} value={settings.socialMedia[platform.id].url} onChange={(e) => handleSocialChange(platform.id, 'url', e.target.value)} />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button onClick={() => handleSave('Business')} className="w-full"><Save className="h-4 w-4 mr-2" />Save Business Info</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center"><Palette className="h-5 w-5 mr-2" />Branding & Appearance</CardTitle><CardDescription>Customize the look and feel of your sharing page.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="primaryColor">Primary Color</Label><div className="flex items-center space-x-2"><Input id="primaryColor" type="color" value={settings.branding.primaryColor} onChange={(e) => handleNestedChange('branding', 'primaryColor', e.target.value)} className="w-16 h-10 p-1" /><Input value={settings.branding.primaryColor} onChange={(e) => handleNestedChange('branding', 'primaryColor', e.target.value)} /></div></div>
                    <div><Label htmlFor="secondaryColor">Secondary Color</Label><div className="flex items-center space-x-2"><Input id="secondaryColor" type="color" value={settings.branding.secondaryColor} onChange={(e) => handleNestedChange('branding', 'secondaryColor', e.target.value)} className="w-16 h-10 p-1" /><Input value={settings.branding.secondaryColor} onChange={(e) => handleNestedChange('branding', 'secondaryColor', e.target.value)} /></div></div>
                  </div>
                  <div><Label htmlFor="logo">Logo Upload</Label><div className="border-2 border-dashed rounded-lg p-6 text-center"><div className="space-y-2"><Palette className="h-8 w-8 text-gray-400 mx-auto" /><p className="text-sm text-gray-600">Upload your logo</p><Button variant="outline" onClick={() => toast({ title: "🚧 Feature coming soon!" })}>Choose File</Button></div></div></div>
                  <Button onClick={() => handleSave('Branding')} className="w-full"><Save className="h-4 w-4 mr-2" />Save Branding</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Preview</CardTitle><CardDescription>Customer view simulation</CardDescription></CardHeader>
                <CardContent>
                  <div className="w-full max-w-[300px] mx-auto bg-white rounded-[2rem] p-3 shadow-2xl border-4 border-black">
                    <div className="bg-gray-100 rounded-[1.5rem] h-[500px] overflow-y-auto p-4 flex flex-col items-center">
                      <div className="flex flex-col items-center p-4">
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mb-2"><User className="w-8 h-8 text-gray-500" /></div>
                        <p className="font-bold">{settings.businessName}</p>
                        <p className="text-xs text-gray-500 text-center">{settings.businessDescription}</p>
                      </div>
                      <div className="w-full space-y-3 mt-4">
                        {enabledPlatforms.length > 0 ? enabledPlatforms.map(platform => (
                          <Button key={platform.id} variant="outline" className="w-full justify-start">
                            <platform.icon className={`w-5 h-5 mr-3 ${platform.color}`} />
                            Share/Follow on {platform.name}
                          </Button>
                        )) : <p className="text-sm text-center text-gray-500 p-4">No social links enabled.</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Bell className="h-5 w-5 mr-2" />Notification Preferences</CardTitle><CardDescription>Choose how you want to be notified</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg"><div><h4 className="font-medium">Email Notifications</h4><p className="text-sm text-gray-600">Receive updates via email</p></div><Switch checked={settings.notifications.email} onCheckedChange={(c) => handleNestedChange('notifications', 'email', c)} /></div>
                <div className="flex items-center justify-between p-4 border rounded-lg"><div><h4 className="font-medium">Push Notifications</h4><p className="text-sm text-gray-600">Browser push notifications</p></div><Switch checked={settings.notifications.push} onCheckedChange={(c) => handleNestedChange('notifications', 'push', c)} /></div>
                <div className="flex items-center justify-between p-4 border rounded-lg"><div><h4 className="font-medium">Analytics Reports</h4><p className="text-sm text-gray-600">Weekly performance summaries</p></div><Switch checked={settings.notifications.analytics} onCheckedChange={(c) => handleNestedChange('notifications', 'analytics', c)} /></div>
                <Button onClick={() => handleSave('Notifications')} className="w-full"><Save className="h-4 w-4 mr-2" />Save Notifications</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Key className="h-5 w-5 mr-2" />AI Integration Settings</CardTitle><CardDescription>Configure your external LLM API keys</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div><Label htmlFor="apiKey">LLM API Key</Label><div className="relative"><Input id="apiKey" type={showApiKey ? 'text' : 'password'} placeholder="Enter your API key..." value={settings.apiKey} onChange={(e) => handleInputChange('apiKey', e.target.value)} /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowApiKey(!showApiKey)}>{showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div><p className="text-sm text-gray-500">This key will be used to generate AI-powered content</p></div>
                <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-medium text-blue-900 mb-2">Supported AI Providers</h4><ul className="text-sm text-blue-700 space-y-1"><li>• OpenAI GPT-4</li><li>• Anthropic Claude</li><li>• Google Gemini</li></ul></div>
                <Button onClick={() => handleSave('API')} className="w-full"><Save className="h-4 w-4 mr-2" />Save API Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;