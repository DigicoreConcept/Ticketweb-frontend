"use client";

import { useEventBuilderStore } from "@/lib/store/eventBuilderStore";
import { CustomQuestion } from "@/lib/schema/eventTied";
import { useState } from "react";
import { Plus, Trash2, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import FormSection from "@/components/ui/FormSection";
import { toast } from "@/lib/store/toastStore";

const inputClass = `
  w-full px-4 py-3 rounded-xl text-white placeholder-white/30 font-medium text-sm outline-none
  transition-all duration-200
  bg-white/5 border border-white/10
  focus:border-orange-500/70 focus:bg-white/8 focus:ring-2 focus:ring-orange-500/20
`;

const labelClass = "block text-xs font-bold tracking-widest uppercase text-white/50 mb-2";

import { updateEvent } from "@/lib/api";

export default function StepQuestions() {
  const { customQuestions, updateCustomQuestions, setStep, eventId } = useEventBuilderStore();

  const [label, setLabel] = useState("");
  const [type, setType] = useState<"text" | "select" | "checkbox">("text");
  const [optionsInput, setOptionsInput] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleNavigate = async (targetStep: number) => {
    if (eventId) {
      try {
        setIsSaving(true);
        await updateEvent(eventId, { custom_questions: customQuestions });
      } catch (err) {
        console.error(err);
        toast.error("Failed to save questionnaire. Please try again.");
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }
    setStep(targetStep);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      toast.error("Question label is required");
      return;
    }

    const newQuestion: CustomQuestion = {
      id: Math.random().toString(36).substring(2, 9),
      label: label.trim(),
      type,
      is_required: isRequired,
      options: type === "select" ? optionsInput.split(",").map(o => o.trim()).filter(Boolean) : undefined,
    };

    updateCustomQuestions([...customQuestions, newQuestion]);
    
    // Reset form
    setLabel("");
    setType("text");
    setOptionsInput("");
    setIsRequired(false);
    toast.success("Question added successfully!");
  };

  const handleRemoveQuestion = (id: string) => {
    updateCustomQuestions(customQuestions.filter(q => q.id !== id));
    toast.success("Question removed");
  };

  return (
    <div className="grid gap-8">
      <div className="p-0 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <FormSection title="Create Attendee Question" description="Gather custom information from guests at checkout (e.g. dietary restrictions, t-shirt size).">
          <form onSubmit={handleAddQuestion} className="space-y-5">
            <div>
              <label className={labelClass}>Question Text</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Do you have any dietary restrictions?"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Answer Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="text" className="text-amber-950">Short Text Answer</option>
                  <option value="select" className="text-amber-950">Multiple Choice Select</option>
                  <option value="checkbox" className="text-amber-950">Yes/No Checkbox Toggle</option>
                </select>
              </div>

              {type === "select" && (
                <div>
                  <label className={labelClass}>Options (Comma separated)</label>
                  <input
                    type="text"
                    value={optionsInput}
                    onChange={(e) => setOptionsInput(e.target.value)}
                    placeholder="e.g. Vegetarian, Vegan, Gluten-Free"
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Required Field</p>
                <p className="text-xs text-white/40">Force the attendee to answer this question before checkout</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all bg-primary/20 text-primary hover:bg-primary hover:text-white"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </form>
        </FormSection>

        {/* Existing Questions List */}
        <FormSection title="Configured Questionnaire">
          {customQuestions.length === 0 ? (
            <div className="text-center py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6 text-neutral-500" />
              </div>
              <h4 className="text-sm font-medium text-white/70">No custom questions</h4>
              <p className="text-xs text-neutral-500 mt-1">General checkouts will only ask for Name and Email.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customQuestions.map((q, idx) => (
                <div key={q.id} className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-white/[0.03]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded mr-2">Q#{idx + 1}</span>
                    <span className="text-sm font-bold text-white">{q.label}</span>
                    <div className="flex gap-3 text-[10px] text-white/40 mt-1 uppercase tracking-wide font-medium">
                      <span>Type: {q.type}</span>
                      <span>•</span>
                      <span>{q.is_required ? "Required" : "Optional"}</span>
                      {q.options && q.options.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="normal-case">Options: {q.options.join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-6 border-t border-white/5">
          <button
            disabled={isSaving}
            type="button"
            onClick={() => handleNavigate(2)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            disabled={isSaving}
            type="button"
            onClick={() => handleNavigate(4)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] bg-orange-700 text-white disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Next: Media"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
