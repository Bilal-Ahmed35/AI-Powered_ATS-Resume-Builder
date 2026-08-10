import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { ResumeData } from "@/types/resume";

interface SkillsFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const SkillsForm = ({ data, onChange }: SkillsFormProps) => {
  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const addSkill = (category: 'technical' | 'soft' | 'languages', skill: string) => {
    if (!skill.trim()) return;
    
    onChange({
      ...data,
      skills: {
        ...data.skills,
        [category]: [...data.skills[category], skill.trim()]
      }
    });

    // Clear input based on category
    if (category === 'technical') setNewTechnicalSkill('');
    if (category === 'soft') setNewSoftSkill('');
    if (category === 'languages') setNewLanguage('');
  };

  const removeSkill = (category: 'technical' | 'soft' | 'languages', index: number) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        [category]: data.skills[category].filter((_, i) => i !== index)
      }
    });
  };

  const predefinedTechnicalSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'TypeScript',
    'Java', 'SQL', 'Git', 'AWS', 'Docker', 'MongoDB'
  ];

  const predefinedSoftSkills = [
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork',
    'Time Management', 'Adaptability', 'Critical Thinking', 'Creativity'
  ];

  const predefinedLanguages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
    'Portuguese', 'Arabic', 'Hindi', 'Russian'
  ];

  return (
    <div className="space-y-8">
      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-1.5">
            ✨ AI Skill Recommendation Engine
          </h4>
          <p className="text-xs text-blue-700">
            Let Gemini AI analyze your target role and recommend top industry skills.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={async () => {
            const role = prompt("Enter your target job title (e.g. Frontend Developer, Data Analyst):");
            if (!role) return;
            try {
              const { suggestSkillsForRole } = await import("@/lib/gemini");
              const res = await suggestSkillsForRole(role);
              const newTech = Array.from(new Set([...data.skills.technical, ...res.technical]));
              const newSoft = Array.from(new Set([...data.skills.soft, ...res.soft]));
              onChange({
                ...data,
                skills: {
                  ...data.skills,
                  technical: newTech,
                  soft: newSoft,
                },
              });
            } catch (err: any) {
              alert(err.message || "Skill suggestion failed. Check API key in AI Assist.");
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0"
        >
          Generate AI Skills
        </Button>
      </div>

      {/* Technical Skills */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Technical Skills</Label>
        <div className="flex gap-2">
          <Input
            value={newTechnicalSkill}
            onChange={(e) => setNewTechnicalSkill(e.target.value)}
            placeholder="Enter a technical skill"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill('technical', newTechnicalSkill);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addSkill('technical', newTechnicalSkill)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data.skills.technical.map((skill, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill('technical', index)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Quick add popular skills:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedTechnicalSkills.map((skill) => (
              <Button
                key={skill}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addSkill('technical', skill)}
                className="text-xs h-6"
                disabled={data.skills.technical.includes(skill)}
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Soft Skills */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Soft Skills</Label>
        <div className="flex gap-2">
          <Input
            value={newSoftSkill}
            onChange={(e) => setNewSoftSkill(e.target.value)}
            placeholder="Enter a soft skill"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill('soft', newSoftSkill);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addSkill('soft', newSoftSkill)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data.skills.soft.map((skill, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill('soft', index)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Quick add popular skills:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedSoftSkills.map((skill) => (
              <Button
                key={skill}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addSkill('soft', skill)}
                className="text-xs h-6"
                disabled={data.skills.soft.includes(skill)}
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Languages</Label>
        <div className="flex gap-2">
          <Input
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Enter a language"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill('languages', newLanguage);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addSkill('languages', newLanguage)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data.skills.languages.map((language, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {language}
              <button
                type="button"
                onClick={() => removeSkill('languages', index)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Quick add common languages:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedLanguages.map((language) => (
              <Button
                key={language}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addSkill('languages', language)}
                className="text-xs h-6"
                disabled={data.skills.languages.includes(language)}
              >
                {language}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include skills that are relevant to your target job</li>
          <li>• Be honest about your skill level</li>
          <li>• Include both technical and soft skills for balance</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillsForm;