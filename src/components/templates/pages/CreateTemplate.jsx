import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { sourceKey } from '@/locales/config';
import { useTranslation } from '@/locales/useTranslation';
import AIAssistantForm from '../components/AIAssistantForm';

const CreateTemplate = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { currentTab } = router.query;
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Create Template - ShareAI Platform</title>
        <meta name="description" content="Create new social media templates with AI assistance." />
      </Head>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            //back to previous page
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('createContent', sourceKey.user)}</h1>
            <p className="text-gray-600 mt-1">Design your social media template with AI assistance</p>
          </div>
        </div>

        {/* <form onSubmit={handleSubmit}> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-3">
              {/* <CardHeader>
                  <CardTitle>Template Configuration</CardTitle>
                  <CardDescription>Design your social media template with AI assistance Provide parameters below to generate engaging content using AI.</CardDescription>
                </CardHeader> */}
              <CardContent>
                <AIAssistantForm
                  currentTab={currentTab}
                  toast={toast}
                />
              </CardContent>
            </Card>
          </div>
          {/* PreviewTemplate */}
          {/* <div className="space-y-6">
              <TemplatePreview formData={formData} />

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  Create Template
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/templates')}
                >
                  Cancel
                </Button>
              </div>
            </div> */}
        </div>
        {/* </form> */}
      </div>
    </>
  );
};

export default CreateTemplate;