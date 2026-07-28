import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Facebook, Instagram, Image as ImageIcon } from 'lucide-react';

const TemplatePreview = ({ formData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {formData.platform === 'facebook' && <Facebook className="h-4 w-4 text-blue-600" />}
            {formData.platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
            <span className="font-medium">{formData.title || 'Template Title'}</span>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-sm mb-2">Template Images</p>
            {formData.mediaPreviews && formData.mediaPreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {formData.mediaPreviews.map((src, index) => (
                        <img key={index} src={src} alt={`preview ${index}`} className="w-full h-full object-cover rounded"/>
                    ))}
                </div>
            ) : (
                <div className="w-full aspect-video bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Platform: {formData.platform || 'Not selected'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;