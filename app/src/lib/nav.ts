import { router } from 'expo-router';

export const openService = (id: string) => router.push({ pathname: '/service/[id]', params: { id } });
export const openBooking = (code: string) => router.push({ pathname: '/booking/[code]', params: { code } });
