export enum AsetStatus {
    TERSEDIA = 'Tersedia',
    DIPINJAM = 'Dipinjam',
    MAINTENANCE = 'Maintenance'
  }
  
  export const StatusColorMap = {
    [AsetStatus.TERSEDIA]: 'status-tersedia',
    [AsetStatus.DIPINJAM]: 'status-dipinjam',
    [AsetStatus.MAINTENANCE]: 'status-maintenance'
  };