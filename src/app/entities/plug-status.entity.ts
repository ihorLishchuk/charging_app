export interface PlugStatus {
  chargerId: string;
  evId: string | null; // null = unplugged
}
