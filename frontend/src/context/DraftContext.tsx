import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DraftContextType {
  getDescription: (ticketId: string, backendDescription: string) => string;
  updateDescription: (ticketId: string, description: string, backendDescription: string) => void;
  clearDraft: (ticketId: string) => void;
  clearAllDrafts: () => void;
  isDraft: (ticketId: string, backendDescription: string) => boolean;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getDraftKey = (ticketId: string) => `ticket_draft_${ticketId}`;

  const getDescription = (ticketId: string, backendDescription: string): string => {
    if (!ticketId) return backendDescription || "";
    
    try {
      const draft = localStorage.getItem(getDraftKey(ticketId));
      return draft || backendDescription || "";
    } catch {
      return backendDescription || "";
    }
  };

  const updateDescription = (ticketId: string, description: string, backendDescription: string) => {
    if (!ticketId) return;
    
    try {
      if (description === backendDescription || description === "") {
        localStorage.removeItem(getDraftKey(ticketId));
      } else {
        localStorage.setItem(getDraftKey(ticketId), description);
      }
    } catch (e) {
      console.error("Failed to save draft:", e);
    }
  };

  const clearDraft = (ticketId: string) => {
    if (!ticketId) return;
    try {
      localStorage.removeItem(getDraftKey(ticketId));
    } catch (e) {
      console.error("Failed to clear draft:", e);
    }
  };

  const clearAllDrafts = () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("ticket_draft_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error("Failed to clear all drafts:", e);
    }
  };

  const isDraft = (ticketId: string, backendDescription: string): boolean => {
    if (!ticketId) return false;
    
    try {
      const draft = localStorage.getItem(getDraftKey(ticketId));
      return draft !== null && draft !== backendDescription;
    } catch {
      return false;
    }
  };

  return (
    <DraftContext.Provider value={{
      getDescription,
      updateDescription,
      clearDraft,
      clearAllDrafts,
      isDraft,
    }}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = (): DraftContextType => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useDraft must be used within a DraftProvider");
  }
  return context;
};
