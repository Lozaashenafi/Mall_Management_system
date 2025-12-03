export const generateTrackingNumber = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
  return `EXIT-${datePart}-${randomPart}`;
};

// Optional: Export default as well
export default {
  generateTrackingNumber,
};
