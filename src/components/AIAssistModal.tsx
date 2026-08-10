import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Wand2, Key, Sparkles, Check, Copy, Loader2, Lightbulb, FileText, Code } from "lucide-react";
import {
  getApiKey,
  setApiKey,
  generateBulletPoints,
  generateProfessionalSummary,
  suggestSkillsForRole,
} from "@/lib/gemini";
import { ResumeData } from "@/types/resume";

interface AIAssistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  onUpdateResumeData: (data: ResumeData) => void;
  defaultTab?: "bullets" | "summary" | "skills" | "key";
}

export default function AIAssistModal({
  open,
  onOpenChange,
  resumeData,
  onUpdateResumeData,
  defaultTab = "bullets",
}: AIAssistModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Bullet Point State
  const [bulletRole, setBulletRole] = useState<string>("");
  const [bulletCompany, setBulletCompany] = useState<string>("");
  const [bulletNotes, setBulletNotes] = useState<string>("");
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [loadingBullets, setLoadingBullets] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Summary State
  const [summaryRole, setSummaryRole] = useState<string>("");
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  // Skills State
  const [skillsRole, setSkillsRole] = useState<string>("");
  const [suggestedSkills, setSuggestedSkills] = useState<{ technical: string[]; soft: string[] }>({
    technical: [],
    soft: [],
  });
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false);

  useEffect(() => {
    const currentKey = getApiKey();
    setHasApiKey(Boolean(currentKey));
    setApiKeyInput(currentKey);

    // Auto-fill defaults from current resume state if available
    const lastExp = resumeData.workExperience[0];
    if (lastExp) {
      setBulletRole(lastExp.position || "");
      setBulletCompany(lastExp.company || "");
      setSummaryRole(lastExp.position || "");
      setSkillsRole(lastExp.position || "");
    }
  }, [open, resumeData]);

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    const key = getApiKey();
    setHasApiKey(Boolean(key));
    toast({
      title: "API Key Saved",
      description: key
        ? "Your Gemini API key has been stored securely for this session."
        : "Gemini API key cleared.",
    });
  };

  const handleGenerateBullets = async () => {
    if (!bulletRole.trim()) {
      toast({
        title: "Job Title Required",
        description: "Please enter a target job title to generate bullet points.",
        variant: "destructive",
      });
      return;
    }
    setLoadingBullets(true);
    try {
      const bullets = await generateBulletPoints(bulletRole, bulletCompany, bulletNotes);
      setGeneratedBullets(bullets);
      toast({
        title: "Bullets Generated! ✨",
        description: "ATS-optimized bullet points generated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate bullet points. Please check your API key.",
        variant: "destructive",
      });
      setActiveTab("key");
    } finally {
      setLoadingBullets(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!summaryRole.trim()) {
      toast({
        title: "Target Role Required",
        description: "Please enter your target role.",
        variant: "destructive",
      });
      return;
    }
    setLoadingSummary(true);
    try {
      const allSkills = [...resumeData.skills.technical, ...resumeData.skills.soft];
      const summary = await generateProfessionalSummary(
        resumeData.personalInfo.fullName,
        summaryRole,
        allSkills,
        resumeData.workExperience.length > 0 ? "professional" : "student"
      );
      setGeneratedSummary(summary);
      toast({
        title: "Summary Generated! 📝",
        description: "Professional profile summary crafted by AI.",
      });
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate summary.",
        variant: "destructive",
      });
      setActiveTab("key");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSuggestSkills = async () => {
    if (!skillsRole.trim()) {
      toast({
        title: "Job Role Required",
        description: "Please enter a role to fetch skill recommendations.",
        variant: "destructive",
      });
      return;
    }
    setLoadingSkills(true);
    try {
      const res = await suggestSkillsForRole(skillsRole);
      setSuggestedSkills(res);
      toast({
        title: "Skills Suggested! 💡",
        description: "Found top technical and soft skills for this role.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to Fetch Skills",
        description: err.message || "Skill suggestion failed.",
        variant: "destructive",
      });
      setActiveTab("key");
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleApplyBulletsToExperience = () => {
    if (generatedBullets.length === 0) return;
    const updatedExp = [...resumeData.workExperience];

    if (updatedExp.length > 0) {
      updatedExp[0] = {
        ...updatedExp[0],
        responsibilities: [...updatedExp[0].responsibilities, ...generatedBullets],
      };
    } else {
      updatedExp.push({
        id: `${Date.now()}`,
        company: bulletCompany || "Company Name",
        position: bulletRole || "Position",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: generatedBullets,
        achievements: [],
      });
    }

    onUpdateResumeData({ ...resumeData, workExperience: updatedExp });
    toast({
      title: "Applied to Resume!",
      description: "Bullet points added to your work experience.",
    });
    onOpenChange(false);
  };

  const handleAddSkillToResume = (skill: string, type: "technical" | "soft") => {
    const existing = resumeData.skills[type];
    if (existing.includes(skill)) {
      toast({ title: "Already Included", description: `"${skill}" is already in your skills list.` });
      return;
    }
    onUpdateResumeData({
      ...resumeData,
      skills: {
        ...resumeData.skills,
        [type]: [...existing, skill],
      },
    });
    toast({ title: "Skill Added", description: `Added "${skill}" to your ${type} skills.` });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Copied!", description: "Copied to clipboard." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Resume Assistant (Google Gemini)
          </DialogTitle>
          <DialogDescription>
            Generate ATS-friendly bullet points, professional summaries, and skills in seconds.
          </DialogDescription>
        </DialogHeader>

        {!hasApiKey && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-xs flex items-center justify-between gap-2">
            <span>
              <strong>Note:</strong> Gemini API key is missing. Enter your free API key in the <strong>API Key</strong> tab below.
            </span>
            <Button size="sm" variant="outline" onClick={() => setActiveTab("key")}>
              Setup Key
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="bullets" className="text-xs sm:text-sm flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5" />
              Bullets
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-xs sm:text-sm flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs sm:text-sm flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="key" className="text-xs sm:text-sm flex items-center gap-1">
              <Key className="w-3.5 h-3.5" />
              API Key
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BULLET POINTS */}
          <TabsContent value="bullets" className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bulletRole">Job Title / Role</Label>
                <Input
                  id="bulletRole"
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  value={bulletRole}
                  onChange={(e) => setBulletRole(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bulletCompany">Company Name (Optional)</Label>
                <Input
                  id="bulletCompany"
                  placeholder="e.g. TechCorp, Google"
                  value={bulletCompany}
                  onChange={(e) => setBulletCompany(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bulletNotes">Raw Duties or Achievements (Optional)</Label>
              <Textarea
                id="bulletNotes"
                placeholder="e.g. Built a dashboard using React, led team of 3 developers, improved page load speed"
                value={bulletNotes}
                onChange={(e) => setBulletNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button
              onClick={handleGenerateBullets}
              disabled={loadingBullets}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center gap-2"
            >
              {loadingBullets ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loadingBullets ? "Generating ATS Bullets..." : "Generate ATS Bullet Points"}
            </Button>

            {generatedBullets.length > 0 && (
              <div className="space-y-3 mt-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">Generated Bullet Points</h4>
                  <Button size="sm" onClick={handleApplyBulletsToExperience} variant="secondary">
                    Apply All to Resume
                  </Button>
                </div>
                <div className="space-y-2">
                  {generatedBullets.map((b, idx) => (
                    <div key={idx} className="bg-slate-50 border rounded-lg p-3 text-sm flex items-start justify-between gap-2">
                      <p className="flex-1 text-gray-700">{b}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(b, idx)}
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: PROFESSIONAL SUMMARY */}
          <TabsContent value="summary" className="space-y-4 py-2">
            <div>
              <Label htmlFor="summaryRole">Target Job Title</Label>
              <Input
                id="summaryRole"
                placeholder="e.g. Frontend Developer, Product Manager"
                value={summaryRole}
                onChange={(e) => setSummaryRole(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center gap-2"
            >
              {loadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {loadingSummary ? "Writing Summary..." : "Generate Professional Summary"}
            </Button>

            {generatedSummary && (
              <div className="space-y-3 border-t pt-4">
                <Label>Generated Profile Summary</Label>
                <div className="bg-slate-50 border rounded-lg p-4 text-sm text-gray-800 relative">
                  {generatedSummary}
                </div>
                <Button
                  onClick={() => {
                    copyToClipboard(generatedSummary, 999);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Summary to Clipboard
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: SKILLS RECOMMENDER */}
          <TabsContent value="skills" className="space-y-4 py-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter job role (e.g., Data Analyst, Fullstack Developer)"
                value={skillsRole}
                onChange={(e) => setSkillsRole(e.target.value)}
              />
              <Button onClick={handleSuggestSkills} disabled={loadingSkills}>
                {loadingSkills ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                Find Skills
              </Button>
            </div>

            {suggestedSkills.technical.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Technical Skills (Click + to add)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.technical.map((s, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 border-blue-200 text-blue-800 py-1.5 px-3 text-xs flex items-center gap-1"
                        onClick={() => handleAddSkillToResume(s, "technical")}
                      >
                        + {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Soft Skills (Click + to add)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.soft.map((s, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-emerald-50 border-emerald-200 text-emerald-800 py-1.5 px-3 text-xs flex items-center gap-1"
                        onClick={() => handleAddSkillToResume(s, "soft")}
                      >
                        + {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 4: API KEY SETTINGS */}
          <TabsContent value="key" className="space-y-4 py-2">
            <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                Google Gemini API Key
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get a free API key instantly at{" "}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  Google AI Studio (aistudio.google.com)
                </a>
                . No credit card required.
              </p>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <Button onClick={handleSaveApiKey} className="w-full">
                  Save API Key
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
