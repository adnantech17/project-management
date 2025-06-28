export const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isTicketOverdue = (expiryDate: string | null | undefined): boolean => {
  if (!expiryDate) {
    return false;
  }

  return new Date(expiryDate) < new Date();
};

export const isTicketExpiringSoon = (expiryDate: string | null | undefined): boolean => {
  if (!expiryDate) {
    return false;
  }

  const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
  const expiryTime = new Date(expiryDate).getTime();
  const now = Date.now();

  return expiryTime > now && expiryTime <= now + THREE_DAYS_IN_MS;
};

export const isFinalCategory = (categoryName: string): boolean => {
  const finalCategoryNames = ['done', 'completed', 'finished', 'resolved', 'closed'];

  return finalCategoryNames.some(name => 
    categoryName.toLowerCase().includes(name)
  );
};
