"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  FileImage, 
  Loader2, 
  Eye, 
  Download,
  Trash2,
  AlertCircle,
  Info,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';

interface ReceiptUploadProps {
  onReceiptUploaded?: (receiptData: ReceiptData) => void;
  maxFiles?: number;
  acceptedFormats?: string[];
  className?: string;
}

interface ReceiptData {
  id: string;
  fileName: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
  extractedData?: {
    amount?: number;
    merchant?: string;
    date?: string;
    category?: string;
  };
}

export function ReceiptUpload({ 
  onReceiptUploaded, 
  maxFiles = 5, 
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className 
}: ReceiptUploadProps) {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Simulate file upload process
  const simulateUpload = async (file: File): Promise<ReceiptData> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        setUploadProgress(Math.min(progress, 90));
        
        if (progress >= 90) {
          clearInterval(interval);
          setUploadProgress(100);
          
          // Simulate OCR extraction
          setTimeout(() => {
            const receiptData: ReceiptData = {
              id: Math.random().toString(36).substr(2, 9),
              fileName: file.name,
              fileSize: file.size,
              url: URL.createObjectURL(file),
              uploadedAt: new Date().toISOString(),
              extractedData: {
                amount: Math.floor(Math.random() * 100) + 10,
                merchant: ['Shell Gas Station', 'McDonald\'s', 'Target', 'Walmart', 'Home Depot'][Math.floor(Math.random() * 5)],
                date: new Date().toISOString().split('T')[0],
                category: ['fuel', 'food', 'supplies', 'maintenance', 'equipment'][Math.floor(Math.random() * 5)]
              }
            };
            resolve(receiptData);
          }, 1000);
        }
      }, 200);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;
    
    if (receipts.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!acceptedFormats.includes(file.type)) {
          alert(`File ${file.name} is not a supported format`);
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`File ${file.name} is too large (max 10MB)`);
          continue;
        }
        
        const receiptData = await simulateUpload(file);
        setReceipts(prev => [...prev, receiptData]);
        onReceiptUploaded?.(receiptData);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeReceipt = (id: string) => {
    setReceipts(prev => {
      const receipt = prev.find(r => r.id === id);
      if (receipt?.url) {
        URL.revokeObjectURL(receipt.url);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Receipt Upload
          </CardTitle>
          <CardDescription>
            Upload receipt photos for automatic expense tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gray-100 rounded-full p-3">
                    <Upload className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your receipt photos here
                  </p>
                  <p className="text-sm text-gray-600">
                    or click to browse files
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || receipts.length >= maxFiles}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading || receipts.length >= maxFiles}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Supports JPEG, PNG, WebP • Max {formatFileSize(10 * 1024 * 1024)} per file • Up to {maxFiles} files
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing receipt...</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500">
                  {uploadProgress < 90 ? 'Uploading...' : 'Extracting data...'}
                </p>
              </div>
            )}

            {/* File Input Elements */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Receipts */}
      {receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Uploaded Receipts ({receipts.length})
              </span>
              <Badge variant="secondary">
                {receipts.length}/{maxFiles}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-green-100 rounded-lg p-2">
                        <FileImage className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-medium">{receipt.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(receipt.fileSize)} • Uploaded {new Date(receipt.uploadedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {/* Extracted Data */}
                        {receipt.extractedData && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Data Extracted Successfully
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Amount:</span>
                                <span className="ml-2 font-medium">
                                  {formatCurrency(receipt.extractedData.amount || 0)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Merchant:</span>
                                <span className="ml-2 font-medium">
                                  {receipt.extractedData.merchant}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Date:</span>
                                <span className="ml-2 font-medium">
                                  {receipt.extractedData.date}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Category:</span>
                                <span className="ml-2 font-medium capitalize">
                                  {receipt.extractedData.category?.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(receipt.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = receipt.url;
                          link.download = receipt.fileName;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReceipt(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips for better results:</strong> Ensure receipts are well-lit, flat, and all text is clearly visible. 
          The AI will automatically extract amount, merchant, date, and category information.
        </AlertDescription>
      </Alert>

      {/* Mobile Camera Note */}
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          <strong>Mobile users:</strong> Use the "Take Photo" button to capture receipts directly with your camera. 
          This works best when you align the entire receipt within the camera frame.
        </AlertDescription>
      </Alert>
    </div>
  );
}