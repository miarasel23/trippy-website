import { RentalDriverBid } from '@/features/trips/types/customerApi';

/**
 * Bengali Digit Converter: maps ASCII 0-9 to Bengali numerals
 */
export function toBanglaDigits(str: string | number): string {
  const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const bangla = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(english[i], bangla[i]);
  }
  return res;
}

/**
 * Formats monetary amounts with Indian numbering system and currency symbol
 */
export function formatFare(amount: number | string, isBn: boolean): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const formatted = Math.round(num).toLocaleString('en-IN');
  return isBn ? `৳ ${toBanglaDigits(formatted)}` : `BDT ${formatted}`;
}

/**
 * Compares two driver bid arrays to detect actual changes (length, amounts, status, ratings, photos)
 */
export function hasDriverBidsChanged(
  prev: RentalDriverBid[],
  next: RentalDriverBid[]
): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i++) {
    const nb = next[i];
    const nId =
      nb.rent_bid_uuid ||
      nb.rentBidUuid ||
      nb.uuid ||
      nb.driver_uuid ||
      nb.driverUuid ||
      `bid-${i}`;
    const pb = prev.find((b) => {
      const pId =
        b.rent_bid_uuid ||
        b.rentBidUuid ||
        b.uuid ||
        b.driver_uuid ||
        b.driverUuid ||
        '';
      return pId === nId;
    });
    if (!pb) return true;
    if (Number(pb.bid_amount || 0) !== Number(nb.bid_amount || 0)) return true;
    if (Number(pb.total_amount || 0) !== Number(nb.total_amount || 0)) return true;
    if (Number(pb.insurance_charge_amount || 0) !== Number(nb.insurance_charge_amount || 0)) return true;
    if (pb.bid_status !== nb.bid_status) return true;
    if (Number(pb.average_rating || 0) !== Number(nb.average_rating || 0)) return true;
    if ((pb.rating_list?.length || 0) !== (nb.rating_list?.length || 0)) return true;
    if ((pb.car_photos?.length || 0) !== (nb.car_photos?.length || 0)) return true;
  }
  return false;
}

/**
 * Checks whether seen drivers list has changed
 */
export function hasSeenDriversChanged(
  prev: Array<{ driver_uuid?: string; name?: string; profile_picture?: string }>,
  next: Array<{ driver_uuid?: string; name?: string; profile_picture?: string }>
): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i++) {
    const nd = next[i];
    const pd = prev.find((d) => d.driver_uuid === nd.driver_uuid);
    if (!pd) return true;
  }
  return false;
}

/**
 * Retrieves persisted creation timestamp by trip UUID from storage
 */
export function getPersistedCreatedAt(uuid?: string): string | undefined {
  if (!uuid || typeof window === 'undefined') return undefined;
  try {
    return (
      localStorage.getItem(`trippy_trip_created_${uuid}`) ||
      sessionStorage.getItem(`trippy_trip_created_${uuid}`) ||
      undefined
    );
  } catch {
    return undefined;
  }
}

/**
 * Persists trip creation timestamp by trip UUID to storage
 */
export function persistCreatedAt(uuid?: string, createdAt?: string): void {
  if (!uuid || !createdAt || typeof window === 'undefined') return;
  try {
    localStorage.setItem(`trippy_trip_created_${uuid}`, createdAt);
    sessionStorage.setItem(`trippy_trip_created_${uuid}`, createdAt);
  } catch {}
}
