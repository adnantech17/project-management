import { CreateTicketForm } from "@/types/forms";

const DRAFT_KEY_PREFIX = "ticket_draft_";

export interface DraftData {
  formData: CreateTicketForm;
  timestamp: number;
}

export const saveDraft = (ticketId: string, formData: CreateTicketForm): void => {
  try {
    const draftData: DraftData = {
      formData,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${DRAFT_KEY_PREFIX}${ticketId}`, JSON.stringify(draftData));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
};

export const loadDraft = (ticketId: string): DraftData | null => {
  try {
    const draftString = localStorage.getItem(`${DRAFT_KEY_PREFIX}${ticketId}`);
    if (!draftString) return null;
    
    const draftData: DraftData = JSON.parse(draftString);
    
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (draftData.timestamp < sevenDaysAgo) {
      removeDraft(ticketId);
      return null;
    }
    
    return draftData;
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
};

export const removeDraft = (ticketId: string): void => {
  try {
    localStorage.removeItem(`${DRAFT_KEY_PREFIX}${ticketId}`);
  } catch (error) {
    console.error("Failed to remove draft:", error);
  }
};

export const clearAllDrafts = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(DRAFT_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to clear all drafts:", error);
  }
};

export const hasDraft = (ticketId: string): boolean => {
  return loadDraft(ticketId) !== null;
};

export const getDraftAge = (ticketId: string): number | null => {
  const draft = loadDraft(ticketId);
  if (!draft) return null;
  
  return Date.now() - draft.timestamp;
};

export const formatDraftAge = (age: number): string => {
  const minutes = Math.floor(age / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'Just now';
};
