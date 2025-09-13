import type { BANNER_MESSAGE_TYPE } from './db-types/bannerMessageType';

export type BannerMessageProps = {
  message: string;
  color?: typeof BANNER_MESSAGE_TYPE;
  onClose: () => void;
};