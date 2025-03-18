/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(value?: number): string {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  /**
   * Format date to DD / MM / YYYY format
   */
  export function formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
  }
  
  /**
   * Convert byte array to base64 image string
   */
  export function byteArrayToImageUrl(byteArray?: number[]): string {
    if (!byteArray || byteArray.length === 0) return '';
    
    // Convert byte array to base64
    const binary = byteArray.map(byte => String.fromCharCode(byte)).join('');
    const base64 = btoa(binary);
    
    // Assume it's a JPEG image, adjust as needed
    return `data:image/jpeg;base64,${base64}`;
  }