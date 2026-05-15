import React, { useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw, Download, Info } from 'lucide-react';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import { motion, AnimatePresence } from 'motion/react';
import { Client } from "@gradio/client";

export default function App() {
  const [mode, setMode] = useState<'restore' | 'age' | 'about'>('restore');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
      setRestoredImage(null); // Reset when new image is uploaded
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
      setRestoredImage(null);
    }
  };

  const triggerProcess = async () => {
    if (!selectedImage || !selectedFile) return;
    setIsProcessing(true);
    
    try {
      if (mode === 'restore') {
        setProcessStep('Connecting to AI model (this may take a few seconds in free tier)...');
        
        // Connect to DeOldify Gradio space for colorization
        const client = await Client.connect("leonelhs/deoldify");
        
        setProcessStep('Analyzing and colorizing photo...');
        
        // Prepare the image file for prediction
        const response_0 = await fetch(selectedImage);
        const blob_0 = await response_0.blob();
        
        const result = await client.predict("/predict", { 
          image: blob_0,
        });

        // Output 0 is the restored image
        console.log(result.data);
        if (result.data && Array.isArray(result.data) && result.data[0]) {
           const outImage = result.data[0];
           setRestoredImage(outImage.url || outImage);
        } else {
           throw new Error("Invalid format returned from AI model");
        }
      } else {
        setProcessStep('Applying vintage effects (Mocking due to lack of specific model)...');
        await new Promise((r) => setTimeout(r, 2000));
        setRestoredImage(selectedImage); // Kept mock for aging mode
      }
    } catch (error) {
      console.error(error);
      alert("Failed to process image. The free space might be busy. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setRestoredImage(null);
  };

  const handleDownload = async () => {
    if (!restoredImage) return;
    try {
      const response = await fetch(restoredImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `time-travel-photo-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to download image:", error);
      // Fallback in case of CORS errors
      const link = document.createElement("a");
      link.href = restoredImage;
      link.download = `time-travel-photo-${Date.now()}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F1] text-[#4A453E] font-sans selection:bg-[#D1CEC7]">
      {/* Header */}
      <header className="border-b border-[#E5E1D8] bg-[#F9F6F1] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7C7464] rounded-full flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight uppercase text-[#2D2A26]">Time Travel Photo</h1>
          </div>
          <nav className="flex gap-8 text-sm font-medium uppercase tracking-widest">
            <button 
              onClick={() => { setMode('restore'); setRestoredImage(null); }} 
              className={mode === 'restore' ? 'text-[#2D2A26] border-b border-[#2D2A26] pb-1 font-bold' : 'text-[#A39A86] hover:text-[#2D2A26] transition-colors pb-1'}
            >
              Restore
            </button>
            <button 
              onClick={() => { setMode('age'); setRestoredImage(null); }} 
              className={mode === 'age' ? 'text-[#2D2A26] border-b border-[#2D2A26] pb-1 font-bold' : 'text-[#A39A86] hover:text-[#2D2A26] transition-colors pb-1'}
            >
              Time Machine
            </button>
            <button 
              onClick={() => { setMode('about'); setRestoredImage(null); }} 
              className={mode === 'about' ? 'text-[#2D2A26] border-b border-[#2D2A26] pb-1 font-bold' : 'text-[#A39A86] hover:text-[#2D2A26] transition-colors pb-1'}
            >
              About
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
        {mode === 'about' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mt-8 mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#2D2A26] mb-8">
              About Time Travel Photo
            </h2>
            <div className="text-[#7C7464] text-lg leading-relaxed flex flex-col gap-6 text-left bg-white p-10 rounded-3xl shadow-sm border border-[#E5E1D8]">
              <p>
                On my website, you can freely use it to breathe new life into old photos and turn modern moments into timeless vintage memories.
              </p>
              <p>
                If you have any questions or suggestions about my webpage, please feel free to contact me at <strong>monster.wbin (at) gmail (dot) com</strong>, thank you for using.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Intro Section */}
            {!selectedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#2D2A26] mb-6">
              {mode === 'restore' ? (
                <>Breathe new life into <br className="hidden md:block" /> old & damaged photos</>
              ) : (
                <>Turn modern moments into <br className="hidden md:block" /> timeless vintage memories</>
              )}
            </h2>
            <p className="text-[#7C7464] text-lg leading-relaxed">
              {mode === 'restore'
                ? 'Upload your black and white or degraded photos. Our AI model will analyze, denoise, and restore them with stunning clarity.'
                : 'Upload your modern photos. Our simulated AI model will apply authentic vintage effects, film grain, and sepia tones to create a nostalgic masterpiece.'
              }
            </p>
          </motion.div>
        )}

        {/* Workspace */}
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {!selectedImage ? (
              // Upload State
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full aspect-[16/9] max-h-[500px] border-2 border-dashed border-[#D1CEC7] rounded-3xl flex flex-col items-center justify-center bg-white hover:bg-[#F2EFE9] transition-colors cursor-pointer group p-8 text-center"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 rounded-full bg-[#F2EFE9] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UploadCloud className="text-[#A39A86]" size={32} />
                </div>
                <h3 className="text-xl font-medium text-[#2D2A26] mb-2">Click or drag to upload</h3>
                <p className="text-[#A39A86] text-sm mb-6">Supports JPG, PNG, TIFF</p>
                <div className="px-6 py-2 rounded-full border border-[#E5E1D8] text-[#4A453E] text-sm font-medium flex items-center gap-2 group-hover:bg-[#E5E1D8] transition-colors">
                  <ImageIcon size={16} /> Select Photo
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </motion.div>
            ) : (
              // Preview & Processing State
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Actions Top Bar */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="flex items-center gap-2 text-sm text-[#7C7464] hover:text-[#2D2A26] transition-colors disabled:opacity-50 uppercase tracking-wider font-bold"
                  >
                    ← Back to upload
                  </button>
                  {restoredImage && (
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-5 py-3 bg-white text-[#2D2A26] shadow-sm rounded-xl text-sm font-bold transition-colors hover:shadow-md"
                    >
                      <Download size={16} /> Download Result
                    </button>
                  )}
                </div>

                {/* Main Visualizer */}
                <div className="w-full bg-[#E5E1D8] p-1 rounded-[44px] shadow-sm">
                  {restoredImage ? (
                    // Result View
                    <BeforeAfterSlider 
                      beforeImage={selectedImage} 
                      afterImage={restoredImage} 
                      afterImageClass={mode === 'age' ? 'grayscale sepia-[0.5] contrast-75 brightness-90' : 'saturate-[1.2] contrast-[1.1] brightness-[1.1]'}
                      beforeLabel={mode === 'age' ? 'Modern' : 'Before'}
                      afterLabel={mode === 'age' ? 'Vintage' : 'After'}
                    />
                  ) : (
                    // Initial Preview View
                    <div className="relative w-full aspect-auto min-h-[400px] max-h-[70vh] rounded-[40px] overflow-hidden bg-[#2D2A26] shadow-2xl flex items-center justify-center">
                      <img 
                        src={selectedImage} 
                        alt="To restore" 
                        className={`w-full h-full object-contain ${isProcessing ? 'opacity-40 grayscale sepia-[0.5]' : ''} transition-all duration-700`}
                      />
                      
                      {/* Processing Overlay text */}
                      {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <RefreshCw className="animate-spin text-[#A39A86] mb-4" size={32} />
                          <div className="text-white font-bold tracking-widest uppercase text-xs mb-1 drop-shadow-md">
                            {mode === 'restore' ? 'Restoring' : 'Aging Process'}
                          </div>
                          <div className="text-[#A39A86] text-xs font-mono drop-shadow-md animate-pulse">
                            {processStep}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                {!restoredImage && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={triggerProcess}
                      disabled={isProcessing}
                      className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-[#7C7464] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#7C746433] transition-all hover:bg-[#686053] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isProcessing ? (
                        <><RefreshCw size={20} className="animate-spin" /> Processing...</>
                      ) : (
                        <><Sparkles size={20} /> {mode === 'restore' ? 'Restore Photo' : 'Make it Vintage'}</>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Note */}
                <div className="w-full mt-4 flex items-start gap-3 p-5 rounded-2xl bg-[#F2EFE9] border border-[#E5E1D8] text-[#7C7464]">
                  <Info className="shrink-0 mt-0.5 text-[#A39A86]" size={18} />
                  <p className="text-sm leading-relaxed">
                    <strong>Demo Mode:</strong> This frontend demonstrates the UI flow for the "Nano Banana" API. Since the real AI computation requires a backend GPU, hitting "Restore" will simulate the loading states and return the original image as a placeholder. Add your backend API endpoint in <code>App.tsx</code> to connect it.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
