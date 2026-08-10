import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Calendar } from "lucide-react";
import { ResumeData, WorkExperience } from "@/types/resume";
import MonthYearPicker from "@/components/ui/calendar";

interface WorkExperienceFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const WorkExperienceForm = ({ data, onChange }: WorkExperienceFormProps) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState<string | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState<string | null>(null);

  // Close pickers when clicking outside of any picker or picker button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // if click is NOT inside popup and NOT inside any date button, close pickers
      if (!target.closest(".month-year-picker-popup") && !target.closest(".date-picker-button")) {
        setShowStartDatePicker(null);
        setShowEndDatePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: [],
      achievements: [],
    };

    onChange({
      ...data,
      workExperience: [...data.workExperience, newExperience],
    });
  };

  // Helper to update multiple fields at once for a single experience
  const setWorkFields = (id: string, updates: Partial<WorkExperience>) => {
    const updatedData = {
      ...data,
      workExperience: data.workExperience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    };
    onChange(updatedData);
  };

  const removeWorkExperience = (id: string) => {
    onChange({
      ...data,
      workExperience: data.workExperience.filter((exp) => exp.id !== id),
    });
  };

  const updateResponsibilities = (id: string, responsibilities: string) => {
    const responsibilitiesList = responsibilities.split("\n").filter((r) => r.trim());
    setWorkFields(id, { responsibilities: responsibilitiesList });
  };

  const updateAchievements = (id: string, achievements: string) => {
    const achievementsList = achievements.split("\n").filter((a) => a.trim());
    setWorkFields(id, { achievements: achievementsList });
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Select Date";
    if (dateString === "Present") return "Present";
    const [year, month] = dateString.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  // Robust month conversion: accepts both 0-based (0..11) and 1-based (1..12) months
  const normalizeMonthNumber = (rawMonth: number | string) => {
    const m = parseInt(String(rawMonth), 10);
    if (!Number.isFinite(m)) return new Date().getMonth() + 1; // fallback to current month (1-based)
    if (m >= 0 && m <= 11) return m + 1; // 0-based -> convert to 1-based
    if (m >= 1 && m <= 12) return m; // already 1-based
    return new Date().getMonth() + 1; // fallback
  };

  // Called when user picks (month, year) or selects "Present"
  const handleDateChange = (
    id: string,
    field: "startDate" | "endDate",
    value: { month: number | string; year: number | string } | "Present"
  ) => {
    if (value === "Present") {
      // set endDate to Present and mark current true only for endDate
      setWorkFields(id, { [field]: "Present", ...(field === "endDate" ? { current: true } : {}) });
    } else {
      const year = String(value.year);
      const monthNum = normalizeMonthNumber(value.month); // 1-based month (1..12)
      const month = String(monthNum).padStart(2, "0");
      const dateString = `${year}-${month}`; // YYYY-MM
      setWorkFields(id, { [field]: dateString, ...(field === "endDate" ? { current: false } : {}) });
    }

    // close corresponding picker
    if (field === "startDate") {
      setShowStartDatePicker(null);
    } else {
      setShowEndDatePicker(null);
    }
  };

  // Convert stored YYYY-MM or Present to MonthYearPicker value:
  // MonthYearPicker commonly expects month 0-based (0..11). We'll give it 0-based to match many implementations.
  // If your picker expects 1-based months, change `month: parseInt(month,10) - 1` to `month: parseInt(month,10)`.
  const parseDateString = (dateString: string) => {
    if (!dateString || dateString === "Present") {
      return { month: new Date().getMonth(), year: new Date().getFullYear() }; // month 0-based
    }
    const [year, month] = dateString.split("-");
    return { month: parseInt(month, 10) - 1, year: parseInt(year, 10) }; // return 0-based month
  };

  const handleCurrentToggle = (id: string, checked: boolean) => {
    if (checked) {
      // mark current and set endDate to Present; also close end picker
      setWorkFields(id, { current: true, endDate: "Present" });
      setShowEndDatePicker(null);
    } else {
      // unset current and clear endDate
      setWorkFields(id, { current: false, endDate: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Work Experience</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addWorkExperience}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </Button>
      </div>

      {data.workExperience.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No work experience entries yet. Click "Add Experience" to get started.
        </div>
      )}

      {data.workExperience.map((exp, index) => (
        <div key={exp.id} className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Experience #{index + 1}</h5>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeWorkExperience(exp.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company *</Label>
              <Input
                value={exp.company}
                onChange={(e) => setWorkFields(exp.id, { company: e.target.value })}
                placeholder="Tech Corp Inc."
              />
            </div>

            <div className="space-y-2">
              <Label>Position *</Label>
              <Input
                value={exp.position}
                onChange={(e) => setWorkFields(exp.id, { position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location *</Label>
            <Input
              value={exp.location}
              onChange={(e) => setWorkFields(exp.id, { location: e.target.value })}
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShowStartDatePicker(showStartDatePicker === exp.id ? null : exp.id)
                  }
                  className="date-picker-button w-full justify-start text-left font-normal h-12 px-4 border-2 hover:border-primary transition-all duration-200"
                >
                  <Calendar className="mr-3 h-4 w-4 text-primary" />
                  {formatDateForDisplay(exp.startDate)}
                </Button>

                {showStartDatePicker === exp.id && (
                  <div className="month-year-picker-popup absolute top-full left-0 z-50 mt-2">
                    <MonthYearPicker
                      value={parseDateString(exp.startDate)}
                      onChange={(value) => handleDateChange(exp.id, "startDate", value)}
                      isEndDate={false}
                      className="w-80 shadow-2xl"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date *</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  disabled={exp.current}
                  onClick={() =>
                    setShowEndDatePicker(showEndDatePicker === exp.id ? null : exp.id)
                  }
                  className={`date-picker-button w-full justify-start text-left font-normal h-12 px-4 border-2 transition-all duration-200 ${
                    exp.current ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "hover:border-primary"
                  }`}
                >
                  <Calendar className="mr-3 h-4 w-4 text-primary" />
                  {formatDateForDisplay(exp.endDate)}
                </Button>

                {!exp.current && showEndDatePicker === exp.id && (
                  <div className="month-year-picker-popup absolute top-full left-0 z-50 mt-2">
                    <MonthYearPicker
                      value={parseDateString(exp.endDate)}
                      onChange={(value) => handleDateChange(exp.id, "endDate", value)}
                      isEndDate={true}
                      className="w-80 shadow-2xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Currently Working Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`current-${exp.id}`}
              checked={!!exp.current}
              onChange={(e) => handleCurrentToggle(exp.id, e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <Label htmlFor={`current-${exp.id}`} className="text-sm font-medium">
              Currently working here
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Key Responsibilities *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!exp.position) {
                    alert("Please enter a Position title first.");
                    return;
                  }
                  try {
                    const { generateBulletPoints } = await import("@/lib/gemini");
                    const bullets = await generateBulletPoints(exp.position, exp.company, exp.responsibilities.join("\n"));
                    setWorkFields(exp.id, { responsibilities: bullets });
                  } catch (err: any) {
                    alert(err.message || "AI generation failed. Please check your Gemini API key in AI Assist.");
                  }
                }}
                className="text-xs flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
              >
                <span>✨ AI Generate Bullets</span>
              </Button>
            </div>
            <Textarea
              value={exp.responsibilities.join("\n")}
              onChange={(e) => updateResponsibilities(exp.id, e.target.value)}
              placeholder={`Developed and maintained web applications
Collaborated with cross-functional teams
Implemented automated testing procedures`}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Each line will be a separate bullet point</p>
          </div>

          <div className="space-y-2">
            <Label>Key Achievements (Optional)</Label>
            <Textarea
              value={(exp.achievements || []).join("\n")}
              onChange={(e) => updateAchievements(exp.id, e.target.value)}
              placeholder={`Increased application performance by 40%
Led team of 5 junior developers
Reduced deployment time by 60%`}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Include quantifiable achievements when possible</p>
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use action verbs to start each responsibility</li>
          <li>• Include specific achievements with numbers</li>
          <li>• Focus on impact and results, not just duties</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkExperienceForm;
