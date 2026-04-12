/**
 * Serialize BigInt for JSON (e.g., Formasi gaji_min/gaji_max)
 */
export const serializeFormasi = (data: any) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      gaji_min: item.gaji_min ? Number(item.gaji_min) : null,
      gaji_max: item.gaji_max ? Number(item.gaji_max) : null,
    }));
  }
  
  return {
    ...data,
    gaji_min: data.gaji_min ? Number(data.gaji_min) : null,
    gaji_max: data.gaji_max ? Number(data.gaji_max) : null,
  };
};
