import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Download, Eye, Wand2 } from "lucide-react";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import EducationForm from "./forms/EducationForm";
import WorkExperienceForm from "./forms/WorkExperienceForm";
import SkillsForm from "./forms/SkillsForm";
import ProjectsForm from "./forms/ProjectsForm";
import ResumePreview from "./ResumePreview";
import { generatePDF } from "@/lib/pdfGenerator";
import { ResumeData } from "@/types/resume";
import { useToast } from "@/components/ui/use-toast";

import AIAssistModal from "./AIAssistModal";

interface ResumeBuilderProps {
  userType: 'student' | 'employee';
  onBack: () => void;
  initialData?: ResumeData | null;
}

const ResumeBuilder = ({ userType, onBack, initialData }: ResumeBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(initialData || {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedIn: '',
      portfolio: ''
    },
    education: [],
    workExperience: [],
    skills: {
      technical: [],
      soft: [],
      languages: []
    },
    projects: []
  });

  const studentSteps = [
    { title: "Personal Info", component: PersonalInfoForm },
    { title: "Education", component: EducationForm },
    { title: "Skills", component: SkillsForm },
    { title: "Projects", component: ProjectsForm }
  ];

  const employeeSteps = [
    { title: "Personal Info", component: PersonalInfoForm },
    { title: "Work Experience", component: WorkExperienceForm },
    { title: "Education", component: EducationForm },
    { title: "Skills", component: SkillsForm }
  ];

  const steps = userType === 'student' ? studentSteps : employeeSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDownload = () => {
    generatePDF(resumeData);
  };

  const CurrentFormComponent = steps[currentStep].component;

  const { toast } = useToast();

  // Load imported resume data from localStorage when component mounts
  useEffect(() => {
    const importedData = localStorage.getItem('importedResumeData');
    if (importedData) {
      try {
        const parsedData = JSON.parse(importedData);
        setResumeData(parsedData);
        
        // Clear the imported data from localStorage after loading
        localStorage.removeItem('importedResumeData');
        
        // Show success message (non-intrusive)
        toast({
          title: "Resume Data Loaded!",
          description: "Imported details populated. Review and customize as needed.",
        });
        
        console.log('Loaded imported resume data:', parsedData);
      } catch (error) {
        console.error('Error parsing imported resume data:', error);
        toast({
          title: "Error Loading Data",
          description: "There was an error loading your imported resume data.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <AIAssistModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        resumeData={resumeData}
        onUpdateResumeData={setResumeData}
      />
      <div className="container mx-auto px-4 py-4 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-sm lg:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          {/* Desktop Preview Button - Always visible */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-center gap-2 text-base"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            {/* Desktop Download Button - Only in last step */}
            {currentStep === steps.length - 1 && (
              <Button
                onClick={handleDownload}
                className="btn-hero flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            )}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 lg:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-xl lg:text-2xl font-bold">
              {userType === 'student' ? 'Student' : 'Professional'} Resume Builder
            </h2>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 overflow-x-auto">
            {steps.map((step, index) => (
              <span
                key={index}
                className={`text-xs whitespace-nowrap ${
                  index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-elevated p-4 lg:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg lg:text-xl font-semibold">{steps[currentStep].title}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 text-xs lg:text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
              >
                <Wand2 className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">AI Assist</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentFormComponent
                  data={resumeData}
                  onChange={setResumeData}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 lg:mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {/* Hide Next button in last step */}
              {currentStep < steps.length - 1 && (
                <Button
                  onClick={handleNext}
                  className="btn-hero flex items-center justify-center gap-2 text-sm lg:text-base"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Mobile Preview and Download Section - Below Form */}
            <div className="lg:hidden mt-6 space-y-3">
              {/* Mobile Preview Button */}
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              
              {/* Mobile Download Button - Only in last step */}
              {currentStep === steps.length - 1 && (
                <Button
                  onClick={handleDownload}
                  className="btn-hero w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </motion.div>

          {/* Preview Section */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="card-elevated p-4 lg:p-8 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
              >
                <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Live Preview</h3>
                <div className="transform scale-75 lg:scale-100 origin-top">
                  <ResumePreview data={resumeData} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;